import { readFile, writeFile } from "fs/promises";
import { parse } from "csv-parse/sync";

let isRunning = false;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "vimap-geocoder/1.0" },
  });
  const data = await res.json();
  if (data && data[0]) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }
  return null;
}

async function runGeocode() {
  isRunning = true;
  console.log("[geocode] runGeocode вызван");
  try {
    const csvData = await readFile("clients.csv", "utf-8");
    console.log("[geocode] clients.csv успешно прочитан");
    const records = parse(csvData, { columns: false, skip_empty_lines: true });
    let coordsArr = [];
    let progress = { current: 0, total: records.length, running: true };

    // Пробуем загрузить прогресс
    let progressLoaded = false;
    try {
      const coordsRaw = await readFile("clients_with_coords.json", "utf-8");
      coordsArr = JSON.parse(coordsRaw);
      console.log(
        `[geocode] Загружено ${coordsArr.length} уже обработанных клиентов`
      );
    } catch (e) {
      console.log("[geocode] Не удалось прочитать clients_with_coords.json", e);
    }
    try {
      const progressRaw = await readFile(
        "clients_geocode_progress.json",
        "utf-8"
      );
      progress = JSON.parse(progressRaw);
      progressLoaded = true;
      console.log(
        `[geocode] Прогресс: current=${progress.current}, total=${progress.total}, running=${progress.running}`
      );
    } catch (e) {
      console.log(
        "[geocode] Не удалось прочитать clients_geocode_progress.json",
        e
      );
      // Если файла прогресса нет, но есть coordsArr, определяем current
      if (coordsArr.length > 0) {
        progress.current = coordsArr.length;
        progress.total = records.length;
        progress.running = false;
        console.log(
          `[geocode] Восстановлен прогресс по длине массива: current=${progress.current}`
        );
      }
    }

    for (let i = progress.current; i < records.length; i++) {
      // Проверяем флаг из файла на каждом шаге
      try {
        const progressRaw = await readFile(
          "clients_geocode_progress.json",
          "utf-8"
        );
        const latestProgress = JSON.parse(progressRaw);
        if (latestProgress.running === false) {
          console.log(`[geocode] Остановлено на клиенте #${i}`);
          break;
        }
      } catch {}

      const row = records[i];
      const id = row[0];
      const first_name = row[1];
      const last_name = row[2];
      const client_company_name = row[3];
      const email_address = row[4];
      const primary_phone = row[5];
      const created = row[6];
      const secondary_phone = row[7];
      const address = row[8];
      const state = row[9];
      const city = row[10];
      const zip = row[11];
      const ad_group = row[12];
      const wo_paperwork = row[13];
      const fullAddress = `${address}, ${city}, ${state}, ${zip}`
        .replace(/, ,/g, ",")
        .replace(/, $/, "");
      if (!address) continue;
      let coords = null;
      try {
        coords = await geocode(fullAddress);
      } catch (e) {
        console.error(`[geocode] Ошибка геокодирования: ${fullAddress}`, e);
        coords = null;
      }
      coordsArr.push({
        id,
        first_name,
        last_name,
        client_company_name,
        email_address,
        primary_phone,
        created,
        secondary_phone,
        address: fullAddress,
        ad_group,
        wo_paperwork,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
      });
      progress.current = i + 1;
      progress.running = true;
      if ((i + 1) % 10 === 0 || i === records.length - 1) {
        console.log(
          `[geocode] Прогресс: ${progress.current} / ${progress.total}`
        );
      }
      await writeFile(
        "clients_with_coords.json",
        JSON.stringify(coordsArr, null, 2),
        "utf-8"
      );
      await writeFile(
        "clients_geocode_progress.json",
        JSON.stringify(progress, null, 2),
        "utf-8"
      );
      await sleep(1100);
    }
    progress.running = false;
    await writeFile(
      "clients_geocode_progress.json",
      JSON.stringify(progress, null, 2),
      "utf-8"
    );
    isRunning = false;
    console.log("[geocode] Процесс завершён.");
  } catch (e) {
    console.error("[geocode] Ошибка в runGeocode:", e);
    isRunning = false;
  }
}

export default defineEventHandler(async (event) => {
  console.log("[geocode] Handler вызван");
  // Проверяем прогресс из файла
  let running = false;
  try {
    const progressRaw = await readFile(
      "clients_geocode_progress.json",
      "utf-8"
    );
    const progress = JSON.parse(progressRaw);
    running = !!progress.running;
    console.log(`[geocode] Статус из файла: running=${running}`);
  } catch (e) {
    console.log(
      "[geocode] Не удалось прочитать clients_geocode_progress.json в handler",
      e
    );
  }
  if (running) {
    isRunning = true;
    console.log("[geocode] Уже запущен, повторный старт невозможен.");
    return { started: false, message: "Already running" };
  }
  isRunning = false; // сбрасываем переменную, если процесс реально не идёт
  console.log("[geocode] Запуск процесса по запросу...");
  setTimeout(() => {
    runGeocode();
  }, 0);
  return { started: true };
});
