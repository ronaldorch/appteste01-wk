import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { stock_grams, price_per_gram, active, reason } = body
    const productId = params.id

    // Buscar estoque atual
    const currentProduct = await query("SELECT stock_grams FROM products WHERE id = $1", [productId])

    if (currentProduct.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    const previousStock = currentProduct.rows[0].stock_grams

    // Atualizar produto
    const result = await query(
      `
      UPDATE products 
      SET stock_grams = $1, price_per_gram = $2, active = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
      [stock_grams, price_per_gram, active, productId],
    )

    // Registrar no histórico se o estoque mudou
    if (stock_grams !== previousStock) {
      await query(
        `
        INSERT INTO stock_history (
          product_id, change_type, quantity_grams, 
          previous_stock, new_stock, reason
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          productId,
          stock_grams > previousStock ? "add" : "remove",
          Math.abs(stock_grams - previousStock),
          previousStock,
          stock_grams,
          reason || "Manual update via admin panel",
        ],
      )
    }

    return NextResponse.json({
      success: true,
      product: result.rows[0],
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    await query("DELETE FROM products WHERE id = $1", [productId])

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
  }
}
