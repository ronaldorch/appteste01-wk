"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"

export default function CarrinhoPage() {
  const { items, total, itemCount, isLoading, updateQuantity, removeItem, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const applyCoupon = () => {
    // Simulação de cupom de desconto
    if (couponCode.toLowerCase() === "primeira10") {
      setDiscount(total * 0.1)
    } else if (couponCode.toLowerCase() === "frete20") {
      setDiscount(20)
    } else {
      setDiscount(0)
    }
  }

  const finalTotal = total - discount

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-bud"></div>
        <p className="ml-4 text-green-400 text-xl brand-font">Carregando carrinho...</p>
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
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {itemCount}
                  </Badge>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/produtos">
            <Button
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-green-400 brand-font">Seu Carrinho</h1>
          {itemCount > 0 && (
            <Badge className="bg-orange-500 text-white text-lg px-3 py-1">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </Badge>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-green-400 mb-4 brand-font">Carrinho Vazio</h2>
            <p className="text-green-200 text-lg mb-8">Que tal dar uma olhada nos nossos produtos?</p>
            <Link href="/produtos">
              <Button className="cannabis-button smoke-effect text-xl px-8 py-4">
                <ShoppingCart className="h-6 w-6 mr-3" />
                Explorar Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de Itens */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="bud-card border border-green-500/30">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Imagem do Produto */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-green-500/30">
                        <Image
                          src={item.image || "/placeholder.svg?height=100&width=100&text=🌿"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Informações do Produto */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link href={`/produtos/${item.slug}`}>
                              <h3 className="text-lg font-bold text-green-400 hover:text-orange-400 transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            <p className="text-green-300">R$ {item.price.toFixed(2)} cada</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Controles de Quantidade */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.stock_quantity}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                              className="w-16 text-center bg-black/30 border-green-500 text-white h-8"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock_quantity}
                              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-green-400">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.stock_quantity <= 5 && (
                              <p className="text-yellow-400 text-sm">Apenas {item.stock_quantity} restantes</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Botão Limpar Carrinho */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Carrinho
                </Button>
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="space-y-6">
              {/* Cupom de Desconto */}
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Badge className="bg-orange-500">%</Badge>
                    Cupom de Desconto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite seu cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-black/30 border-green-500 text-white"
                    />
                    <Button onClick={applyCoupon} className="cannabis-button">
                      Aplicar
                    </Button>
                  </div>
                  {discount > 0 && (
                    <div className="text-green-400 font-semibold">✅ Desconto aplicado: -R$ {discount.toFixed(2)}</div>
                  )}
                  <div className="text-sm text-green-300">
                    <p>• PRIMEIRA10 - 10% de desconto</p>
                    <p>• FRETE20 - R$ 20 de desconto</p>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo do Pedido */}
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-green-300">
                      <span>Subtotal ({itemCount} itens)</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-orange-400">
                        <span>Desconto</span>
                        <span>-R$ {discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-green-300">
                      <span>Frete</span>
                      <span className="text-orange-400">Calcular no checkout</span>
                    </div>
                    <Separator className="bg-green-500/30" />
                    <div className="flex justify-between text-xl font-bold text-green-400">
                      <span>Total</span>
                      <span>R$ {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link href="/checkout">
                      <Button className="w-full cannabis-button smoke-effect text-lg py-4">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Finalizar Compra
                      </Button>
                    </Link>

                    <div className="text-center text-sm text-green-300">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Truck className="h-4 w-4" />
                        <span>Entrega rápida e discreta</span>
                      </div>
                      <p>🔒 Compra 100% segura e protegida</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              <Card className="bud-card border border-green-500/30">
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm text-green-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Frete grátis acima de R$ 200</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>Entrega em até 24h na região</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Embalagem discreta garantida</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
