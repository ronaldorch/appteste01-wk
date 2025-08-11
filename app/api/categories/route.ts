import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM categories 
      ORDER BY name ASC
    `)

    return NextResponse.json({
      categories: result.rows,
    })
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
