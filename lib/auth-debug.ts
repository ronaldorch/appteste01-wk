import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface User {
  id: number
  name: string
  email: string
  created_at: Date
  updated_at: Date
}

// Hash da senha com logs
export async function hashPassword(password: string): Promise<string> {
  try {
    console.log("🔐 Iniciando hash da senha...")
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log("✅ Hash da senha criado com sucesso")
    return hashedPassword
  } catch (error) {
    console.error("❌ Erro ao fazer hash da senha:", error)
    throw error
  }
}

// Verificar senha com logs
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    console.log("🔍 Verificando senha...")
    const isValid = await bcrypt.compare(password, hashedPassword)
    console.log("✅ Verificação de senha:", isValid ? "VÁLIDA" : "INVÁLIDA")
    return isValid
  } catch (error) {
    console.error("❌ Erro ao verificar senha:", error)
    return false
  }
}

// Gerar JWT token
export function generateToken(user: User): string {
  try {
    console.log("🎫 Gerando JWT token para usuário:", user.email)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )
    console.log("✅ JWT token gerado com sucesso")
    return token
  } catch (error) {
    console.error("❌ Erro ao gerar JWT token:", error)
    throw error
  }
}

// Buscar usuário por email com logs detalhados
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    console.log("🔍 Buscando usuário por email:", email)
    const result = await query(
      "SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = $1",
      [email],
    )

    if (result.rows.length > 0) {
      console.log("✅ Usuário encontrado:", { id: result.rows[0].id, email: result.rows[0].email })
      return result.rows[0]
    } else {
      console.log("ℹ️ Usuário não encontrado para email:", email)
      return null
    }
  } catch (error) {
    console.error("❌ Erro ao buscar usuário:", error)
    throw error
  }
}

// Criar novo usuário com logs detalhados
export async function createUser(name: string, email: string, password: string): Promise<User | null> {
  try {
    console.log("👤 Iniciando criação de usuário:", { name, email })

    // 1. Fazer hash da senha
    console.log("🔐 Fazendo hash da senha...")
    const hashedPassword = await hashPassword(password)
    console.log("✅ Hash da senha concluído")

    // 2. Inserir no banco
    console.log("💾 Inserindo usuário no banco...")
    const result = await query(
      `INSERT INTO users (name, email, password_hash, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING id, name, email, created_at, updated_at`,
      [name, email, hashedPassword],
    )

    if (result.rows.length > 0) {
      console.log("✅ Usuário criado com sucesso:", {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
      })
      return result.rows[0]
    } else {
      console.log("❌ Nenhuma linha retornada após inserção")
      return null
    }
  } catch (error) {
    console.error("❌ Erro detalhado ao criar usuário:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    })
    throw error
  }
}

// Autenticar usuário com logs detalhados
export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    console.log("🔐 Iniciando autenticação para:", email)

    const result = await query(
      "SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = $1",
      [email],
    )

    const user = result.rows[0]
    if (!user) {
      console.log("❌ Usuário não encontrado para autenticação:", email)
      return null
    }

    console.log("✅ Usuário encontrado, verificando senha...")
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      console.log("❌ Senha inválida para usuário:", email)
      return null
    }

    const { password_hash, ...userWithoutPassword } = user
    const token = generateToken(userWithoutPassword)

    console.log("✅ Autenticação bem-sucedida para:", email)
    return { user: userWithoutPassword, token }
  } catch (error) {
    console.error("❌ Erro na autenticação:", error)
    throw error
  }
}
