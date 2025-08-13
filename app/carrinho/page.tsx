"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function CarrinhoPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const applyCoupon = () => {
    // Simular aplicação de cupom
    if (couponCode.toLowerCase() === "primeira10") {
      setDiscount(total * 0.1)
    } else if (couponCode.toLowerCase() === "fumaca20") {
      setDiscount(total * 0.2)
    } else {
      setDiscount(0)
    }
  }

  const finalTotal = total - discount

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/produtos">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Produtos
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Carrinho de Compras</h1>
          </div>

          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
              <p className="text-gray-600 mb-6">Adicione alguns produtos incríveis para começar suas compras!</p>
              <Link href="/produtos">
                <Button className="bg-green-600 hover:bg-green-700">Ver Produtos</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/produtos">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Comprando
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Carrinho de Compras</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items do Carrinho */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                      {item.thc && <p className="text-sm text-green-600">THC: {item.thc}%</p>}
                      <p className="text-lg font-bold text-green-600 mt-2">R$ {item.price.toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
              >
                Limpar Carrinho
              </Button>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} itens)</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>-R$ {discount.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">R$ {finalTotal.toFixed(2)}</span>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Finalizar Compra</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Cupom de Desconto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cupom de Desconto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite seu cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={applyCoupon} disabled={!couponCode}>
                    Aplicar
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Cupons disponíveis:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>
                      <code className="bg-gray-100 px-1 rounded">PRIMEIRA10</code> - 10% off primeira compra
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 rounded">FUMACA20</code> - 20% off
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
