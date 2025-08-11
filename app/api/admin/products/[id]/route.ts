import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { stock_grams, price_per_gram, active, reason } = await request.json()

    // Get current product data
    const currentProduct = await query("SELECT * FROM products WHERE id = $1", [id])
    if (currentProduct.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
    }

    const oldStock = Number.parseFloat(currentProduct.rows[0].stock_grams)
    const newStock = Number.parseFloat(stock_grams)

    // Update product
    const result = await query(
      `
      UPDATE products 
      SET stock_grams = $1, price_per_gram = $2, is_active = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `,
      [newStock, price_per_gram, active, id],
    )

    // Log stock change if different
    if (oldStock !== newStock) {
      await query(
        `
        INSERT INTO stock_history (product_id, change_type, quantity_change, previous_stock, new_stock, reason)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          id,
          newStock > oldStock ? "add" : "remove",
          Math.abs(newStock - oldStock),
          oldStock,
          newStock,
          reason || "Manual update via admin panel",
        ],
      )
    }

    return NextResponse.json({ success: true, product: result.rows[0] })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, error: "Erro ao atualizar produto" }, { status: 500 })
  }
}
