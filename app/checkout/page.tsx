"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, ArrowLeft, CreditCard, Truck, MapPin, User, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"

interface CustomerData {
  name: string
  email: string
  phone: string
  cpf: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  notes: string
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Dados, 2: Entrega, 3: Pagamento, 4: Confirmação
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("")
  const [shippingMethod, setShippingMethod] = useState("")
  const [shippingCost, setShippingCost] = useState(0)

  // Redirecionar se carrinho vazio
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-green-400 mb-4 brand-font">Carrinho Vazio</h2>
          <p className="text-green-200 text-lg mb-8">Adicione produtos ao carrinho para continuar</p>
          <Link href="/produtos">
            <Button className="cannabis-button smoke-effect">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ver Produtos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const calculateShipping = async (zipCode: string) => {
    // Simulação de cálculo de frete
    if (zipCode.length === 8) {
      const cost = total >= 200 ? 0 : Math.random() * 30 + 15
      setShippingCost(cost)
    }
  }

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }))

    if (field === "zipCode" && value.length === 8) {
      calculateShipping(value)
    }
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return customerData.name && customerData.email && customerData.phone && customerData.cpf
      case 2:
        return customerData.address && customerData.city && customerData.state && customerData.zipCode && shippingMethod
      case 3:
        return paymentMethod
      default:
        return true
    }
  }

  const finalizeOrder = async () => {
    setIsLoading(true)
    try {
      const orderData = {
        ...customerData,
        paymentMethod,
        shippingMethod,
        shippingCost,
        items,
        total: total + shippingCost,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "x-user-id": localStorage.getItem("userId") || "",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const data = await response.json()
        await clearCart()
        router.push(`/pedido/${data.orderId}`)
      } else {
        throw new Error("Erro ao criar pedido")
      }
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error)
      alert("Erro ao finalizar pedido. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
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
                <p className="text-orange-300 street-font text-sm">Checkout Seguro</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Badge className="bg-orange-500 text-white">
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </Badge>
              <div className="text-right">
                <p className="text-sm text-green-300">Total</p>
                <p className="text-xl font-bold text-green-400">R$ {(total + shippingCost).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/carrinho">
            <Button
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Carrinho
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-green-400 brand-font">Finalizar Compra</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= stepNumber ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {step > stepNumber ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-green-500" : "bg-gray-600"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-green-300">
                        Nome Completo *
                      </Label>
                      <Input
                        id="name"
                        value={customerData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf" className="text-green-300">
                        CPF *
                      </Label>
                      <Input
                        id="cpf"
                        value={customerData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-green-300">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-green-300">
                        Telefone *
                      </Label>
                      <Input
                        id="phone"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="zipCode" className="text-green-300">
                        CEP *
                      </Label>
                      <Input
                        id="zipCode"
                        value={customerData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-green-300">
                        Estado *
                      </Label>
                      <Select value={customerData.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger className="bg-black/30 border-green-500 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-green-300">
                        Cidade *
                      </Label>
                      <Input
                        id="city"
                        value={customerData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Sua cidade"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-green-300">
                      Endereço *
                    </Label>
                    <Input
                      id="address"
                      value={customerData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="bg-black/30 border-green-500 text-white"
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="number" className="text-green-300">
                        Número
                      </Label>
                      <Input
                        id="number"
                        value={customerData.number}
                        onChange={(e) => handleInputChange("number", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="complement" className="text-green-300">
                        Complemento
                      </Label>
                      <Input
                        id="complement"
                        value={customerData.complement}
                        onChange={(e) => handleInputChange("complement", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood" className="text-green-300">
                        Bairro
                      </Label>
                      <Input
                        id="neighborhood"
                        value={customerData.neighborhood}
                        onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Seu bairro"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-green-300">Método de Entrega *</Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                      <Card
                        className={`cursor-pointer transition-all ${shippingMethod === "standard" ? "border-green-400 bg-green-500/10" : "border-green-500/30"}`}
                        onClick={() => setShippingMethod("standard")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-green-400">Entrega Padrão</h4>
                              <p className="text-sm text-green-300">3-5 dias úteis</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-400">
                                {total >= 200 ? "GRÁTIS" : `R$ ${shippingCost.toFixed(2)}`}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${shippingMethod === "express" ? "border-green-400 bg-green-500/10" : "border-green-500/30"}`}
                        onClick={() => {
                          setShippingMethod("express")
                          setShippingCost(25)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-green-400">Entrega Expressa</h4>
                              <p className="text-sm text-green-300">24-48 horas</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-400">R$ 25,00</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-green-300">
                      Observações
                    </Label>
                    <Textarea
                      id="notes"
                      value={customerData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="bg-black/30 border-green-500 text-white"
                      placeholder="Instruções especiais para entrega..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Método de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <Card
                      className={`cursor-pointer transition-all ${paymentMethod === "pix" ? "border-green-400 bg-green-500/10" : "border-green-500/30"}`}
                      onClick={() => setPaymentMethod("pix")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">PIX</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-400">PIX</h4>
                            <p className="text-sm text-green-300">Aprovação instantânea</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${paymentMethod === "card" ? "border-green-400 bg-green-500/10" : "border-green-500/30"}`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-400">Cartão de Crédito</h4>
                            <p className="text-sm text-green-300">Visa, Mastercard, Elo</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${paymentMethod === "boleto" ? "border-green-400 bg-green-500/10" : "border-green-500/30"}`}
                      onClick={() => setPaymentMethod("boleto")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">BOL</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-400">Boleto Bancário</h4>
                            <p className="text-sm text-green-300">Vencimento em 3 dias</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!validateStep(step)} className="cannabis-button">
                  Continuar
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={finalizeOrder}
                  disabled={!validateStep(step) || isLoading}
                  className="cannabis-button smoke-effect"
                >
                  {isLoading ? "Processando..." : "Finalizar Pedido"}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div>
            <Card className="bud-card border border-green-500/30 sticky top-4">
              <CardHeader>
                <CardTitle className="text-green-400">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Itens */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 rounded border border-green-500/30 overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg?height=50&width=50&text=🌿"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-green-400">{item.name}</h4>
                        <p className="text-xs text-green-300">
                          {item.quantity}x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-green-400">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-green-500/30" />

                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between text-green-300">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-300">
                    <span>Frete</span>
                    <span>{shippingCost === 0 ? "GRÁTIS" : `R$ ${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <Separator className="bg-green-500/30" />
                  <div className="flex justify-between text-xl font-bold text-green-400">
                    <span>Total</span>
                    <span>R$ {(total + shippingCost).toFixed(2)}</span>
                  </div>
                </div>

                {/* Informações de Segurança */}
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                    <Truck className="h-4 w-4" />
                    <span>Entrega discreta garantida</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
