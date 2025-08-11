import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        gt.*,
        COUNT(p.id) as products_count,
        SUM(CASE WHEN p.active = true THEN 1 ELSE 0 END) as active_products
      FROM genetic_templates gt
      LEFT JOIN products p ON p.template_id = gt.id
      GROUP BY gt.id
      ORDER BY gt.name
    `)

    return NextResponse.json({
      success: true,
      templates: result.rows,
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      strain_type,
      thc_min,
      thc_max,
      cbd_min,
      cbd_max,
      description,
      effects,
      flavors,
      medical_uses,
      flowering_time_weeks,
      yield_indoor,
      yield_outdoor,
    } = body

    const result = await query(
      `
      INSERT INTO genetic_templates (
        name, strain_type, thc_min, thc_max, cbd_min, cbd_max,
        description, effects, flavors, medical_uses,
        flowering_time_weeks, yield_indoor, yield_outdoor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
      [
        name,
        strain_type,
        thc_min,
        thc_max,
        cbd_min,
        cbd_max,
        description,
        effects,
        flavors,
        medical_uses,
        flowering_time_weeks,
        yield_indoor,
        yield_outdoor,
      ],
    )

    return NextResponse.json({
      success: true,
      template: result.rows[0],
    })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ success: false, error: "Failed to create template" }, { status: 500 })
  }
}
