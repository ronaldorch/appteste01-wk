import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const result = await query(
      `
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
        p.genetics,
        p.yield,
        p.height,
        p.medical_uses,
        p.terpenes,
        p.grow_tips,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(pi.image_url, '/placeholder.svg?height=600&width=600&text=🌿') as image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE p.slug = $1 AND p.status = 'active'
      `,
      [slug],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
    }

    const product = {
      ...result.rows[0],
      price: Number.parseFloat(result.rows[0].price) || 0,
      effects: Array.isArray(result.rows[0].effects) ? result.rows[0].effects : [],
      flavors: Array.isArray(result.rows[0].flavors) ? result.rows[0].flavors : [],
      medical_uses: Array.isArray(result.rows[0].medical_uses) ? result.rows[0].medical_uses : [],
      terpenes: Array.isArray(result.rows[0].terpenes) ? result.rows[0].terpenes : [],
      grow_tips: Array.isArray(result.rows[0].grow_tips) ? result.rows[0].grow_tips : [],
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
