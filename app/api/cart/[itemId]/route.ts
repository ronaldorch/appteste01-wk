export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { updateCartItem } from "@/lib/marketplace"

export async function PATCH(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const { quantity } = await request.json()
    const itemId = Number.parseInt(params.itemId)

    if (!itemId || quantity < 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const success = await updateCartItem(Number.parseInt(userId), itemId, quantity)

    if (!success) {
      return NextResponse.json({ error: "Não foi possível atualizar o item" }, { status: 400 })
    }

    return NextResponse.json({ message: "Item atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar item do carrinho:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const itemId = Number.parseInt(params.itemId)

    if (!itemId) {
      return NextResponse.json({ error: "ID do item inválido" }, { status: 400 })
    }

    const success = await updateCartItem(Number.parseInt(userId), itemId, 0) // 0 = remove

    if (!success) {
      return NextResponse.json({ error: "Não foi possível remover o item" }, { status: 400 })
    }

    return NextResponse.json({ message: "Item removido com sucesso" })
  } catch (error) {
    console.error("Erro ao remover item do carrinho:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
