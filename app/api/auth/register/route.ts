import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Verificar se o usuário já existe
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe com este email" }, { status: 409 })
    }

    // Criar novo usuário
    const newUser = await createUser(name, email, password)

    if (!newUser) {
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
    }

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
    console.error("Erro no registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
