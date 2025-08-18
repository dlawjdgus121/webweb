import oracledb from "oracledb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Instant Client와 Wallet 절대경로 지정
oracledb.initOracleClient({
  libDir: process.env.ORACLE_CLIENT_PATH!, // Instant Client 경로
  
  configDir: process.env.TNS_ADMIN,
});

export const oracleConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PW,
  connectString: process.env.ORACLE_CONNECT, // tnsnames.ora의 alias
};

export async function getConnection() {
  return await oracledb.getConnection(oracleConfig);
}

export default oracledb;
