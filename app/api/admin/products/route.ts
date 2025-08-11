import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

// GET - Listar todos os produtos
export async function GET() {
  try {
    console.log("🔍 Fetching products...")

    const result = await query(`
      SELECT 
        p.id,
        p.template_id,
        p.name,
        p.slug,
        p.extraction_type,
        p.price,
        p.stock_grams,
        p.description,
        p.is_active,
        p.created_at,
        p.updated_at,
        gt.name as template_name,
        gt.type as template_type,
        gt.category as template_category
      FROM products p
      LEFT JOIN genetic_templates gt ON p.template_id = gt.id
      ORDER BY p.created_at DESC
    `)

    console.log(`✅ Found ${result.rows.length} products`)
    return NextResponse.json({ products: result.rows })
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    console.log("🆕 Creating new product...")

    const { template_id, name, extraction_type, price, stock_grams, description } = await request.json()

    // Validação básica
    if (!template_id || !name || !extraction_type || !price) {
      return NextResponse.json({ error: "Template, nome, tipo de extração e preço são obrigatórios" }, { status: 400 })
    }

    // Gerar slug
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
        stock_grams, description, is_active, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
        stock_grams > 0,
        1, // Default user ID
      ],
    )

    console.log("✅ Product created:", result.rows[0])
    return NextResponse.json({ product: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating product:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}

// PUT - Atualizar produto existente
export async function PUT(request: NextRequest) {
  try {
    console.log("📝 Updating product...")

    const { id, template_id, name, extraction_type, price, stock_grams, description, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    // Gerar novo slug se o nome mudou
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    const result = await query(
      `
      UPDATE products SET
        template_id = $2,
        name = $3,
        slug = $4,
        extraction_type = $5,
        price = $6,
        stock_grams = $7,
        description = $8,
        is_active = $9,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [
        id,
        template_id,
        name,
        slug,
        extraction_type,
        Number.parseFloat(price),
        Number.parseFloat(stock_grams),
        description,
        is_active && stock_grams > 0,
      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    console.log("✅ Product updated:", result.rows[0])
    return NextResponse.json({ product: result.rows[0] })
  } catch (error) {
    console.error("❌ Error updating product:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

// DELETE - Remover produto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

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
