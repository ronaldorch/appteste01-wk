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

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Gerar JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

// Verificar JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Buscar usuário por email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await query(
      "SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = $1",
      [email],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return null
  }
}

// Criar novo usuário
export async function createUser(name: string, email: string, password: string): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password)
    const result = await query(
      `INSERT INTO users (name, email, password_hash, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING id, name, email, created_at, updated_at`,
      [name, email, hashedPassword],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return null
  }
}

// Autenticar usuário
export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const result = await query(
      "SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = $1",
      [email],
    )

    const user = result.rows[0]
    if (!user) return null

    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) return null

    const { password_hash, ...userWithoutPassword } = user
    const token = generateToken(userWithoutPassword)

    return { user: userWithoutPassword, token }
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return null
  }
}
