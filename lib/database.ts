import { Pool } from "pg"

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "azure_site",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Função para testar conexão
export async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query("SELECT NOW()")
    client.release()
    console.log("✅ Conexão com banco de dados estabelecida:", result.rows[0])
    return true
  } catch (error) {
    console.error("❌ Erro ao conectar com banco de dados:", error)
    return false
  }
}

// Função para executar queries
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Query executada:", { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("Erro na query:", { text, error })
    throw error
  }
}

export default pool
