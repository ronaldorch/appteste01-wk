import { query } from "./database"

export interface Category {
  id: number
  name: string
  description?: string
  slug: string
  image_url?: string
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock_quantity: number
  category_id?: number
  user_id: number
  slug: string
  status: "active" | "inactive" | "draft"
  featured: boolean
  created_at: Date
  updated_at: Date
  category?: Category
  images?: ProductImage[]
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
  created_at: Date
}

export interface Order {
  id: number
  user_id?: number
  total_amount: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address?: string
  notes?: string
  created_at: Date
  updated_at: Date
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  created_at: Date
  product?: Product
}

// Funções para Categorias
export async function getCategories(): Promise<Category[]> {
  try {
    const result = await query("SELECT * FROM categories ORDER BY name ASC")
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return []
  }
}

export async function createCategory(
  data: Omit<Category, "id" | "created_at" | "updated_at">,
): Promise<Category | null> {
  try {
    const result = await query(
      `INSERT INTO categories (name, description, slug, image_url, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [data.name, data.description, data.slug, data.image_url],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao criar categoria:", error)
    return null
  }
}

// Funções para Produtos
export async function getProducts(userId?: number): Promise<Product[]> {
  try {
    let queryText = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `
    const params: any[] = []

    if (userId) {
      queryText += " WHERE p.user_id = $1"
      params.push(userId)
    }

    queryText += " ORDER BY p.created_at DESC"

    const result = await query(queryText, params)
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return null
  }
}

export async function createProduct(data: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product | null> {
  try {
    const result = await query(
      `INSERT INTO products (name, description, price, stock_quantity, category_id, user_id, slug, status, featured, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
       RETURNING *`,
      [
        data.name,
        data.description,
        data.price,
        data.stock_quantity,
        data.category_id,
        data.user_id,
        data.slug,
        data.status,
        data.featured,
      ],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return null
  }
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
  try {
    const fields = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at" && key !== "updated_at" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await query(`UPDATE products SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`, values)
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return null
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    const result = await query("DELETE FROM products WHERE id = $1", [id])
    return result.rowCount > 0
  } catch (error) {
    console.error("Erro ao deletar produto:", error)
    return false
  }
}

// Funções para Imagens de Produtos
export async function getProductImages(productId: number): Promise<ProductImage[]> {
  try {
    const result = await query(
      "SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC, created_at ASC",
      [productId],
    )
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar imagens do produto:", error)
    return []
  }
}

export async function addProductImage(data: Omit<ProductImage, "id" | "created_at">): Promise<ProductImage | null> {
  try {
    const result = await query(
      `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [data.product_id, data.image_url, data.alt_text, data.is_primary, data.sort_order],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao adicionar imagem do produto:", error)
    return null
  }
}

// Funções para Pedidos
export async function getOrders(userId?: number): Promise<Order[]> {
  try {
    let queryText = "SELECT * FROM orders"
    const params: any[] = []

    if (userId) {
      queryText += " WHERE user_id = $1"
      params.push(userId)
    }

    queryText += " ORDER BY created_at DESC"

    const result = await query(queryText, params)
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    return []
  }
}

export async function createOrder(data: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order | null> {
  try {
    const result = await query(
      `INSERT INTO orders (user_id, total_amount, status, customer_name, customer_email, customer_phone, shipping_address, notes, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
       RETURNING *`,
      [
        data.user_id,
        data.total_amount,
        data.status,
        data.customer_name,
        data.customer_email,
        data.customer_phone,
        data.shipping_address,
        data.notes,
      ],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return null
  }
}

export async function updateOrderStatus(id: number, status: Order["status"]): Promise<Order | null> {
  try {
    const result = await query("UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [
      status,
      id,
    ])
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    return null
  }
}

// Funções para Itens do Pedido
export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  try {
    const result = await query(
      `SELECT oi.*, p.name as product_name, p.slug as product_slug
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [orderId],
    )
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar itens do pedido:", error)
    return []
  }
}

export async function addOrderItem(data: Omit<OrderItem, "id" | "created_at">): Promise<OrderItem | null> {
  try {
    const result = await query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [data.order_id, data.product_id, data.quantity, data.unit_price, data.total_price],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Erro ao adicionar item ao pedido:", error)
    return null
  }
}
