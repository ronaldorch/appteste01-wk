export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Total Revenue - usando 'total' em vez de 'total_amount'
    const revenueResult = await query(`
      SELECT COALESCE(SUM(total), 0) as total_revenue 
      FROM orders 
      WHERE status = 'completed'
    `)

    // Total Orders
    const ordersResult = await query(`
      SELECT COUNT(*) as total_orders 
      FROM orders
    `)

    // Total Products
    const productsResult = await query(`
      SELECT COUNT(*) as total_products 
      FROM products
    `)

    // Total Users
    const usersResult = await query(`
      SELECT COUNT(*) as total_users 
      FROM users
    `)

    // Recent Orders
    const recentOrdersResult = await query(`
      SELECT o.*, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `)

    // Top Products
    const topProductsResult = await query(`
      SELECT p.*, COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 10
    `)

    const stats = {
      totalRevenue: Number.parseFloat(revenueResult.rows[0]?.total_revenue || "0"),
      totalOrders: Number.parseInt(ordersResult.rows[0]?.total_orders || "0"),
      totalProducts: Number.parseInt(productsResult.rows[0]?.total_products || "0"),
      totalUsers: Number.parseInt(usersResult.rows[0]?.total_users || "0"),
      recentOrders: recentOrdersResult.rows,
      topProducts: topProductsResult.rows,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
