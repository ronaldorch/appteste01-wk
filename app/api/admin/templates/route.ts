import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔍 Fetching genetic templates...")

    const result = await query(`
      SELECT 
        id,
        name,
        type,
        category,
        thc_percentage,
        cbd_percentage,
        effects,
        flavors,
        medical_uses,
        description,
        is_active,
        created_at,
        updated_at
      FROM genetic_templates 
      ORDER BY name ASC
    `)

    console.log(`✅ Found ${result.rows.length} templates`)
    return NextResponse.json({ templates: result.rows })
  } catch (error) {
    console.error("❌ Error fetching templates:", error)
    return NextResponse.json({ error: "Erro ao buscar templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🆕 Creating new genetic template...")

    const { name, type, category, thc_percentage, cbd_percentage, effects, flavors, medical_uses, description } =
      await request.json()

    // Validação básica
    if (!name || !type || !category) {
      return NextResponse.json({ error: "Nome, tipo e categoria são obrigatórios" }, { status: 400 })
    }

    const result = await query(
      `
      INSERT INTO genetic_templates (
        name, type, category, thc_percentage, cbd_percentage,
        effects, flavors, medical_uses, description, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *
    `,
      [
        name,
        type,
        category,
        thc_percentage || 0,
        cbd_percentage || 0,
        effects || [],
        flavors || [],
        medical_uses || [],
        description || "",
      ],
    )

    console.log("✅ Template created:", result.rows[0])
    return NextResponse.json({ template: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating template:", error)
    return NextResponse.json({ error: "Erro ao criar template" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("📝 Updating genetic template...")

    const {
      id,
      name,
      type,
      category,
      thc_percentage,
      cbd_percentage,
      effects,
      flavors,
      medical_uses,
      description,
      is_active,
    } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const result = await query(
      `
      UPDATE genetic_templates SET
        name = $2,
        type = $3,
        category = $4,
        thc_percentage = $5,
        cbd_percentage = $6,
        effects = $7,
        flavors = $8,
        medical_uses = $9,
        description = $10,
        is_active = $11,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [
        id,
        name,
        type,
        category,
        thc_percentage,
        cbd_percentage,
        effects,
        flavors,
        medical_uses,
        description,
        is_active,
      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 })
    }

    console.log("✅ Template updated:", result.rows[0])
    return NextResponse.json({ template: result.rows[0] })
  } catch (error) {
    console.error("❌ Error updating template:", error)
    return NextResponse.json({ error: "Erro ao atualizar template" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    console.log("🗑️ Deleting template:", id)

    const result = await query("DELETE FROM genetic_templates WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 })
    }

    console.log("✅ Template deleted")
    return NextResponse.json({ message: "Template removido com sucesso" })
  } catch (error) {
    console.error("❌ Error deleting template:", error)
    return NextResponse.json({ error: "Erro ao remover template" }, { status: 500 })
  }
}
