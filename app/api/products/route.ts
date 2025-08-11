import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const strainType = searchParams.get("strain_type") || ""
    const featured = searchParams.get("featured") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const sort = searchParams.get("sort") || "name"

    let queryText = `
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        CAST(p.price AS DECIMAL(10,2)) as price,
        p.stock_quantity,
        p.slug,
        p.status,
        p.featured,
        p.thc_level,
        p.cbd_level,
        p.strain_type,
        p.effects,
        p.flavors,
        p.flowering_time,
        p.difficulty,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(pi.image_url, '/placeholder.svg?height=300&width=300&text=🌿') as image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE p.status = 'active'
    `

    const params: any[] = []
    let paramCount = 1

    if (search) {
      queryText += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
      paramCount++
    }

    if (category) {
      queryText += ` AND c.slug = $${paramCount}`
      params.push(category)
      paramCount++
    }

    if (strainType) {
      queryText += ` AND p.strain_type = $${paramCount}`
      params.push(strainType)
      paramCount++
    }

    if (featured) {
      queryText += ` AND p.featured = true`
    }

    // Ordenação
    switch (sort) {
      case "price_asc":
        queryText += ` ORDER BY p.price ASC`
        break
      case "price_desc":
        queryText += ` ORDER BY p.price DESC`
        break
      case "thc_desc":
        queryText += ` ORDER BY CAST(SUBSTRING(p.thc_level FROM '^[0-9]+') AS INTEGER) DESC NULLS LAST`
        break
      default:
        queryText += ` ORDER BY p.name ASC`
    }

    queryText += ` LIMIT $${paramCount}`
    params.push(limit)

    const result = await query(queryText, params)

    // Garantir que price seja número
    const products = result.rows.map((product) => ({
      ...product,
      price: Number.parseFloat(product.price) || 0,
      effects: Array.isArray(product.effects) ? product.effects : [],
      flavors: Array.isArray(product.flavors) ? product.flavors : [],
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
