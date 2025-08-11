import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/auth"
import { testConnection } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("=== REGISTER API CALLED ===")

    // Test database connection first
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error("Database connection failed")
      return NextResponse.json({ error: "Erro de conexão com o banco de dados" }, { status: 500 })
    }

    const { name, email, password } = await request.json()
    console.log("Registration attempt:", { name, email, passwordLength: password?.length })

    // Basic validation
    if (!name || !email || !password) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("Password too short")
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Check if user already exists
    console.log("Checking if user exists...")
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json({ error: "Usuário já existe com este email" }, { status: 409 })
    }

    // Create new user
    console.log("Creating new user...")
    const newUser = await createUser(name, email, password)

    if (!newUser) {
      console.error("Failed to create user")
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
    }

    console.log("User created successfully:", newUser.id)
    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
