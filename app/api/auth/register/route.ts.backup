// Forçar uso do Node.js runtime
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"

const USE_DATABASE = process.env.DB_HOST && process.env.DB_HOST !== "localhost"

// Simulação de armazenamento em memória (para desenvolvimento)
const memoryUsers: any[] = [
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
    console.log("📝 Iniciando registro de usuário...")

    const body = await request.json()
    const { name, email, password } = body

    console.log("📋 Dados recebidos:", { name, email, password: "***" })

    // Validação básica
    if (!name || !email || !password) {
      console.log("❌ Campos obrigatórios faltando")
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("❌ Senha muito curta")
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Email inválido")
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    if (USE_DATABASE) {
      console.log("🗄️ Tentando usar banco de dados...")
      try {
        const { createUser, findUserByEmail } = await import("@/lib/auth")

        const existingUser = await findUserByEmail(email)
        if (existingUser) {
          console.log("❌ Email já existe no banco")
          return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 })
        }

        const newUser = await createUser(name, email, password)
        if (!newUser) {
          console.log("❌ Erro ao criar usuário no banco")
          return NextResponse.json({ error: "Erro ao criar usuário no banco de dados" }, { status: 500 })
        }

        console.log("✅ Usuário criado no banco com sucesso")
        return NextResponse.json({
          message: "Usuário criado com sucesso",
          user: { id: newUser.id, name: newUser.name, email: newUser.email },
        })
      } catch (dbError) {
        console.error("❌ Erro no banco, usando fallback:", dbError)
        // Continuar com dados em memória se houver erro no banco
      }
    }

    console.log("💾 Usando armazenamento em memória...")

    // Verificar se email já existe na memória
    const existingUser = memoryUsers.find((u) => u.email === email)
    if (existingUser) {
      console.log("❌ Email já existe na memória")
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 })
    }

    // Criar novo usuário na memória
    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // Em produção, use hash
      created_at: new Date().toISOString(),
    }

    memoryUsers.push(newUser)
    console.log("✅ Usuário criado na memória:", { id: newUser.id, name, email })

    return NextResponse.json({
      message: "Usuário criado com sucesso (modo demo)",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    })
  } catch (error) {
    console.error("❌ Erro geral no registro:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

// Endpoint para listar usuários (apenas para debug)
export async function GET() {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({
      message: "Usuários em memória (apenas desenvolvimento)",
      users: memoryUsers.map((u) => ({ id: u.id, name: u.name, email: u.email })),
    })
  }

  return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
}
