import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("🔍 Fetching product:", id)

    const result = await query(
      `
      SELECT 
        p.*, 
        gt.name as template_name, 
        gt.category as template_category,
        gt.effects, gt.flavors, gt.medical_uses
      FROM products p
      LEFT JOIN genetic_templates gt ON p.template_id = gt.id
      WHERE p.id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    console.log("✅ Product found:", result.rows[0])
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("❌ Error fetching product:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("📝 Updating product:", id)

    const body = await request.json()
    const { name, extraction_type, price, stock_grams, description, is_active } = body

    // Generate new slug if name changed
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    const result = await query(
      `
      UPDATE products SET
        name = $2,
        slug = $3,
        extraction_type = $4,
        price = $5,
        stock_grams = $6,
        description = $7,
        is_active = $8,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [
        id,
        name,
        slug,
        extraction_type,
        Number.parseFloat(price),
        Number.parseFloat(stock_grams),
        description || "",
        is_active !== undefined ? is_active : Number.parseFloat(stock_grams) > 0,
      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    console.log("✅ Product updated:", result.rows[0])
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("❌ Error updating product:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("🗑️ Deleting product:", id)

    const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    console.log("✅ Product deleted:", result.rows[0])
    return NextResponse.json({ message: "Produto deletado com sucesso" })
  } catch (error) {
    console.error("❌ Error deleting product:", error)
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 })
  }
}
