import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { stock_quantity, price, status, extraction_type, batch_number } = body

    const result = await query(
      `UPDATE products 
       SET stock_quantity = $1, price = $2, status = $3, extraction_type = $4, 
           batch_number = $5, updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [stock_quantity, price, status, extraction_type, batch_number, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: result.rows[0],
    })
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Produto removido com sucesso",
    })
  } catch (error) {
    console.error("Erro ao remover produto:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
