export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { getDashboardStats, getTopProducts, getRecentOrders } from "@/lib/marketplace"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const [stats, topProducts, recentOrders] = await Promise.all([
      getDashboardStats(Number.parseInt(userId)),
      getTopProducts(Number.parseInt(userId)),
      getRecentOrders(Number.parseInt(userId)),
    ])

    return NextResponse.json({
      stats,
      topProducts,
      recentOrders,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
