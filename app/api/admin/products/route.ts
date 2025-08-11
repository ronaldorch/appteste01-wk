import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        gt.name as template_name,
        gt.category as strain_type,
        gt.type as template_type
      FROM products p
      LEFT JOIN genetic_templates gt ON p.template_id = gt.id
      ORDER BY p.created_at DESC
    `)

    const products = result.rows.map((product) => ({
      ...product,
      price_per_gram: Number.parseFloat(product.price_per_gram) || 0,
      stock_grams: Number.parseFloat(product.stock_grams) || 0,
      thc_percentage: Number.parseFloat(product.thc_percentage) || 0,
      cbd_percentage: Number.parseFloat(product.cbd_percentage) || 0,
    }))

    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      template_id,
      name,
      extraction_type,
      price_per_gram,
      stock_grams,
      thc_percentage,
      cbd_percentage,
      description,
      batch_number,
      harvest_date,
    } = await request.json()

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const result = await query(
      `
      INSERT INTO products (
        template_id, name, slug, extraction_type, price_per_gram, 
        stock_grams, thc_percentage, cbd_percentage, description,
        batch_number, harvest_date, is_active
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
        thc_percentage,
        cbd_percentage,
        description,
        batch_number,
        harvest_date,
        true,
      ],
    )

    return NextResponse.json({ success: true, product: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Erro ao criar produto" }, { status: 500 })
  }
}
