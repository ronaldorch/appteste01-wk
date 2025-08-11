import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const featured = searchParams.get("featured")
    const limit = searchParams.get("limit")
    const sort = searchParams.get("sort") || "name"

    let sql = `
      SELECT 
        p.*,
        c.name as category,
        pi.image_url,
        pi.alt_text
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE 1=1
    `

    const params: any[] = []
    let paramCount = 0

    if (search) {
      paramCount++
      sql += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (category && category !== "all") {
      paramCount++
      sql += ` AND c.slug = $${paramCount}`
      params.push(category)
    }

    if (featured === "true") {
      sql += ` AND p.featured = true`
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        sql += ` ORDER BY p.price ASC`
        break
      case "price_desc":
        sql += ` ORDER BY p.price DESC`
        break
      case "newest":
        sql += ` ORDER BY p.created_at DESC`
        break
      default:
        sql += ` ORDER BY p.name ASC`
    }

    if (limit) {
      paramCount++
      sql += ` LIMIT $${paramCount}`
      params.push(Number.parseInt(limit))
    }

    const result = await query(sql, params)

    return NextResponse.json({
      products: result.rows,
      total: result.rows.length,
    })
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, stock_quantity, category_id, slug, featured = false } = body

    const result = await query(
      `INSERT INTO products (name, description, price, stock_quantity, category_id, user_id, slug, featured)
       VALUES ($1, $2, $3, $4, $5, 1, $6, $7)
       RETURNING *`,
      [name, description, price, stock_quantity, category_id, slug, featured],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
