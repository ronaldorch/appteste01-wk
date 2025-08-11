// Forçar uso do Node.js runtime
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"

const USE_DATABASE = process.env.DB_HOST && process.env.DB_HOST !== "localhost"

// Dados em memória para fallback (sincronizado com register)
const users = [
  {
    id: 1,
    name: "Usuário Demo",
    email: "demo@exemplo.com",
    password: "123456",
  },
  {
    id: 2,
    name: "Admin Sistema",
    email: "admin@sistema.com",
    password: "admin123",
  },
]

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Iniciando login...")

    const { email, password } = await request.json()
    console.log("📋 Tentativa de login:", { email, password: "***" })

    if (!email || !password) {
      console.log("❌ Campos obrigatórios faltando")
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    if (USE_DATABASE) {
      console.log("🗄️ Tentando usar banco de dados...")
      try {
        const { authenticateUser } = await import("@/lib/auth")
        const result = await authenticateUser(email, password)

        if (!result) {
          console.log("❌ Credenciais inválidas no banco")
          return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
        }

        console.log("✅ Login bem-sucedido no banco")
        return NextResponse.json({
          message: "Login realizado com sucesso",
          user: result.user,
          token: result.token,
        })
      } catch (dbError) {
        console.error("❌ Erro no banco, usando fallback:", dbError)
        // Continuar com dados em memória se houver erro no banco
      }
    }

    console.log("💾 Usando dados em memória...")

    // Usar dados em memória (fallback)
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      console.log("❌ Credenciais inválidas na memória")
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const { password: _, ...userWithoutPassword } = user
    console.log("✅ Login bem-sucedido na memória:", { email })

    return NextResponse.json({
      message: "Login realizado com sucesso",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("❌ Erro geral no login:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
