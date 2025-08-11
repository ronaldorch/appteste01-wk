"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string
  status: "active" | "inactive" | "draft"
  image_url?: string
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    // Simular carregamento de produtos
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: "iPhone 15 Pro",
          description: "Smartphone Apple iPhone 15 Pro 128GB",
          price: 5999.0,
          stock_quantity: 10,
          category: "Eletrônicos",
          status: "active",
          image_url: "/placeholder.svg?height=100&width=100&text=iPhone",
          created_at: "2024-01-15",
        },
        {
          id: 2,
          name: "Camiseta Básica",
          description: "Camiseta 100% algodão, várias cores",
          price: 39.9,
          stock_quantity: 50,
          category: "Roupas",
          status: "active",
          image_url: "/placeholder.svg?height=100&width=100&text=Camiseta",
          created_at: "2024-01-14",
        },
        {
          id: 3,
          name: "Mesa de Centro",
          description: "Mesa de centro em madeira maciça",
          price: 299.9,
          stock_quantity: 5,
          category: "Casa & Jardim",
          status: "draft",
          image_url: "/placeholder.svg?height=100&width=100&text=Mesa",
          created_at: "2024-01-13",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [router])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
            </div>
            <Link href="/dashboard/products/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Tente ajustar sua busca" : "Comece adicionando seu primeiro produto"}
              </p>
              <Link href="/dashboard/products/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=200&width=200&text=Produto"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {product.description.length > 60
                          ? `${product.description.substring(0, 60)}...`
                          : product.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">
                        R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <Badge variant="outline">{product.stock_quantity} em estoque</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Categoria: {product.category}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
