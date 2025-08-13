"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface CartItem {
  id: number
  product_id: number
  name: string
  price: number
  quantity: number
  image: string
  slug: string
  stock_quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "CLEAR_CART" }

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_CART":
      const items = action.payload
      return {
        ...state,
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        isLoading: false,
      }

    case "ADD_ITEM":
      const existingItem = state.items.find((item) => item.product_id === action.payload.product_id)
      let newItems: CartItem[]

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product_id === action.payload.product_id
            ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, item.stock_quantity) }
            : item,
        )
      } else {
        newItems = [...state.items, action.payload]
      }

      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      }

    case "UPDATE_QUANTITY":
      const updatedItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, Math.min(action.payload.quantity, item.stock_quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0)

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      }

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      }

    default:
      return state
  }
}

interface CartContextType extends CartState {
  addItem: (product: Omit<CartItem, "id" | "quantity">, quantity?: number) => Promise<void>
  updateQuantity: (id: number, quantity: number) => Promise<void>
  removeItem: (id: number) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    loadCart()
  }, [])

  // Salvar no localStorage sempre que o carrinho mudar
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(state.items))
    } else {
      localStorage.removeItem("cart")
    }
  }, [state.items])

  const loadCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      // Tentar carregar do servidor primeiro (se logado)
      const token = localStorage.getItem("token")
      if (token) {
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": localStorage.getItem("userId") || "",
          },
        })

        if (response.ok) {
          const data = await response.json()
          dispatch({ type: "SET_CART", payload: data.items || [] })
          return
        }
      }

      // Fallback para localStorage
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const items = JSON.parse(savedCart)
        dispatch({ type: "SET_CART", payload: items })
      } else {
        dispatch({ type: "SET_CART", payload: [] })
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error)
      dispatch({ type: "SET_CART", payload: [] })
    }
  }

  const addItem = async (product: Omit<CartItem, "id" | "quantity">, quantity = 1) => {
    try {
      const token = localStorage.getItem("token")

      // Se logado, adicionar no servidor
      if (token) {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-id": localStorage.getItem("userId") || "",
          },
          body: JSON.stringify({ productId: product.product_id, quantity }),
        })

        if (response.ok) {
          await loadCart() // Recarregar do servidor
          return
        }
      }

      // Fallback para localStorage
      const cartItem: CartItem = {
        ...product,
        id: Date.now(), // ID temporário
        quantity,
      }
      dispatch({ type: "ADD_ITEM", payload: cartItem })
    } catch (error) {
      console.error("Erro ao adicionar item:", error)
    }
  }

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      const token = localStorage.getItem("token")

      if (token) {
        const response = await fetch(`/api/cart/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-id": localStorage.getItem("userId") || "",
          },
          body: JSON.stringify({ quantity }),
        })

        if (response.ok) {
          await loadCart()
          return
        }
      }

      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error)
    }
  }

  const removeItem = async (id: number) => {
    try {
      const token = localStorage.getItem("token")

      if (token) {
        const response = await fetch(`/api/cart/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": localStorage.getItem("userId") || "",
          },
        })

        if (response.ok) {
          await loadCart()
          return
        }
      }

      dispatch({ type: "REMOVE_ITEM", payload: id })
    } catch (error) {
      console.error("Erro ao remover item:", error)
    }
  }

  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token")

      if (token) {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": localStorage.getItem("userId") || "",
          },
        })

        if (response.ok) {
          dispatch({ type: "CLEAR_CART" })
          return
        }
      }

      dispatch({ type: "CLEAR_CART" })
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error)
    }
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
