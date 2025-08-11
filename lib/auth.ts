import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: Date
}

export async function hashPassword(password: string): Promise<string> {
  console.log("🔐 Hashing password...")
  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(password, salt)
  console.log("✅ Password hashed successfully")
  return hashedPassword
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  console.log("🔍 Verifying password...")
  const isValid = await bcrypt.compare(password, hashedPassword)
  console.log(`✅ Password verification: ${isValid ? "SUCCESS" : "FAILED"}`)
  return isValid
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  console.log("🔐 Creating user:", { name, email })

  const hashedPassword = await hashPassword(password)

  const result = await query(
    "INSERT INTO users (name, email, password, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, role, created_at",
    [name, email, hashedPassword, "user"],
  )

  console.log("✅ User created successfully:", result.rows[0])
  return result.rows[0]
}

export async function findUserByEmail(email: string): Promise<User | null> {
  console.log("🔍 Finding user by email:", email)

  const result = await query("SELECT id, name, email, role, created_at FROM users WHERE email = $1", [email])

  const user = result.rows[0] || null
  console.log("👤 User found:", user ? "Yes" : "No user found")
  return user
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  console.log("🔐 Authenticating user:", email)

  const result = await query("SELECT id, name, email, password, role, created_at FROM users WHERE email = $1", [email])

  if (result.rows.length === 0) {
    console.log("❌ User not found")
    return null
  }

  const user = result.rows[0]
  const isValidPassword = await verifyPassword(password, user.password)

  if (!isValidPassword) {
    console.log("❌ Invalid password")
    return null
  }

  console.log("✅ User authenticated successfully")
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  }
}

export function generateToken(user: User): string {
  console.log("🎫 Generating JWT token for user:", user.email)
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.log("❌ Invalid token:", error)
    return null
  }
}
