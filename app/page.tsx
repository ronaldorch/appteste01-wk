"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Filter, Star, Leaf, Award, Truck, Shield, Users, Heart, Eye, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  reviews: number
  thc: string
  cbd: string
  effects: string[]
  genetics: string
  flowering_time: string
  yield: string
  difficulty: string
  description: string
  slug: string
  stock_quantity: number
  featured: boolean
  discount?: number
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [isLoading, setIsLoading] = useState(true)
  const { addItem, itemCount } = useCart()

  // Carregar produtos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
          setFilteredProducts(data)
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filtrar e ordenar produtos
  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Ordenar
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, sortBy])

  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "flores", label: "Flores Premium" },
    { value: "extrações", label: "Extrações" },
    { value: "hash", label: "Hash Artesanal" },
    { value: "edibles", label: "Comestíveis" },
  ]

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
      stock_quantity: product.stock_quantity,
      category: product.category,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-bud"></div>
        <p className="ml-4 text-green-400 text-xl brand-font">Carregando produtos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white shadow-2xl border-b-4 border-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <div className="floating-bud">
                <Image
                  src="/logo-estacao-fumaça.png"
                  alt="Estação da Fumaça"
                  width={50}
                  height={50}
                  className="trichome-sparkle"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold brand-font text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-orange-400">
                  Estação da Fumaça
                </h1>
                <p className="text-orange-300 street-font text-sm">Da boca pra sua porta, sem vacilo</p>
              </div>
            </Link>

            <nav className="flex items-center space-x-6">
              <Link href="/produtos" className="hover:text-orange-300 transition-colors font-semibold">
                Produtos
              </Link>
              <Link href="/login" className="hover:text-orange-300 transition-colors font-semibold">
                Login
              </Link>
              <Link href="/carrinho" className="relative hover:text-orange-300 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-black/70 to-green-800/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="floating-bud mb-8">
              <div className="text-8xl">🌿</div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 brand-font text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-orange-400 to-green-300 animate-pulse">
              ESTAÇÃO DA FUMAÇA
            </h1>
            <p className="text-2xl md:text-3xl text-orange-300 mb-4 street-font font-bold">
              Da boca pra sua porta, sem vacilo
            </p>
            <p className="text-xl text-green-200 mb-8 max-w-2xl mx-auto">
              As melhores genéticas de cannabis premium. Qualidade garantida, entrega discreta, satisfação total.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/produtos">
                <Button className="cannabis-button smoke-effect text-xl px-8 py-4">
                  <Leaf className="h-6 w-6 mr-3" />
                  Explorar Produtos
                </Button>
              </Link>
              <Link href="/carrinho">
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white bg-transparent text-xl px-8 py-4"
                >
                  <ShoppingCart className="h-6 w-6 mr-3" />
                  Ver Carrinho ({itemCount})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-8 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 h-5 w-5" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/50 border-green-500 text-white placeholder-green-300"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 bg-black/50 border-green-500 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500">
                  {categories.map((category) => (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                      className="text-white hover:bg-green-500/20"
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-black/50 border-green-500 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500">
                <SelectItem value="featured" className="text-white hover:bg-green-500/20">
                  Destaques
                </SelectItem>
                <SelectItem value="price-low" className="text-white hover:bg-green-500/20">
                  Menor Preço
                </SelectItem>
                <SelectItem value="price-high" className="text-white hover:bg-green-500/20">
                  Maior Preço
                </SelectItem>
                <SelectItem value="rating" className="text-white hover:bg-green-500/20">
                  Melhor Avaliado
                </SelectItem>
                <SelectItem value="name" className="text-white hover:bg-green-500/20">
                  Nome A-Z
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Grid de Produtos */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-green-400 brand-font">
              Nossos Produtos ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Nenhum produto encontrado</h3>
              <p className="text-green-200">Tente ajustar os filtros ou termo de busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bud-card border border-green-500/30 hover:border-orange-500/50 transition-all duration-300 group"
                >
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={product.image || "/placeholder.svg?height=200&width=300&text=🌿"}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.featured && (
                        <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                          <Award className="h-3 w-3 mr-1" />
                          Destaque
                        </Badge>
                      )}
                      {product.discount && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white">-{product.discount}%</Badge>
                      )}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70">
                          <Heart className="h-4 w-4 text-white" />
                        </Button>
                        <Link href={`/produtos/${product.slug}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70">
                            <Eye className="h-4 w-4 text-white" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <Link href={`/produtos/${product.slug}`}>
                          <h3 className="font-bold text-green-400 hover:text-orange-400 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-green-300 capitalize">{product.category}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-green-300">({product.reviews})</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {product.effects.slice(0, 2).map((effect) => (
                          <Badge key={effect} variant="outline" className="text-xs border-green-500 text-green-400">
                            {effect}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-green-400">R$ {product.price.toFixed(2)}</span>
                          {product.discount && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              R$ {(product.price / (1 - product.discount / 100)).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock_quantity === 0}
                          className="cannabis-button-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {product.stock_quantity === 0 ? "Esgotado" : "Adicionar"}
                        </Button>
                      </div>

                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <p className="text-yellow-400 text-xs">Apenas {product.stock_quantity} restantes!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-black/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-12 brand-font">Por que escolher a gente?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="floating-bud mb-4">
                <Truck className="h-12 w-12 text-orange-400 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Entrega Rápida</h3>
              <p className="text-green-200">Entrega em até 24h na região metropolitana</p>
            </div>
            <div className="text-center">
              <div className="floating-bud mb-4">
                <Shield className="h-12 w-12 text-orange-400 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">100% Discreto</h3>
              <p className="text-green-200">Embalagem discreta e entrega segura</p>
            </div>
            <div className="text-center">
              <div className="floating-bud mb-4">
                <Award className="h-12 w-12 text-orange-400 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Qualidade Premium</h3>
              <p className="text-green-200">Apenas as melhores genéticas selecionadas</p>
            </div>
            <div className="text-center">
              <div className="floating-bud mb-4">
                <Users className="h-12 w-12 text-orange-400 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Suporte 24/7</h3>
              <p className="text-green-200">Atendimento especializado sempre disponível</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 text-white py-12 border-t border-green-500/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/logo-estacao-fumaça.png" alt="Logo" width={40} height={40} />
                <span className="text-xl font-bold brand-font text-green-400">Estação da Fumaça</span>
              </div>
              <p className="text-green-200 mb-4">As melhores genéticas de cannabis premium, direto na sua porta.</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">📱</div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">📧</div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">💬</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-4">Produtos</h3>
              <ul className="space-y-2 text-green-200">
                <li>
                  <Link href="/produtos?category=flores" className="hover:text-orange-400">
                    Flores Premium
                  </Link>
                </li>
                <li>
                  <Link href="/produtos?category=extrações" className="hover:text-orange-400">
                    Extrações
                  </Link>
                </li>
                <li>
                  <Link href="/produtos?category=hash" className="hover:text-orange-400">
                    Hash Artesanal
                  </Link>
                </li>
                <li>
                  <Link href="/produtos?category=edibles" className="hover:text-orange-400">
                    Comestíveis
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-4">Suporte</h3>
              <ul className="space-y-2 text-green-200">
                <li>
                  <Link href="/contato" className="hover:text-orange-400">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-orange-400">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/entrega" className="hover:text-orange-400">
                    Entrega
                  </Link>
                </li>
                <li>
                  <Link href="/garantia" className="hover:text-orange-400">
                    Garantia
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-4">Legal</h3>
              <ul className="space-y-2 text-green-200">
                <li>
                  <Link href="/termos" className="hover:text-orange-400">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="hover:text-orange-400">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-orange-400">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/idade" className="hover:text-orange-400">
                    Verificação de Idade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-500/30 mt-8 pt-8 text-center text-green-300">
            <p>&copy; 2024 Estação da Fumaça. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Este site é destinado apenas para maiores de 18 anos.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
