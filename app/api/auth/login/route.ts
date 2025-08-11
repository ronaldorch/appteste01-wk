import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { testConnection } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOGIN API CALLED ===")

    // Test database connection first
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error("Database connection failed")
      return NextResponse.json({ error: "Erro de conexão com o banco de dados" }, { status: 500 })
    }

    const { email, password } = await request.json()
    console.log("Login attempt:", { email, passwordLength: password?.length })

    // Basic validation
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Authenticate user
    console.log("Authenticating user...")
    const authResult = await authenticateUser(email, password)

    if (!authResult) {
      console.log("Authentication failed")
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 })
    }

    console.log("User authenticated successfully:", authResult.user.id)
    return NextResponse.json({
      message: "Login realizado com sucesso",
      user: authResult.user,
      token: authResult.token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
