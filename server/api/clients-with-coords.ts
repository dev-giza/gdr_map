import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineEventHandler(async (event) => {
  try {
    const data = await readFile(
      join(__dirname, "../clients_with_coords.json"),
      "utf-8"
    );
    return JSON.parse(data);
  } catch {
    return [];
  }
});
