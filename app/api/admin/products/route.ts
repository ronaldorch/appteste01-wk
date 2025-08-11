import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        gt.name as template_name,
        gt.category,
        gt.type as template_type
      FROM products p
      JOIN genetic_templates gt ON p.template_id = gt.id
      ORDER BY p.created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      template_id,
      name,
      slug,
      extraction_type,
      price_per_gram,
      stock_grams,
      minimum_order,
      maximum_order,
      batch_number,
      harvest_date,
      lab_tested,
      lab_results,
    } = await request.json()

    const result = await query(
      `
      INSERT INTO products (
        template_id, name, slug, extraction_type, price_per_gram, stock_grams,
        minimum_order, maximum_order, batch_number, harvest_date, lab_tested, lab_results
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
      [
        template_id,
        name,
        slug,
        extraction_type,
        price_per_gram,
        stock_grams,
        minimum_order,
        maximum_order,
        batch_number,
        harvest_date,
        lab_tested,
        lab_results,
      ],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
