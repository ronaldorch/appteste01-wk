"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Smartphone, FileText, MapPin, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: "",
    email: "",
    phone: "",
    cpf: "",

    // Endereço
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",

    // Observações
    observations: "",

    // Pagamento
    paymentMethod: "pix",
  })

  const [shipping, setShipping] = useState(0)

  const calculateShipping = async () => {
    // Simular cálculo de frete baseado no CEP
    if (formData.cep.length === 8) {
      // Frete grátis para pedidos acima de R$ 200
      if (total >= 200) {
        setShipping(0)
      } else {
        setShipping(15.9)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "cep" && value.length === 8) {
      calculateShipping()
    }
  }

  const finalTotal = total + shipping

  const handleSubmit = async () => {
    // Simular processamento do pedido
    const orderData = {
      items,
      customer: formData,
      total: finalTotal,
      shipping,
      paymentMethod: formData.paymentMethod,
      createdAt: new Date().toISOString(),
    }

    console.log("Pedido criado:", orderData)

    // Limpar carrinho
    clearCart()

    // Redirecionar para página de confirmação
    router.push("/pedido-confirmado")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
              <p className="text-gray-600 mb-6">Adicione produtos ao carrinho antes de finalizar a compra.</p>
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
          <Link href="/carrinho">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Carrinho
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Finalizar Compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Checkout */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 1 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      1
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      2
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 3 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      3
                    </div>
                  </div>
                </div>

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-green-600" />
                      <h2 className="text-xl font-semibold">Dados Pessoais</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange("cpf", e.target.value)}
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!formData.name || !formData.email || !formData.phone || !formData.cpf}
                    >
                      Continuar para Endereço
                    </Button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cep">CEP *</Label>
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) => handleInputChange("cep", e.target.value)}
                          placeholder="00000-000"
                          maxLength={8}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Endereço *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Rua, Avenida..."
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="number">Número *</Label>
                        <Input
                          id="number"
                          value={formData.number}
                          onChange={(e) => handleInputChange("number", e.target.value)}
                          placeholder="123"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          value={formData.complement}
                          onChange={(e) => handleInputChange("complement", e.target.value)}
                          placeholder="Apto, Bloco..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          value={formData.neighborhood}
                          onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                          placeholder="Seu bairro"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Sua cidade"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="observations">Observações para Entrega</Label>
                      <Textarea
                        id="observations"
                        value={formData.observations}
                        onChange={(e) => handleInputChange("observations", e.target.value)}
                        placeholder="Instruções especiais para entrega..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        Voltar
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={
                          !formData.cep ||
                          !formData.address ||
                          !formData.number ||
                          !formData.neighborhood ||
                          !formData.city
                        }
                      >
                        Continuar para Pagamento
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <h2 className="text-xl font-semibold">Método de Pagamento</h2>
                    </div>

                    <Tabs
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pix" className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          PIX
                        </TabsTrigger>
                        <TabsTrigger value="card" className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Cartão
                        </TabsTrigger>
                        <TabsTrigger value="boleto" className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Boleto
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="pix" className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-800 mb-2">Pagamento via PIX</h3>
                          <p className="text-sm text-green-700">
                            Após confirmar o pedido, você receberá o QR Code para pagamento instantâneo. Aprovação em
                            até 2 minutos!
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="card" className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-800 mb-2">Cartão de Crédito</h3>
                          <p className="text-sm text-blue-700">
                            Parcelamento em até 12x sem juros para compras acima de R$ 100.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="boleto" className="space-y-4">
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-orange-800 mb-2">Boleto Bancário</h3>
                          <p className="text-sm text-orange-700">
                            Vencimento em 3 dias úteis. Aprovação em até 2 dias úteis após o pagamento.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                        Voltar
                      </Button>
                      <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
                        Finalizar Pedido
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "GRÁTIS" : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>

                {total < 200 && <p className="text-xs text-gray-600">Frete grátis para pedidos acima de R$ 200</p>}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
