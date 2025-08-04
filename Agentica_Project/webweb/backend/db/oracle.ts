import oracledb from "oracledb";
import dotenv from "dotenv";
dotenv.config();

oracledb.initOracleClient({ libDir: 'C:\\Users\\gram\\Desktop\\oracle\\instantclient_23_8' });

export const oracleConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PW,
  connectString: process.env.ORACLE_CONN_STR,
};

export async function getConnection() {
  return await oracledb.getConnection(oracleConfig);
}
