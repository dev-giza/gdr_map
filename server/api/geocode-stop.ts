import { writeFile, readFile } from "fs/promises";

let isRunning = false;
try {
  // Если воркер уже стартовал, импортируем его переменную
  isRunning = (global as any).__geocode_isRunning || false;
} catch {}

export default defineEventHandler(async (event) => {
  (global as any).__geocode_isRunning = false;
  // Также обновим clients_geocode_progress.json
  try {
    const progressRaw = await readFile(
      "clients_geocode_progress.json",
      "utf-8"
    );
    const progress = JSON.parse(progressRaw);
    progress.running = false;
    await writeFile(
      "clients_geocode_progress.json",
      JSON.stringify(progress, null, 2),
      "utf-8"
    );
  } catch {}
  return { stopped: true };
});
