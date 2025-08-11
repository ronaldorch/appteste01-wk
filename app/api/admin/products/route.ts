import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        gt.name as template_name,
        gt.strain_type,
        et.name as extraction_type,
        et.color_code,
        c.name as category_name
      FROM products p
      LEFT JOIN genetic_templates gt ON p.template_id = gt.id
      LEFT JOIN extraction_types et ON p.extraction_type_id = et.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `)

    return NextResponse.json({
      success: true,
      products: result.rows,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      template_id,
      extraction_type_id,
      category_id,
      name,
      price_per_gram,
      stock_grams,
      thc_percentage,
      cbd_percentage,
      description,
      min_order_grams,
      max_order_grams,
    } = body

    // Gerar slug único
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    const result = await query(
      `
      INSERT INTO products (
        template_id, extraction_type_id, category_id,
        name, slug, price_per_gram, stock_grams, 
        thc_percentage, cbd_percentage, description,
        min_order_grams, max_order_grams
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
      [
        template_id,
        extraction_type_id,
        category_id,
        name,
        slug,
        price_per_gram,
        stock_grams,
        thc_percentage,
        cbd_percentage,
        description,
        min_order_grams || 1.0,
        max_order_grams || 100.0,
      ],
    )

    return NextResponse.json({
      success: true,
      product: result.rows[0],
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}
