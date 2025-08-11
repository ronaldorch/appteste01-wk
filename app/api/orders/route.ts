export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { createOrderFromCart, getUserOrders } from "@/lib/marketplace"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const orders = await getUserOrders(Number.parseInt(userId))
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const customerData = await request.json()

    // Validações
    if (!customerData.name || !customerData.email || !customerData.address || !customerData.city) {
      return NextResponse.json({ error: "Dados obrigatórios não preenchidos" }, { status: 400 })
    }

    const orderId = await createOrderFromCart(Number.parseInt(userId), customerData)

    if (!orderId) {
      return NextResponse.json({ error: "Não foi possível criar o pedido" }, { status: 400 })
    }

    return NextResponse.json({ orderId, message: "Pedido criado com sucesso" })
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
