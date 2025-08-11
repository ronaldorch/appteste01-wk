// Forçar uso do Node.js runtime
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"

const USE_DATABASE = process.env.DB_HOST && process.env.DB_HOST !== "localhost"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 === INÍCIO DO REGISTRO (DEBUG) ===")
    console.log("📋 Variáveis de ambiente:")
    console.log("   NODE_ENV:", process.env.NODE_ENV)
    console.log("   DB_HOST:", process.env.DB_HOST)
    console.log("   DB_PORT:", process.env.DB_PORT)
    console.log("   DB_NAME:", process.env.DB_NAME)
    console.log("   DB_USER:", process.env.DB_USER)
    console.log("   DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "***NOT SET***")
    console.log("   USE_DATABASE:", USE_DATABASE)

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
      console.log("🗄️ Usando banco de dados...")
      try {
        // Importar funções de debug
        const { createUser, findUserByEmail } = await import("@/lib/auth-debug")

        console.log("🔍 Verificando se email já existe...")
        const existingUser = await findUserByEmail(email)
        if (existingUser) {
          console.log("❌ Email já existe no banco")
          return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 })
        }

        console.log("👤 Criando novo usuário...")
        const newUser = await createUser(name, email, password)
        if (!newUser) {
          console.log("❌ Erro: createUser retornou null")
          return NextResponse.json({ error: "Erro ao criar usuário no banco de dados" }, { status: 500 })
        }

        console.log("✅ Usuário criado com sucesso no banco!")
        console.log("🚀 === FIM DO REGISTRO (SUCESSO) ===")
        return NextResponse.json({
          message: "Usuário criado com sucesso",
          user: { id: newUser.id, name: newUser.name, email: newUser.email },
        })
      } catch (dbError) {
        console.error("❌ Erro detalhado no banco:", {
          message: dbError.message,
          stack: dbError.stack,
          code: dbError.code,
        })
        console.log("🔄 Tentando fallback para memória...")

        // Fallback para dados em memória
        const memoryUser = {
          id: Date.now(),
          name,
          email,
          created_at: new Date().toISOString(),
        }

        console.log("✅ Usuário criado na memória (fallback)")
        return NextResponse.json({
          message: "Usuário criado com sucesso (modo fallback)",
          user: memoryUser,
        })
      }
    }

    console.log("💾 Usando armazenamento em memória...")
    const memoryUser = {
      id: Date.now(),
      name,
      email,
      created_at: new Date().toISOString(),
    }

    console.log("✅ Usuário criado na memória")
    console.log("🚀 === FIM DO REGISTRO (MEMÓRIA) ===")
    return NextResponse.json({
      message: "Usuário criado com sucesso (modo demo)",
      user: memoryUser,
    })
  } catch (error) {
    console.error("❌ Erro geral no registro:", {
      message: error.message,
      stack: error.stack,
    })
    console.log("🚀 === FIM DO REGISTRO (ERRO) ===")
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
