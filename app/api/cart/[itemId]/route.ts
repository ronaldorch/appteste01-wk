export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { updateCartItem } from "@/lib/marketplace"

export async function PUT(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const { quantity } = await request.json()

    if (quantity < 0) {
      return NextResponse.json({ error: "Quantidade inválida" }, { status: 400 })
    }

    const success = await updateCartItem(Number.parseInt(userId), Number.parseInt(params.itemId), quantity)

    if (!success) {
      return NextResponse.json({ error: "Não foi possível atualizar item" }, { status: 400 })
    }

    return NextResponse.json({ message: "Item atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar item do carrinho:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
