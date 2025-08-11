import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  console.log("🚀 === LOGIN API CALLED ===")

  try {
    const { email, password } = await request.json()

    console.log("📝 Login attempt:", { email })

    // Validação básica
    if (!email || !password) {
      console.log("❌ Missing credentials")
      return NextResponse.json({ success: false, error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Autenticar usuário
    console.log("🔐 Authenticating user...")
    const user = await authenticateUser(email, password)

    if (!user) {
      console.log("❌ Authentication failed")
      return NextResponse.json({ success: false, error: "Email ou senha inválidos" }, { status: 401 })
    }

    // Gerar token
    const token = generateToken(user)

    console.log("✅ Login successful for:", user.email)

    // Criar resposta com cookie
    const response = NextResponse.json({
      success: true,
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Definir cookie do token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return response
  } catch (error: any) {
    console.log("❌ Login error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
