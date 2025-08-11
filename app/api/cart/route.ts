export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { getCartItems, addToCart, clearCart } from "@/lib/marketplace"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const items = await getCartItems(Number.parseInt(userId))
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 })
    }

    const success = await addToCart(Number.parseInt(userId), productId, quantity)

    if (!success) {
      return NextResponse.json({ error: "Não foi possível adicionar ao carrinho" }, { status: 400 })
    }

    return NextResponse.json({ message: "Produto adicionado ao carrinho" })
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    await clearCart(Number.parseInt(userId))
    return NextResponse.json({ message: "Carrinho limpo com sucesso" })
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
