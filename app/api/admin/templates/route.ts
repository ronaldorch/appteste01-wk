import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const active = searchParams.get("active")

    let queryText = `
      SELECT 
        pt.*,
        c.name as category_name,
        c.slug as category_slug,
        COUNT(p.id) as active_products
      FROM product_templates pt
      LEFT JOIN categories c ON pt.category_id = c.id
      LEFT JOIN products p ON pt.id = p.template_id AND p.status = 'active'
      WHERE 1=1
    `

    const params: any[] = []
    let paramCount = 0

    if (category) {
      paramCount++
      queryText += ` AND c.slug = $${paramCount}`
      params.push(category)
    }

    if (active === "true") {
      queryText += ` AND pt.is_active = true`
    }

    queryText += ` GROUP BY pt.id, c.name, c.slug ORDER BY pt.name ASC`

    const result = await query(queryText, params)

    const templates = result.rows.map((template) => ({
      ...template,
      base_price: Number.parseFloat(template.base_price) || 0,
      effects: Array.isArray(template.effects) ? template.effects : [],
      flavors: Array.isArray(template.flavors) ? template.flavors : [],
      medical_uses: Array.isArray(template.medical_uses) ? template.medical_uses : [],
      terpenes: Array.isArray(template.terpenes) ? template.terpenes : [],
      grow_tips: Array.isArray(template.grow_tips) ? template.grow_tips : [],
    }))

    return NextResponse.json({
      success: true,
      templates,
      total: templates.length,
    })
  } catch (error) {
    console.error("Erro ao buscar templates:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category_id,
      genetics,
      strain_type,
      thc_level,
      cbd_level,
      effects,
      flavors,
      flowering_time,
      difficulty,
      yield: yieldValue,
      height,
      medical_uses,
      terpenes,
      grow_tips,
      base_price,
      image_url,
    } = body

    const result = await query(
      `INSERT INTO product_templates (
        name, description, category_id, genetics, strain_type, thc_level, cbd_level,
        effects, flavors, flowering_time, difficulty, yield, height, medical_uses,
        terpenes, grow_tips, base_price, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        name,
        description,
        category_id,
        genetics,
        strain_type,
        thc_level,
        cbd_level,
        effects,
        flavors,
        flowering_time,
        difficulty,
        yieldValue,
        height,
        medical_uses,
        terpenes,
        grow_tips,
        base_price,
        image_url,
      ],
    )

    return NextResponse.json({
      success: true,
      template: result.rows[0],
    })
  } catch (error) {
    console.error("Erro ao criar template:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
