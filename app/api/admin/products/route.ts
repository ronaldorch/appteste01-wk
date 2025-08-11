import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔍 Fetching products...")
    const result = await query(`
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.stock_grams, p.extraction_type,
        p.is_active, p.created_at, p.updated_at,
        gt.name as template_name, gt.type as template_type, gt.category as template_category
      FROM products p
      LEFT JOIN genetic_templates gt ON p.template_id = gt.id
      ORDER BY p.created_at DESC
    `)

    console.log("✅ Products fetched:", result.rows.length)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Creating new product...")
    const body = await request.json()
    const { template_id, name, description, price, stock_grams, extraction_type } = body

    console.log("📝 Product data:", { template_id, name, price, stock_grams, extraction_type })

    // Basic validation
    if (!template_id || !name || !price || stock_grams === undefined) {
      return NextResponse.json({ error: "Template, nome, preço e estoque são obrigatórios" }, { status: 400 })
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    const result = await query(
      `INSERT INTO products 
       (template_id, name, slug, description, price, stock_grams, extraction_type, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [template_id, name, slug, description || "", price, stock_grams, extraction_type || "flower", stock_grams > 0],
    )

    console.log("✅ Product created:", result.rows[0].id)
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("❌ Error creating product:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔄 Updating product...")
    const body = await request.json()
    const { id, template_id, name, description, price, stock_grams, extraction_type, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    // Generate new slug if name changed
    const slug = name
      ? name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim()
      : undefined

    const result = await query(
      `UPDATE products 
       SET template_id = COALESCE($2, template_id), name = COALESCE($3, name), slug = COALESCE($4, slug),
           description = COALESCE($5, description), price = COALESCE($6, price), 
           stock_grams = COALESCE($7, stock_grams), extraction_type = COALESCE($8, extraction_type),
           is_active = COALESCE($9, is_active), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, template_id, name, slug, description, price, stock_grams, extraction_type, is_active],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    console.log("✅ Product updated:", result.rows[0].id)
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("❌ Error updating product:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}
