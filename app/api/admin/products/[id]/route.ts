import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("🔍 Fetching product:", id)

    const result = await query(
      `SELECT 
        p.*, 
        gt.name as template_name, gt.type as template_type, gt.category as template_category,
        gt.effects, gt.flavors, gt.medical_uses
      FROM products p
      LEFT JOIN genetic_templates gt ON p.template_id = gt.id
      WHERE p.id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    console.log("✅ Product found:", result.rows[0].name)
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("❌ Error fetching product:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("🗑️ Deleting product:", id)

    const result = await query("DELETE FROM products WHERE id = $1 RETURNING id", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    console.log("✅ Product deleted:", id)
    return NextResponse.json({ message: "Produto deletado com sucesso" })
  } catch (error) {
    console.error("❌ Error deleting product:", error)
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 })
  }
}
