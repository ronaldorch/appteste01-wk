"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, Star, Zap, Leaf, Sparkles, Eye, Brain, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  featured: boolean
  thc_level?: string
  cbd_level?: string
  strain_type?: string
  effects?: string[]
  flavors?: string[]
  flowering_time?: string
  difficulty?: string
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFeaturedProducts()
    createParticles()
  }, [])

  const createParticles = () => {
    const particlesContainer = document.createElement("div")
    particlesContainer.className = "particles"
    document.body.appendChild(particlesContainer)

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.left = Math.random() * 100 + "%"
      particle.style.animationDelay = Math.random() * 10 + "s"
      particle.style.animationDuration = Math.random() * 10 + 10 + "s"
      particlesContainer.appendChild(particle)
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch("/api/products?featured=true&limit=6")
      if (response.ok) {
        const data = await response.json()
        setFeaturedProducts(data.products || [])
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      window.location.href = `/produtos?search=${encodeURIComponent(searchTerm)}`
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

  const getEffectColor = (effect: string) => {
    const colors = {
      relaxante: "bg-blue-500",
      eufórico: "bg-yellow-500",
      criativo: "bg-purple-500",
      energético: "bg-red-500",
      focado: "bg-green-500",
    }
    return colors[effect.toLowerCase() as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white shadow-2xl border-b-4 border-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="floating-bud">
                <Image
                  src="/logo-estacao-fumaça.png"
                  alt="Estação da Fumaça"
                  width={80}
                  height={80}
                  className="trichome-sparkle"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold brand-font text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-orange-400">
                  Estação da Fumaça
                </h1>
                <p className="text-orange-300 street-font text-lg">Da boca pra sua porta, sem vacilo</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <Input
                  placeholder="Buscar genéticas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-black/30 border-green-500 text-white placeholder-green-300 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
            </form>

            <nav className="flex items-center space-x-6">
              <Link href="/produtos" className="hover:text-orange-300 transition-colors font-semibold">
                Catálogo
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

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-orange-400 to-green-400 brand-font">
              Premium Cannabis
            </h2>
            <p className="text-2xl text-green-200 mb-8 leading-relaxed street-font">
              As melhores genéticas, direto da fonte. Qualidade garantida, entrega discreta.
            </p>
            <div className="flex justify-center space-x-6 mb-12">
              <Link href="/produtos">
                <Button size="lg" className="cannabis-button text-xl px-10 py-4 smoke-effect">
                  <Sparkles className="h-6 w-6 mr-3" />
                  Ver Genéticas
                </Button>
              </Link>
              <Link href="/produtos?category=flores">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black text-xl px-10 py-4 bg-transparent backdrop-blur-sm"
                >
                  <Leaf className="h-6 w-6 mr-3" />
                  Flores Premium
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="bud-card p-6 rounded-xl">
                <div className="text-4xl font-bold text-orange-400 mb-2">50+</div>
                <div className="text-green-200">Genéticas Disponíveis</div>
              </div>
              <div className="bud-card p-6 rounded-xl">
                <div className="text-4xl font-bold text-orange-400 mb-2">24h</div>
                <div className="text-green-200">Entrega Expressa</div>
              </div>
              <div className="bud-card p-6 rounded-xl">
                <div className="text-4xl font-bold text-orange-400 mb-2">100%</div>
                <div className="text-green-200">Discrição Garantida</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="joint-divider"></div>

      {/* Categories */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-green-400 mb-12 brand-font">Nossas Especialidades</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/produtos?category=flores">
              <Card className="bud-card hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Leaf className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-green-400 text-2xl brand-font">Flores Premium</CardTitle>
                  <CardDescription className="text-green-200 text-lg">
                    Buds de alta qualidade, curados com perfeição. Indica, Sativa e Híbridas.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/produtos?category=extracoes">
              <Card className="bud-card hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-orange-400 text-2xl brand-font">Extrações</CardTitle>
                  <CardDescription className="text-green-200 text-lg">
                    Concentrados, óleos e extratos de máxima potência. Para conhecedores.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-green-400 mb-12 brand-font">Genéticas em Destaque</h3>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bud-card animate-pulse">
                  <div className="h-64 bg-green-800/20 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-green-700/30 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-green-700/20 rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="bud-card hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url || "/placeholder.svg?height=300&width=300&text=🌿"}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.featured && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {product.strain_type && (
                        <Badge className="strain-badge flex items-center gap-1">
                          {getStrainIcon(product.strain_type)}
                          {product.strain_type}
                        </Badge>
                      )}
                    </div>

                    {/* THC Level */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-600 text-white font-bold">THC: {product.thc_level || "20-25%"}</Badge>
                    </div>

                    {/* Price overlay */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
                        <span className="text-2xl font-bold text-green-400">R$ {product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-green-400 text-xl group-hover:text-orange-400 transition-colors brand-font">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-green-200 line-clamp-2">{product.description}</CardDescription>

                    {/* THC/CBD Indicators */}
                    <div className="flex gap-4 mt-3">
                      <div className="flex-1">
                        <div className="text-xs text-green-300 mb-1">THC: {product.thc_level || "20-25%"}</div>
                        <div className="thc-indicator"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-green-300 mb-1">CBD: {product.cbd_level || "1-3%"}</div>
                        <div className="h-2 bg-green-800 rounded-full">
                          <div className="h-full w-1/4 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Effects */}
                    {product.effects && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {product.effects.slice(0, 3).map((effect, index) => (
                          <Badge key={index} className={`text-xs ${getEffectColor(effect)} text-white`}>
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button
                      onClick={() => addToCart(product.id)}
                      className="w-full cannabis-button smoke-effect group-hover:scale-105 transition-transform"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/produtos">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black text-xl px-8 py-3 bg-transparent backdrop-blur-sm"
              >
                Ver Todo o Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-r from-green-900/40 to-black/60 relative">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-green-400 mb-12 brand-font">
            Por que escolher a Estação?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bud-card p-8 rounded-xl">
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-orange-400 brand-font">Qualidade Premium</h4>
              <p className="text-green-200">Genéticas selecionadas, curadas com perfeição. Só o que há de melhor.</p>
            </div>

            <div className="text-center bud-card p-8 rounded-xl">
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-orange-400 brand-font">Entrega Rápida</h4>
              <p className="text-green-200">Da boca pra sua porta em 24h. Discrição total, sem vacilo.</p>
            </div>

            <div className="text-center bud-card p-8 rounded-xl">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-orange-400 brand-font">Confiança</h4>
              <p className="text-green-200">
                Anos no ramo, milhares de clientes satisfeitos. Sua satisfação é nossa prioridade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black to-green-900 text-white py-12 border-t-4 border-orange-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Image src="/logo-estacao-fumaça.png" alt="Estação da Fumaça" width={50} height={50} />
                <div>
                  <span className="text-2xl font-bold brand-font text-green-400">Estação da Fumaça</span>
                  <p className="text-orange-300 street-font">Da boca pra sua porta</p>
                </div>
              </div>
              <p className="text-green-200">A melhor seleção de cannabis premium. Qualidade, discrição e confiança.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-orange-400 brand-font text-lg">Produtos</h4>
              <ul className="space-y-2 text-green-200">
                <li>
                  <Link href="/produtos?category=flores" className="hover:text-orange-300">
                    🌿 Flores Premium
                  </Link>
                </li>
                <li>
                  <Link href="/produtos?category=extracoes" className="hover:text-orange-300">
                    🍯 Extrações
                  </Link>
                </li>
                <li>
                  <Link href="/produtos?strain_type=indica" className="hover:text-orange-300">
                    😴 Indica
                  </Link>
                </li>
                <li>
                  <Link href="/produtos?strain_type=sativa" className="hover:text-orange-300">
                    ⚡ Sativa
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-orange-400 brand-font text-lg">Suporte</h4>
              <ul className="space-y-2 text-green-200">
                <li>
                  <Link href="/login" className="hover:text-orange-300">
                    Minha Conta
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-orange-300">
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-300">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-300">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-orange-400 brand-font text-lg">Horário</h4>
              <div className="text-green-200 space-y-2">
                <p>🕐 Segunda a Sexta: 9h às 22h</p>
                <p>🕐 Sábado: 10h às 20h</p>
                <p>🕐 Domingo: 12h às 18h</p>
                <p className="text-orange-300 font-semibold">📱 WhatsApp 24h</p>
              </div>
            </div>
          </div>

          <div className="joint-divider my-8"></div>

          <div className="text-center text-green-300">
            <p>&copy; 2024 Estação da Fumaça - Premium Cannabis Delivery</p>
            <p className="text-sm mt-2 text-orange-300 street-font">"Da boca pra sua porta, sem vacilo" 🌿</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
