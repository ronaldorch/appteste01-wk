import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { testConnection } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 === LOGIN API CALLED ===")

    // Test database connection first
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error("❌ Database connection failed")
      return NextResponse.json({ error: "Erro de conexão com o banco de dados" }, { status: 500 })
    }

    const { email, password } = await request.json()
    console.log("🔐 Login attempt:", { email })

    // Basic validation
    if (!email || !password) {
      console.log("❌ Missing credentials")
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Authenticate user
    console.log("🔍 Authenticating user...")
    const authResult = await authenticateUser(email, password)

    if (!authResult) {
      console.log("❌ Authentication failed")
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    console.log("✅ Login successful:", authResult.user.id)

    // Create response with cookie
    const response = NextResponse.json({
      message: "Login realizado com sucesso",
      user: authResult.user,
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("💥 Login error:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
