import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./database"

export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface AuthResult {
  user: User
  token: string
}

export async function createUser(name: string, email: string, password: string): Promise<User | null> {
  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await query(
      "INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email, created_at",
      [name, email, hashedPassword],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return null
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await query("SELECT id, name, email, created_at FROM users WHERE email = $1", [email])
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthResult | null> {
  try {
    const result = await query("SELECT id, name, email, password FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return null
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    }
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return null
  }
}
