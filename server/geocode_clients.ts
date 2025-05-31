import { readFile, writeFile } from "fs/promises";
import { parse } from "csv-parse/sync";

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

async function main() {
  const csvData = await readFile("clients.csv", "utf-8");
  const records = parse(csvData, { columns: false, skip_empty_lines: true });
  const result = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const name = row[1]?.trim() || "";
    const surname = row[2]?.trim() || "";
    const address = row[8];
    const state = row[9];
    const city = row[10];
    const zip = row[11];
    const fullAddress = `${address}, ${city}, ${state}, ${zip}`
      .replace(/, ,/g, ",")
      .replace(/, $/, "");
    if (!address) continue;
    let coords = null;
    try {
      coords = await geocode(fullAddress);
    } catch (e) {
      console.error("Ошибка геокодирования:", fullAddress, e);
    }
    result.push({
      name,
      surname,
      address: fullAddress,
      lat: coords?.lat || null,
      lng: coords?.lng || null,
    });
    console.log(
      `[${i + 1}/${records.length}] ${name} ${surname} — ${fullAddress} =>`,
      coords ? `${coords.lat},${coords.lng}` : "нет координат"
    );
    await sleep(1100); // 1.1 секунда между запросами
  }

  await writeFile(
    "clients_with_coords.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  );
  console.log("Готово! Сохранено в clients_with_coords.json");
}

main();
