import { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";

export default defineEventHandler(async (event) => {
  // Читаем clients.csv
  const csvData = await readFile("clients.csv", "utf-8");
  // Парсим CSV
  const records = parse(csvData, { columns: false, skip_empty_lines: true });

  // Берем первые 10 строк (пропускаем заголовок, если есть)
  const sample = records.slice(0, 10).map((row: string[]) => {
    // Имя, фамилия, адрес
    const name = row[1]?.trim() || "";
    const surname = row[2]?.trim() || "";
    const address = row[8];
    const state = row[9];
    const city = row[10];
    const zip = row[11];
    return {
      name,
      surname,
      address: `${address}, ${city}, ${state}, ${zip}`
        .replace(/, ,/g, ",")
        .replace(/, $/, ""),
    };
  });

  return sample;
});
