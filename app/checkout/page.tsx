"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CreditCard, Truck, MapPin, User, CheckCircle, QrCode, Banknote } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"

interface CheckoutForm {
  // Dados pessoais
  nome: string
  email: string
  telefone: string
  cpf: string

  // Endereço
  cep: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string

  // Pagamento
  metodoPagamento: string
  observacoes: string
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [frete, setFrete] = useState(0)
  const [tempoEntrega, setTempoEntrega] = useState("")

  const [form, setForm] = useState<CheckoutForm>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    metodoPagamento: "",
    observacoes: "",
  })

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})

  const updateForm = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const calcularFrete = async () => {
    if (form.cep.length === 8) {
      setIsLoading(true)
      // Simulação de cálculo de frete
      setTimeout(() => {
        const cepNum = Number.parseInt(form.cep)
        if (cepNum >= 20000000 && cepNum <= 28999999) {
          // Rio de Janeiro
          setFrete(15)
          setTempoEntrega("24-48h")
        } else if (cepNum >= 1000000 && cepNum <= 19999999) {
          // São Paulo
          setFrete(20)
          setTempoEntrega("48-72h")
        } else {
          setFrete(35)
          setTempoEntrega("3-5 dias")
        }
        setIsLoading(false)
      }, 1000)
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<CheckoutForm> = {}

    if (step === 1) {
      if (!form.nome) newErrors.nome = "Nome é obrigatório"
      if (!form.email) newErrors.email = "Email é obrigatório"
      if (!form.telefone) newErrors.telefone = "Telefone é obrigatório"
      if (!form.cpf) newErrors.cpf = "CPF é obrigatório"
    }

    if (step === 2) {
      if (!form.cep) newErrors.cep = "CEP é obrigatório"
      if (!form.endereco) newErrors.endereco = "Endereço é obrigatório"
      if (!form.numero) newErrors.numero = "Número é obrigatório"
      if (!form.bairro) newErrors.bairro = "Bairro é obrigatório"
      if (!form.cidade) newErrors.cidade = "Cidade é obrigatória"
      if (!form.estado) newErrors.estado = "Estado é obrigatório"
    }

    if (step === 3) {
      if (!form.metodoPagamento) newErrors.metodoPagamento = "Método de pagamento é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        calcularFrete()
      }
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const finalizarPedido = async () => {
    if (!validateStep(3)) return

    setIsLoading(true)

    try {
      const pedido = {
        items,
        cliente: form,
        frete,
        total: total + frete,
        metodoPagamento: form.metodoPagamento,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      })

      if (response.ok) {
        clearCart()
        // Redirecionar para página de confirmação
        window.location.href = "/pedido-confirmado"
      } else {
        throw new Error("Erro ao processar pedido")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao processar pedido. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-green-400 mb-4">Carrinho Vazio</h2>
          <p className="text-green-200 text-lg mb-8">Adicione produtos ao carrinho para continuar</p>
          <Link href="/produtos">
            <Button className="cannabis-button">Explorar Produtos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalFinal = total + frete

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white shadow-2xl border-b-4 border-orange-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <Image src="/logo-estacao-fumaça.png" alt="Estação da Fumaça" width={50} height={50} />
              <div>
                <h1 className="text-2xl font-bold brand-font text-green-300">Estação da Fumaça</h1>
                <p className="text-orange-300 text-sm">Checkout Seguro</p>
              </div>
            </Link>
            <Link href="/carrinho">
              <Button
                variant="outline"
                className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Carrinho
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {step < 3 && <div className={`w-16 h-1 mx-2 ${currentStep > step ? "bg-green-500" : "bg-gray-600"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            {/* Etapa 1: Dados Pessoais */}
            {currentStep === 1 && (
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome" className="text-green-300">
                        Nome Completo *
                      </Label>
                      <Input
                        id="nome"
                        value={form.nome}
                        onChange={(e) => updateForm("nome", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Seu nome completo"
                      />
                      {errors.nome && <p className="text-red-400 text-sm mt-1">{errors.nome}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cpf" className="text-green-300">
                        CPF *
                      </Label>
                      <Input
                        id="cpf"
                        value={form.cpf}
                        onChange={(e) => updateForm("cpf", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="000.000.000-00"
                      />
                      {errors.cpf && <p className="text-red-400 text-sm mt-1">{errors.cpf}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-green-300">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="seu@email.com"
                      />
                      {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="telefone" className="text-green-300">
                        Telefone *
                      </Label>
                      <Input
                        id="telefone"
                        value={form.telefone}
                        onChange={(e) => updateForm("telefone", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="(11) 99999-9999"
                      />
                      {errors.telefone && <p className="text-red-400 text-sm mt-1">{errors.telefone}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={nextStep} className="cannabis-button">
                      Continuar
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Etapa 2: Endereço */}
            {currentStep === 2 && (
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cep" className="text-green-300">
                        CEP *
                      </Label>
                      <Input
                        id="cep"
                        value={form.cep}
                        onChange={(e) => updateForm("cep", e.target.value)}
                        onBlur={calcularFrete}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="00000-000"
                        maxLength={8}
                      />
                      {errors.cep && <p className="text-red-400 text-sm mt-1">{errors.cep}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="endereco" className="text-green-300">
                        Endereço *
                      </Label>
                      <Input
                        id="endereco"
                        value={form.endereco}
                        onChange={(e) => updateForm("endereco", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Rua, Avenida, etc."
                      />
                      {errors.endereco && <p className="text-red-400 text-sm mt-1">{errors.endereco}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="numero" className="text-green-300">
                        Número *
                      </Label>
                      <Input
                        id="numero"
                        value={form.numero}
                        onChange={(e) => updateForm("numero", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="123"
                      />
                      {errors.numero && <p className="text-red-400 text-sm mt-1">{errors.numero}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="complemento" className="text-green-300">
                        Complemento
                      </Label>
                      <Input
                        id="complemento"
                        value={form.complemento}
                        onChange={(e) => updateForm("complemento", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bairro" className="text-green-300">
                        Bairro *
                      </Label>
                      <Input
                        id="bairro"
                        value={form.bairro}
                        onChange={(e) => updateForm("bairro", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Seu bairro"
                      />
                      {errors.bairro && <p className="text-red-400 text-sm mt-1">{errors.bairro}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cidade" className="text-green-300">
                        Cidade *
                      </Label>
                      <Input
                        id="cidade"
                        value={form.cidade}
                        onChange={(e) => updateForm("cidade", e.target.value)}
                        className="bg-black/30 border-green-500 text-white"
                        placeholder="Sua cidade"
                      />
                      {errors.cidade && <p className="text-red-400 text-sm mt-1">{errors.cidade}</p>}
                    </div>
                    <div>
                      <Label htmlFor="estado" className="text-green-300">
                        Estado *
                      </Label>
                      <Select value={form.estado} onValueChange={(value) => updateForm("estado", value)}>
                        <SelectTrigger className="bg-black/30 border-green-500 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-green-500">
                          <SelectItem value="RJ" className="text-white">
                            Rio de Janeiro
                          </SelectItem>
                          <SelectItem value="SP" className="text-white">
                            São Paulo
                          </SelectItem>
                          <SelectItem value="MG" className="text-white">
                            Minas Gerais
                          </SelectItem>
                          <SelectItem value="ES" className="text-white">
                            Espírito Santo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.estado && <p className="text-red-400 text-sm mt-1">{errors.estado}</p>}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="border-green-500 text-green-400 bg-transparent"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button onClick={nextStep} className="cannabis-button">
                      Continuar
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Etapa 3: Pagamento */}
            {currentStep === 3 && (
              <Card className="bud-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Método de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        form.metodoPagamento === "pix"
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-600 hover:border-green-500/50"
                      }`}
                      onClick={() => updateForm("metodoPagamento", "pix")}
                    >
                      <div className="text-center">
                        <QrCode className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <h3 className="font-bold text-green-400">PIX</h3>
                        <p className="text-sm text-green-300">Aprovação instantânea</p>
                      </div>
                    </div>
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        form.metodoPagamento === "cartao"
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-600 hover:border-green-500/50"
                      }`}
                      onClick={() => updateForm("metodoPagamento", "cartao")}
                    >
                      <div className="text-center">
                        <CreditCard className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <h3 className="font-bold text-green-400">Cartão</h3>
                        <p className="text-sm text-green-300">Crédito ou Débito</p>
                      </div>
                    </div>
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        form.metodoPagamento === "boleto"
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-600 hover:border-green-500/50"
                      }`}
                      onClick={() => updateForm("metodoPagamento", "boleto")}
                    >
                      <div className="text-center">
                        <Banknote className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <h3 className="font-bold text-green-400">Boleto</h3>
                        <p className="text-sm text-green-300">Vence em 3 dias</p>
                      </div>
                    </div>
                  </div>
                  {errors.metodoPagamento && <p className="text-red-400 text-sm">{errors.metodoPagamento}</p>}

                  <div>
                    <Label htmlFor="observacoes" className="text-green-300">
                      Observações
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={form.observacoes}
                      onChange={(e) => updateForm("observacoes", e.target.value)}
                      className="bg-black/30 border-green-500 text-white"
                      placeholder="Alguma observação especial para a entrega?"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="border-green-500 text-green-400 bg-transparent"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button onClick={finalizarPedido} className="cannabis-button" disabled={isLoading}>
                      {isLoading ? "Processando..." : "Finalizar Pedido"}
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                      <Image
                        src={item.image || "/placeholder.svg?height=50&width=50&text=🌿"}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded border border-green-500/30"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-green-400 line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-green-300">Qtd: {item.quantity}</p>
                        <p className="text-sm font-bold text-green-400">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-green-500/30" />

                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between text-green-300">
                    <span>Subtotal ({itemCount} itens)</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-300">
                    <span className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Frete
                    </span>
                    <span>{frete > 0 ? `R$ ${frete.toFixed(2)}` : "Calcular"}</span>
                  </div>
                  {tempoEntrega && <div className="text-xs text-orange-400">Entrega em {tempoEntrega}</div>}
                  <Separator className="bg-green-500/30" />
                  <div className="flex justify-between text-xl font-bold text-green-400">
                    <span>Total</span>
                    <span>R$ {totalFinal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Informações de Segurança */}
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Compra Segura</span>
                  </div>
                  <ul className="text-xs text-green-300 space-y-1">
                    <li>• Dados protegidos com SSL</li>
                    <li>• Entrega discreta garantida</li>
                    <li>• Suporte 24/7 disponível</li>
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
