"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Filter, Leaf, Eye, Zap, Brain, Heart, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock_quantity: number
  thc_level?: string
  cbd_level?: string
  strain_type?: string
  effects?: string[]
  flavors?: string[]
  flowering_time?: string
  difficulty?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStrainType, setSelectedStrainType] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, selectedStrainType, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory === "all" ? "" : selectedCategory,
        strain_type: selectedStrainType === "all" ? "" : selectedStrainType,
        sort: sortBy,
      })

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (response.ok) {
        // Efeito visual de sucesso
        const notification = document.createElement("div")
        notification.innerHTML = "🌿 Adicionado ao carrinho!"
        notification.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50 animate-bounce"
        document.body.appendChild(notification)
        setTimeout(() => notification.remove(), 3000)
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error)
    }
  }

  const getStrainIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "indica":
        return <Eye className="h-4 w-4" />
      case "sativa":
        return <Zap className="h-4 w-4" />
      case "híbrida":
        return <Brain className="h-4 w-4" />
      default:
        return <Leaf className="h-4 w-4" />
    }
  }

  const getStrainColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "indica":
        return "from-purple-500 to-blue-600"
      case "sativa":
        return "from-yellow-500 to-red-600"
      case "híbrida":
        return "from-green-500 to-purple-600"
      default:
        return "from-green-500 to-green-700"
    }
  }

  const getEffectColor = (effect: string) => {
    const colors = {
      relaxante: "bg-blue-500",
      eufórico: "bg-yellow-500",
      criativo: "bg-purple-500",
      energético: "bg-red-500",
      focado: "bg-green-500",
      feliz: "bg-pink-500",
      sonolento: "bg-indigo-500",
    }
    return colors[effect.toLowerCase() as keyof typeof colors] || "bg-gray-500"
  }

  const getTHCLevel = (level: string) => {
    const numLevel = Number.parseInt(level?.split("-")[0] || "20")
    if (numLevel >= 25) return { color: "bg-red-500", label: "Muito Alto" }
    if (numLevel >= 20) return { color: "bg-orange-500", label: "Alto" }
    if (numLevel >= 15) return { color: "bg-yellow-500", label: "Médio" }
    return { color: "bg-green-500", label: "Baixo" }
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white shadow-2xl border-b-4 border-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <div className="floating-bud">
                <Image
                  src="/logo-estacao-fumaça.png"
                  alt="Estação da Fumaça"
                  width={60}
                  height={60}
                  className="trichome-sparkle"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold brand-font text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-orange-400">
                  Estação da Fumaça
                </h1>
                <p className="text-orange-300 street-font">Da boca pra sua porta, sem vacilo</p>
              </div>
            </Link>

            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-orange-300 transition-colors font-semibold">
                Início
              </Link>
              <Link href="/login" className="hover:text-orange-300 transition-colors font-semibold">
                Login
              </Link>
              <Button className="cannabis-button smoke-effect">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrinho
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-green-400 mb-4 brand-font">Catálogo Premium</h2>
          <p className="text-green-200 text-xl street-font">Explore nossas genéticas selecionadas</p>
        </div>

        {/* Filters */}
        <div className="bud-card rounded-xl shadow-2xl p-6 mb-8 border border-green-500/30">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-green-400" />
              <Input
                placeholder="Buscar genéticas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-black/30 border-green-500 text-white placeholder-green-300 focus:border-orange-400"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-black/30 border-green-500 text-white">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-green-900 border-green-500">
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="flores">🌿 Flores</SelectItem>
                <SelectItem value="extracoes">🍯 Extrações</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStrainType} onValueChange={setSelectedStrainType}>
              <SelectTrigger className="bg-black/30 border-green-500 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-green-900 border-green-500">
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="indica">😴 Indica</SelectItem>
                <SelectItem value="sativa">⚡ Sativa</SelectItem>
                <SelectItem value="híbrida">🧠 Híbrida</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-black/30 border-green-500 text-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-green-900 border-green-500">
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="price_asc">Menor Preço</SelectItem>
                <SelectItem value="price_desc">Maior Preço</SelectItem>
                <SelectItem value="thc_desc">Maior THC</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchProducts} className="cannabis-button">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bud-card animate-pulse">
                <div className="h-64 bg-green-800/20 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-green-700/30 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-green-700/20 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bud-card rounded-xl">
            <div className="text-8xl mb-6">🌿</div>
            <h3 className="text-2xl font-semibold text-green-400 mb-4 brand-font">Nenhuma genética encontrada</h3>
            <p className="text-green-200 mb-6">Tente ajustar os filtros ou buscar por outros termos</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedStrainType("all")
              }}
              className="cannabis-button"
            >
              Ver Todas as Genéticas
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="bud-card hover:shadow-2xl transition-all duration-300 group border border-green-500/30"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url || "/placeholder.svg?height=300&width=300&text=🌿"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                      <Badge className="bg-red-600 text-white animate-pulse">Últimas unidades!</Badge>
                    )}
                    {product.strain_type && (
                      <Badge
                        className={`bg-gradient-to-r ${getStrainColor(product.strain_type)} text-white font-bold flex items-center gap-1`}
                      >
                        {getStrainIcon(product.strain_type)}
                        {product.strain_type}
                      </Badge>
                    )}
                  </div>

                  {/* THC Level */}
                  <div className="absolute top-3 right-3">
                    {(() => {
                      const thcInfo = getTHCLevel(product.thc_level || "20-25%")
                      return (
                        <Badge className={`${thcInfo.color} text-white font-bold`}>
                          THC: {product.thc_level || "20-25%"}
                        </Badge>
                      )
                    })()}
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-500/50">
                      <span className="text-2xl font-bold text-green-400">R$ {product.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Stock indicator */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs">
                      <span
                        className={`${product.stock_quantity > 10 ? "text-green-400" : product.stock_quantity > 0 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {product.stock_quantity > 0 ? `${product.stock_quantity} unidades` : "Esgotado"}
                      </span>
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-green-400 text-xl group-hover:text-orange-400 transition-colors brand-font">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-green-200 line-clamp-2">{product.description}</CardDescription>

                  {/* Detailed specs */}
                  <div className="space-y-3 mt-4">
                    {/* THC/CBD bars */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-green-300 mb-1 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          THC: {product.thc_level || "20-25%"}
                        </div>
                        <div className="h-2 bg-green-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-red-500 rounded-full transition-all duration-1000"
                            style={{
                              width: `${(Math.min(Number.parseInt(product.thc_level?.split("-")[0] || "20"), 30) / 30) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-green-300 mb-1 flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          CBD: {product.cbd_level || "1-3%"}
                        </div>
                        <div className="h-2 bg-green-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-green-500 rounded-full"
                            style={{
                              width: `${(Math.min(Number.parseInt(product.cbd_level?.split("-")[0] || "2"), 20) / 20) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Effects */}
                    {product.effects && product.effects.length > 0 && (
                      <div>
                        <div className="text-xs text-green-300 mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Efeitos:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {product.effects.slice(0, 3).map((effect, index) => (
                            <Badge key={index} className={`text-xs ${getEffectColor(effect)} text-white`}>
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-green-300">
                      {product.flowering_time && <div>🌱 Floração: {product.flowering_time}</div>}
                      {product.difficulty && <div>📊 Dificuldade: {product.difficulty}</div>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock_quantity === 0}
                    className="w-full cannabis-button smoke-effect group-hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock_quantity === 0 ? "Esgotado" : "Adicionar ao Carrinho"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && products.length > 0 && (
          <div className="text-center mt-8 text-green-300">
            <p className="text-lg">
              Mostrando {products.length} genética{products.length !== 1 ? "s" : ""} disponível
              {products.length !== 1 ? "is" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
