import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        gt.*,
        COUNT(p.id) as product_count,
        COALESCE(SUM(p.stock_grams), 0) as total_stock
      FROM genetic_templates gt
      LEFT JOIN products p ON gt.id = p.template_id AND p.is_active = true
      GROUP BY gt.id
      ORDER BY gt.created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Erro ao buscar templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      type,
      category,
      thc_percentage,
      cbd_percentage,
      description,
      effects,
      flavors,
      medical_uses,
      growing_difficulty,
      flowering_time,
      yield_info,
      genetics,
      breeder,
      image_url,
    } = await request.json()

    const result = await query(
      `
      INSERT INTO genetic_templates (
        name, type, category, thc_percentage, cbd_percentage, description,
        effects, flavors, medical_uses, growing_difficulty, flowering_time,
        yield_info, genetics, breeder, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `,
      [
        name,
        type,
        category,
        thc_percentage,
        cbd_percentage,
        description,
        effects,
        flavors,
        medical_uses,
        growing_difficulty,
        flowering_time,
        yield_info,
        genetics,
        breeder,
        image_url,
      ],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Erro ao criar template" }, { status: 500 })
  }
}
