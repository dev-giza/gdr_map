import { readFile } from "fs/promises";

export default defineEventHandler(async (event) => {
  let progress = { current: 0, total: 0, running: false };
  try {
    const progressRaw = await readFile(
      "clients_geocode_progress.json",
      "utf-8"
    );
    progress = JSON.parse(progressRaw);
  } catch {}
  return progress;
});
