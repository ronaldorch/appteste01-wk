import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const template_id = searchParams.get("template_id")
    const status = searchParams.get("status")

    let queryText = `
      SELECT 
        p.*,
        pt.name as template_name,
        pt.genetics,
        pt.strain_type,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN product_templates pt ON p.template_id = pt.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramCount = 0

    if (template_id) {
      paramCount++
      queryText += ` AND p.template_id = $${paramCount}`
      params.push(template_id)
    }

    if (status) {
      paramCount++
      queryText += ` AND p.status = $${paramCount}`
      params.push(status)
    }

    queryText += ` ORDER BY p.created_at DESC`

    const result = await query(queryText, params)

    const products = result.rows.map((product) => ({
      ...product,
      price: Number.parseFloat(product.price) || 0,
      stock_quantity: Number.parseInt(product.stock_quantity) || 0,
    }))

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
    })
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      template_id,
      name,
      description,
      price,
      stock_quantity,
      unit,
      extraction_type,
      batch_number,
      harvest_date,
      test_results,
      category_id,
      user_id,
      slug,
      featured,
      auto_deactivate,
    } = body

    const result = await query(
      `INSERT INTO products (
        template_id, name, description, price, stock_quantity, unit, extraction_type,
        batch_number, harvest_date, test_results, category_id, user_id, slug,
        featured, auto_deactivate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        template_id,
        name,
        description,
        price,
        stock_quantity,
        unit,
        extraction_type,
        batch_number,
        harvest_date,
        test_results,
        category_id,
        user_id,
        slug,
        featured,
        auto_deactivate,
      ],
    )

    return NextResponse.json({
      success: true,
      product: result.rows[0],
    })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
