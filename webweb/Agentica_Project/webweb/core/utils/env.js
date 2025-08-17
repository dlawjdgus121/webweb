// core/utils/env.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ✅ 경로를 확실히 지정해줌
dotenv.config({ path: path.resolve(__dirname, "../../backend/.env") });
