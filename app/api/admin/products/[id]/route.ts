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
        gt.type as template_type,
        gt.category as template_category,
        gt.effects as template_effects,
        gt.flavors as template_flavors,
        gt.medical_uses as template_medical_uses
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
    return NextResponse.json({ product: result.rows[0] })
  } catch (error) {
    console.error("❌ Error fetching product:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { stock_grams, operation } = await request.json()

    console.log("📦 Updating stock for product:", id, { stock_grams, operation })

    if (!stock_grams || !operation) {
      return NextResponse.json({ error: "Quantidade e operação são obrigatórias" }, { status: 400 })
    }

    let updateQuery = ""
    const newStock = Number.parseFloat(stock_grams)

    if (operation === "add") {
      updateQuery = `
        UPDATE products 
        SET stock_grams = stock_grams + $2,
            is_active = CASE WHEN stock_grams + $2 > 0 THEN true ELSE false END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `
    } else if (operation === "subtract") {
      updateQuery = `
        UPDATE products 
        SET stock_grams = GREATEST(0, stock_grams - $2),
            is_active = CASE WHEN stock_grams - $2 > 0 THEN true ELSE false END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `
    } else if (operation === "set") {
      updateQuery = `
        UPDATE products 
        SET stock_grams = $2,
            is_active = CASE WHEN $2 > 0 THEN true ELSE false END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `
    } else {
      return NextResponse.json({ error: "Operação inválida" }, { status: 400 })
    }

    const result = await query(updateQuery, [id, newStock])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Registrar histórico de estoque
    await query(
      `
      INSERT INTO stock_history (product_id, operation, quantity, previous_stock, new_stock)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [
        id,
        operation,
        newStock,
        operation === "set" ? 0 : result.rows[0].stock_grams - newStock,
        result.rows[0].stock_grams,
      ],
    )

    console.log("✅ Stock updated:", result.rows[0])
    return NextResponse.json({ product: result.rows[0] })
  } catch (error) {
    console.error("❌ Error updating stock:", error)
    return NextResponse.json({ error: "Erro ao atualizar estoque" }, { status: 500 })
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

    console.log("✅ Product deleted")
    return NextResponse.json({ message: "Produto removido com sucesso" })
  } catch (error) {
    console.error("❌ Error deleting product:", error)
    return NextResponse.json({ error: "Erro ao remover produto" }, { status: 500 })
  }
}
