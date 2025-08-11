import { query } from "./database"

// Interfaces
export interface PublicProduct {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  category_name: string
  category_slug: string
  slug: string
  status: string
  featured: boolean
  images: string[]
  seller_name: string
}

export interface CartItem {
  id: number
  user_id: number
  product_id: number
  quantity: number
  created_at: Date
  product?: PublicProduct
}

export interface UserProfile {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  created_at: Date
}

// Produtos públicos
export async function getPublicProducts(filters?: {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
}): Promise<PublicProduct[]> {
  try {
    let queryText = `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock_quantity, 
        p.slug, p.status, p.featured,
        c.name as category_name, c.slug as category_slug,
        u.name as seller_name,
        COALESCE(
          json_agg(pi.image_url ORDER BY pi.sort_order, pi.created_at) 
          FILTER (WHERE pi.image_url IS NOT NULL), 
          '[]'
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.status = 'active' AND p.stock_quantity > 0
    `

    const params: any[] = []
    let paramCount = 1

    if (filters?.category) {
      queryText += ` AND c.slug = $${paramCount}`
      params.push(filters.category)
      paramCount++
    }

    if (filters?.search) {
      queryText += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      params.push(`%${filters.search}%`)
      paramCount++
    }

    if (filters?.minPrice) {
      queryText += ` AND p.price >= $${paramCount}`
      params.push(filters.minPrice)
      paramCount++
    }

    if (filters?.maxPrice) {
      queryText += ` AND p.price <= $${paramCount}`
      params.push(filters.maxPrice)
      paramCount++
    }

    if (filters?.featured) {
      queryText += ` AND p.featured = true`
    }

    queryText += `
      GROUP BY p.id, p.name, p.description, p.price, p.stock_quantity, 
               p.slug, p.status, p.featured, c.name, c.slug, u.name
      ORDER BY p.featured DESC, p.created_at DESC
    `

    const result = await query(queryText, params)
    return result.rows.map((row) => ({
      ...row,
      images: Array.isArray(row.images) ? row.images.filter((img) => img) : [],
    }))
  } catch (error) {
    console.error("Erro ao buscar produtos públicos:", error)
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  try {
    const result = await query(
      `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock_quantity, 
        p.slug, p.status, p.featured,
        c.name as category_name, c.slug as category_slug,
        u.name as seller_name,
        COALESCE(
          json_agg(pi.image_url ORDER BY pi.sort_order, pi.created_at) 
          FILTER (WHERE pi.image_url IS NOT NULL), 
          '[]'
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.slug = $1 AND p.status = 'active'
      GROUP BY p.id, p.name, p.description, p.price, p.stock_quantity, 
               p.slug, p.status, p.featured, c.name, c.slug, u.name
    `,
      [slug],
    )

    if (result.rows.length === 0) return null

    const product = result.rows[0]
    return {
      ...product,
      images: Array.isArray(product.images) ? product.images.filter((img) => img) : [],
    }
  } catch (error) {
    console.error("Erro ao buscar produto por slug:", error)
    return null
  }
}

// Carrinho
export async function getCartItems(userId: number): Promise<CartItem[]> {
  try {
    const result = await query(
      `
      SELECT 
        c.id, c.user_id, c.product_id, c.quantity, c.created_at,
        p.name, p.price, p.slug, p.stock_quantity,
        COALESCE(pi.image_url, '/placeholder.svg?height=100&width=100&text=Produto') as image
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE c.user_id = $1 AND p.status = 'active'
      ORDER BY c.created_at DESC
    `,
      [userId],
    )

    return result.rows
  } catch (error) {
    console.error("Erro ao buscar itens do carrinho:", error)
    return []
  }
}

export async function addToCart(userId: number, productId: number, quantity = 1): Promise<boolean> {
  try {
    // Verificar se produto existe e tem estoque
    const productResult = await query("SELECT stock_quantity FROM products WHERE id = $1 AND status = 'active'", [
      productId,
    ])

    if (productResult.rows.length === 0) return false
    if (productResult.rows[0].stock_quantity < quantity) return false

    // Verificar se já existe no carrinho
    const existingResult = await query("SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2", [
      userId,
      productId,
    ])

    if (existingResult.rows.length > 0) {
      // Atualizar quantidade
      const newQuantity = existingResult.rows[0].quantity + quantity
      if (newQuantity > productResult.rows[0].stock_quantity) return false

      await query("UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2", [
        newQuantity,
        existingResult.rows[0].id,
      ])
    } else {
      // Adicionar novo item
      await query(
        "INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
        [userId, productId, quantity],
      )
    }

    return true
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error)
    return false
  }
}

export async function updateCartItem(userId: number, itemId: number, quantity: number): Promise<boolean> {
  try {
    if (quantity <= 0) {
      await query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [itemId, userId])
    } else {
      await query("UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3", [
        quantity,
        itemId,
        userId,
      ])
    }
    return true
  } catch (error) {
    console.error("Erro ao atualizar item do carrinho:", error)
    return false
  }
}

export async function clearCart(userId: number): Promise<boolean> {
  try {
    await query("DELETE FROM cart_items WHERE user_id = $1", [userId])
    return true
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error)
    return false
  }
}

// Pedidos
export async function createOrderFromCart(
  userId: number,
  customerData: {
    name: string
    email: string
    phone?: string
    address: string
    city: string
    state: string
    zip_code: string
    notes?: string
  },
): Promise<number | null> {
  try {
    // Buscar itens do carrinho
    const cartItems = await getCartItems(userId)
    if (cartItems.length === 0) return null

    // Calcular total
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Criar pedido
    const orderResult = await query(
      `
      INSERT INTO orders (
        user_id, total_amount, status, customer_name, customer_email, 
        customer_phone, shipping_address, notes, created_at, updated_at
      ) VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `,
      [
        userId,
        totalAmount,
        customerData.name,
        customerData.email,
        customerData.phone,
        `${customerData.address}, ${customerData.city}, ${customerData.state}, ${customerData.zip_code}`,
        customerData.notes,
      ],
    )

    const orderId = orderResult.rows[0].id

    // Adicionar itens do pedido
    for (const item of cartItems) {
      await query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `,
        [orderId, item.product_id, item.quantity, item.price, item.price * item.quantity],
      )

      // Reduzir estoque
      await query("UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2", [
        item.quantity,
        item.product_id,
      ])
    }

    // Limpar carrinho
    await clearCart(userId)

    return orderId
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return null
  }
}

export async function getUserOrders(userId: number): Promise<any[]> {
  try {
    const result = await query(
      `
      SELECT 
        o.id, o.total_amount, o.status, o.customer_name, 
        o.shipping_address, o.created_at,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.total_amount, o.status, o.customer_name, o.shipping_address, o.created_at
      ORDER BY o.created_at DESC
    `,
      [userId],
    )

    return result.rows
  } catch (error) {
    console.error("Erro ao buscar pedidos do usuário:", error)
    return []
  }
}

// Perfil do usuário
export async function updateUserProfile(userId: number, data: Partial<UserProfile>): Promise<boolean> {
  try {
    const fields = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return false

    values.push(userId)
    await query(`UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${paramCount}`, values)
    return true
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return false
  }
}

// Estatísticas do dashboard
export async function getDashboardStats(userId: number): Promise<any> {
  try {
    const [productsResult, ordersResult, revenueResult, customersResult] = await Promise.all([
      query("SELECT COUNT(*) as total FROM products WHERE user_id = $1", [userId]),
      query("SELECT COUNT(*) as total FROM orders WHERE user_id = $1", [userId]),
      query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = $1 AND status != 'cancelled'", [
        userId,
      ]),
      query("SELECT COUNT(DISTINCT customer_email) as total FROM orders WHERE user_id = $1", [userId]),
    ])

    return {
      totalProducts: Number.parseInt(productsResult.rows[0].total),
      totalOrders: Number.parseInt(ordersResult.rows[0].total),
      totalRevenue: Number.parseFloat(revenueResult.rows[0].total),
      totalCustomers: Number.parseInt(customersResult.rows[0].total),
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
    }
  }
}

export async function getTopProducts(userId: number, limit = 5): Promise<any[]> {
  try {
    const result = await query(
      `
      SELECT 
        p.name, p.price, p.slug,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.total_price), 0) as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      WHERE p.user_id = $1
      GROUP BY p.id, p.name, p.price, p.slug
      ORDER BY total_sold DESC, total_revenue DESC
      LIMIT $2
    `,
      [userId, limit],
    )

    return result.rows
  } catch (error) {
    console.error("Erro ao buscar produtos mais vendidos:", error)
    return []
  }
}

export async function getRecentOrders(userId: number, limit = 5): Promise<any[]> {
  try {
    const result = await query(
      `
      SELECT 
        o.id, o.customer_name, o.total_amount, o.status, o.created_at,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.customer_name, o.total_amount, o.status, o.created_at
      ORDER BY o.created_at DESC
      LIMIT $2
    `,
      [userId, limit],
    )

    return result.rows
  } catch (error) {
    console.error("Erro ao buscar pedidos recentes:", error)
    return []
  }
}
