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
    console.log("Creating user:", { name, email })
    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await query(
      "INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email, created_at",
      [name, email, hashedPassword],
    )

    console.log("User created successfully:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    console.log("Finding user by email:", email)
    const result = await query("SELECT id, name, email, created_at FROM users WHERE email = $1", [email])
    console.log("User found:", result.rows[0] || "No user found")
    return result.rows[0] || null
  } catch (error) {
    console.error("Error finding user:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthResult | null> {
  try {
    console.log("Authenticating user:", email)
    const result = await query("SELECT id, name, email, password FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      console.log("User not found")
      return null
    }

    const user = result.rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      console.log("Invalid password")
      return null
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    console.log("User authenticated successfully")
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
    console.error("Error authenticating user:", error)
    return null
  }
}
