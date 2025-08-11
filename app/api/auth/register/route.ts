import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  console.log("🚀 === REGISTER API CALLED ===")

  try {
    const { name, email, password } = await request.json()

    console.log("📝 Registration attempt:", {
      name,
      email,
      passwordLength: password?.length,
    })

    // Validação básica
    if (!name || !email || !password) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ success: false, error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("❌ Password too short")
      return NextResponse.json({ success: false, error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Verificar se usuário já existe
    console.log("🔍 Checking if user exists...")
    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      console.log("❌ User already exists")
      return NextResponse.json({ success: false, error: "Usuário já existe com este email" }, { status: 409 })
    }

    // Criar usuário
    console.log("👤 Creating new user...")
    const user = await createUser(name, email, password)

    console.log("✅ User created successfully:", user.email)
    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.log("❌ Error creating user:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
