"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, ArrowLeft, Eye, Zap, Brain, Heart, Sparkles, Leaf, BarChart3, Thermometer } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

interface ProductDetail {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock_quantity: number
  thc_level: string
  cbd_level: string
  strain_type: string
  effects: string[]
  flavors: string[]
  flowering_time: string
  difficulty: string
  genetics: string
  yield: string
  height: string
  medical_uses: string[]
  terpenes: string[]
  grow_tips: string[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchProduct = async (slug: string) => {
    try {
      const response = await fetch(`/api/products/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!product) return

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      })

      if (response.ok) {
        // Efeito visual de sucesso
        const notification = document.createElement("div")
        notification.innerHTML = `🌿 ${quantity}x ${product.name} adicionado ao carrinho!`
        notification.className =
          "fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg z-50 animate-bounce shadow-2xl"
        document.body.appendChild(notification)
        setTimeout(() => notification.remove(), 4000)
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error)
    }
  }

  const getStrainIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "indica":
        return <Eye className="h-5 w-5" />
      case "sativa":
        return <Zap className="h-5 w-5" />
      case "híbrida":
        return <Brain className="h-5 w-5" />
      default:
        return <Leaf className="h-5 w-5" />
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
      apetite: "bg-orange-500",
    }
    return colors[effect.toLowerCase() as keyof typeof colors] || "bg-gray-500"
  }

  const getTHCLevel = (level: string) => {
    const numLevel = Number.parseInt(level?.split("-")[0] || "20")
    if (numLevel >= 25) return { color: "bg-red-500", label: "Muito Alto", width: "90%" }
    if (numLevel >= 20) return { color: "bg-orange-500", label: "Alto", width: "75%" }
    if (numLevel >= 15) return { color: "bg-yellow-500", label: "Médio", width: "60%" }
    return { color: "bg-green-500", label: "Baixo", width: "40%" }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "fácil":
        return "text-green-400"
      case "médio":
        return "text-yellow-400"
      case "difícil":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-bud"></div>
        <p className="ml-4 text-green-400 text-xl brand-font">Carregando genética...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🌿</div>
          <h2 className="text-3xl font-bold text-green-400 mb-4 brand-font">Genética não encontrada</h2>
          <Link href="/produtos">
            <Button className="cannabis-button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Catálogo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const mockImages = [
    product.image_url || "/placeholder.svg?height=600&width=600&text=🌿",
    "/placeholder.svg?height=600&width=600&text=🌿2",
    "/placeholder.svg?height=600&width=600&text=🌿3",
  ]

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
                <ArrowLeft className="h-4 w-4 mr-1 inline" />
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-900/20 to-black/40">
              <img
                src={mockImages[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge
                  className={`bg-gradient-to-r ${getStrainColor(product.strain_type)} text-white font-bold flex items-center gap-2 text-lg px-4 py-2`}
                >
                  {getStrainIcon(product.strain_type)}
                  {product.strain_type}
                </Badge>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg px-4 py-2">
                  THC: {product.thc_level}
                </Badge>
              </div>
            </div>

            {/* Thumbnail images */}
            <div className="flex gap-2">
              {mockImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index
                      ? "border-orange-400 scale-105"
                      : "border-green-500/30 hover:border-green-400"
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-20 h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-green-400 mb-4 brand-font">{product.name}</h1>
              <p className="text-green-200 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price and Stock */}
            <div className="bud-card p-6 rounded-xl border border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl font-bold text-green-400">R$ {product.price.toFixed(2)}</div>
                <div
                  className={`text-lg font-semibold ${product.stock_quantity > 10 ? "text-green-400" : product.stock_quantity > 0 ? "text-yellow-400" : "text-red-400"}`}
                >
                  {product.stock_quantity > 0 ? `${product.stock_quantity} unidades disponíveis` : "Esgotado"}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-green-300 font-semibold">Quantidade:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(product.stock_quantity, Number.parseInt(e.target.value) || 1)))
                    }
                    className="w-20 text-center bg-black/30 border-green-500 text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Add to cart button */}
              <Button
                onClick={addToCart}
                disabled={product.stock_quantity === 0}
                className="w-full cannabis-button smoke-effect text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                <ShoppingCart className="h-6 w-6 mr-3" />
                {product.stock_quantity === 0 ? "Esgotado" : `Adicionar ${quantity}x ao Carrinho`}
              </Button>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bud-card p-4 rounded-xl border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-orange-400" />
                  <span className="text-green-300 font-semibold">THC</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{product.thc_level}</div>
                <div className="h-2 bg-green-900 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${getTHCLevel(product.thc_level).color} rounded-full transition-all duration-1000`}
                    style={{ width: getTHCLevel(product.thc_level).width }}
                  ></div>
                </div>
              </div>

              <div className="bud-card p-4 rounded-xl border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-blue-400" />
                  <span className="text-green-300 font-semibold">CBD</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{product.cbd_level}</div>
                <div className="h-2 bg-green-900 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-green-500 rounded-full"
                    style={{
                      width: `${(Math.min(Number.parseInt(product.cbd_level?.split("-")[0] || "2"), 20) / 20) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="effects" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-green-900/30 border border-green-500/30">
              <TabsTrigger value="effects" className="data-[state=active]:bg-green-600">
                <Sparkles className="h-4 w-4 mr-2" />
                Efeitos
              </TabsTrigger>
              <TabsTrigger value="specs" className="data-[state=active]:bg-green-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Especificações
              </TabsTrigger>
              <TabsTrigger value="growing" className="data-[state=active]:bg-green-600">
                <Leaf className="h-4 w-4 mr-2" />
                Cultivo
              </TabsTrigger>
              <TabsTrigger value="medical" className="data-[state=active]:bg-green-600">
                <Heart className="h-4 w-4 mr-2" />
                Medicinal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="effects" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bud-card border border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Efeitos Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.effects?.map((effect, index) => (
                        <Badge key={index} className={`${getEffectColor(effect)} text-white text-sm px-3 py-1`}>
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bud-card border border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Sabores & Aromas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.flavors?.map((flavor, index) => (
                        <Badge key={index} className="bg-orange-500 text-white text-sm px-3 py-1">
                          {flavor}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bud-card border border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-400">Genética</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-green-300">Tipo:</span>
                      <span className="ml-2 text-white font-semibold">{product.strain_type}</span>
                    </div>
                    <div>
                      <span className="text-green-300">Genética:</span>
                      <span className="ml-2 text-white font-semibold">{product.genetics || "Híbrida Premium"}</span>
                    </div>
                    <div>
                      <span className="text-green-300">THC:</span>
                      <span className="ml-2 text-white font-semibold">{product.thc_level}</span>
                    </div>
                    <div>
                      <span className="text-green-300">CBD:</span>
                      <span className="ml-2 text-white font-semibold">{product.cbd_level}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bud-card border border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-400">Terpenos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(product.terpenes || ["Myrceno", "Limoneno", "Pineno", "Cariofileno"]).map((terpene, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-green-300">{terpene}</span>
                          <div className="w-16 h-2 bg-green-900 rounded-full">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-orange-400 rounded-full"
                              style={{ width: `${Math.random() * 60 + 40}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bud-card border border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-400">Características</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-green-300">Altura:</span>
                      <span className="ml-2 text-white font-semibold">{product.height || "80-120cm"}</span>
                    </div>
                    <div>
                      <span className="text-green-300">Rendimento:</span>
                      <span className="ml-2 text-white font-semibold">{product.yield || "400-500g/m²"}</span>
                    </div>
                    <div>
                      <span className="text-green-300">Floração:</span>
                      <span className="ml-2 text-white font-semibold">{product.flowering_time}</span>
                    </div>
                    <div>
                      <span className="text-green-300">Dificuldade:</span>
                      <span className={`ml-2 font-semibold ${getDifficultyColor(product.difficulty)}`}>
                        {product.difficulty}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="growing" className="mt-6">
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Dicas de Cultivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-3">Ambiente Ideal</h4>
                      <ul className="space-y-2 text-green-200">
                        <li>• Temperatura: 20-26°C</li>
                        <li>• Umidade: 40-60%</li>
                        <li>• pH: 6.0-7.0</li>
                        <li>• Iluminação: 18/6 (veg) - 12/12 (flora)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-3">Cuidados Especiais</h4>
                      <ul className="space-y-2 text-green-200">
                        {(
                          product.grow_tips || [
                            "Rega moderada, evite encharcamento",
                            "Poda apical para aumentar rendimento",
                            "Ventilação adequada é essencial",
                            "Flush de 1-2 semanas antes da colheita",
                          ]
                        ).map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="mt-6">
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Usos Medicinais
                  </CardTitle>
                  <CardDescription className="text-green-300">
                    Informações baseadas em relatos de usuários e estudos preliminares
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-3">Pode ajudar com:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(
                          product.medical_uses || [
                            "Ansiedade",
                            "Insônia",
                            "Dor crônica",
                            "Estresse",
                            "Depressão",
                            "Falta de apetite",
                          ]
                        ).map((use, index) => (
                          <Badge key={index} className="bg-blue-600 text-white">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-3">Dosagem Sugerida</h4>
                      <div className="space-y-2 text-green-200">
                        <p>
                          <strong>Iniciantes:</strong> 0.25-0.5g
                        </p>
                        <p>
                          <strong>Intermediário:</strong> 0.5-1g
                        </p>
                        <p>
                          <strong>Experiente:</strong> 1-2g+
                        </p>
                        <p className="text-yellow-400 text-sm mt-3">
                          ⚠️ Comece sempre com doses baixas e aumente gradualmente
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
