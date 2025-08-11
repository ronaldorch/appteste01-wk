import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔍 Fetching products...")

    const result = await query(`
      SELECT 
        p.id, p.name, p.slug, p.extraction_type, p.price, 
        p.stock_grams, p.is_active, p.created_at,
        gt.name as template_name, gt.category as template_category
      FROM products p
      LEFT JOIN genetic_templates gt ON p.template_id = gt.id
      ORDER BY p.created_at DESC
    `)

    console.log(`✅ Found ${result.rows.length} products`)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🆕 Creating new product...")

    const body = await request.json()
    const { template_id, name, extraction_type, price, stock_grams, description } = body

    // Validation
    if (!template_id || !name || !extraction_type || !price) {
      return NextResponse.json(
        {
          error: "Template, nome, tipo de extração e preço são obrigatórios",
        },
        { status: 400 },
      )
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    const result = await query(
      `
      INSERT INTO products (
        template_id, name, slug, extraction_type, price, 
        stock_grams, description, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `,
      [
        template_id,
        name,
        slug,
        extraction_type,
        Number.parseFloat(price),
        Number.parseFloat(stock_grams) || 0,
        description || "",
        Number.parseFloat(stock_grams) > 0,
      ],
    )

    console.log("✅ Product created:", result.rows[0])
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("❌ Error creating product:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
