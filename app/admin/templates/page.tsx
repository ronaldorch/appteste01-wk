"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Package, Leaf, Beaker } from "lucide-react"

interface GeneticTemplate {
  id: number
  name: string
  type: string
  category: string
  thc_percentage: number
  cbd_percentage: number
  effects: string[]
  flavors: string[]
  medical_uses: string[]
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Product {
  id: number
  template_id: number
  name: string
  slug: string
  extraction_type: string
  price: number
  stock_grams: number
  description: string
  is_active: boolean
  template_name: string
  template_type: string
  template_category: string
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<GeneticTemplate[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<GeneticTemplate | null>(null)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "indica",
    category: "premium",
    thc_percentage: 0,
    cbd_percentage: 0,
    effects: [] as string[],
    flavors: [] as string[],
    medical_uses: [] as string[],
    description: "",
  })

  const [productForm, setProductForm] = useState({
    template_id: "",
    name: "",
    extraction_type: "dry",
    price: 0,
    stock_grams: 0,
    description: "",
  })

  const extractionTypes = [
    { value: "dry", label: "Dry (Seco)" },
    { value: "ice", label: "Ice Water Hash" },
    { value: "pac", label: "PAC (Prensado)" },
    { value: "rosin", label: "Rosin" },
    { value: "live_resin", label: "Live Resin" },
    { value: "bubble_hash", label: "Bubble Hash" },
  ]

  const effectOptions = [
    "Relaxante",
    "Eufórico",
    "Criativo",
    "Energético",
    "Sonolento",
    "Focado",
    "Feliz",
    "Calmante",
    "Estimulante",
    "Medicinal",
  ]

  const flavorOptions = [
    "Citrus",
    "Doce",
    "Terroso",
    "Pinho",
    "Floral",
    "Frutado",
    "Diesel",
    "Skunk",
    "Mentolado",
    "Picante",
    "Amadeirado",
  ]

  const medicalOptions = [
    "Ansiedade",
    "Depressão",
    "Dor Crônica",
    "Insônia",
    "Estresse",
    "Náusea",
    "Perda de Apetite",
    "Epilepsia",
    "Glaucoma",
    "Artrite",
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [templatesRes, productsRes] = await Promise.all([
        fetch("/api/admin/templates"),
        fetch("/api/admin/products"),
      ])

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData.templates || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }
    } catch (err) {
      setError("Erro ao carregar dados")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingTemplate ? "PUT" : "POST"
      const body = editingTemplate ? { ...templateForm, id: editingTemplate.id } : templateForm

      const response = await fetch("/api/admin/templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setSuccess(editingTemplate ? "Template atualizado!" : "Template criado!")
        setShowTemplateForm(false)
        setEditingTemplate(null)
        resetTemplateForm()
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao salvar template")
      }
    } catch (err) {
      setError("Erro ao salvar template")
      console.error(err)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      })

      if (response.ok) {
        setSuccess("Produto criado!")
        setShowProductForm(false)
        resetProductForm()
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao criar produto")
      }
    } catch (err) {
      setError("Erro ao criar produto")
      console.error(err)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return

    try {
      const response = await fetch(`/api/admin/templates?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Template excluído!")
        fetchData()
      } else {
        setError("Erro ao excluir template")
      }
    } catch (err) {
      setError("Erro ao excluir template")
      console.error(err)
    }
  }

  const handleEditTemplate = (template: GeneticTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      type: template.type,
      category: template.category,
      thc_percentage: template.thc_percentage,
      cbd_percentage: template.cbd_percentage,
      effects: template.effects || [],
      flavors: template.flavors || [],
      medical_uses: template.medical_uses || [],
      description: template.description,
    })
    setShowTemplateForm(true)
  }

  const resetTemplateForm = () => {
    setTemplateForm({
      name: "",
      type: "indica",
      category: "premium",
      thc_percentage: 0,
      cbd_percentage: 0,
      effects: [],
      flavors: [],
      medical_uses: [],
      description: "",
    })
  }

  const resetProductForm = () => {
    setProductForm({
      template_id: "",
      name: "",
      extraction_type: "dry",
      price: 0,
      stock_grams: 0,
      description: "",
    })
  }

  const addArrayItem = (field: keyof typeof templateForm, value: string) => {
    if (value && !templateForm[field].includes(value)) {
      setTemplateForm((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value],
      }))
    }
  }

  const removeArrayItem = (field: keyof typeof templateForm, value: string) => {
    setTemplateForm((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((item) => item !== value),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            <Leaf className="inline-block mr-3" />
            Painel Admin - Estação da Fumaça
          </h1>
          <p className="text-green-600">Gerencie templates de genéticas e produtos</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates de Genéticas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-green-800">Templates de Genéticas</h2>
              <Button onClick={() => setShowTemplateForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </div>

            {showTemplateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingTemplate ? "Editar Template" : "Novo Template"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome da Genética</Label>
                        <Input
                          id="name"
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Tipo</Label>
                        <Select
                          value={templateForm.type}
                          onValueChange={(value) => setTemplateForm((prev) => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indica">Indica</SelectItem>
                            <SelectItem value="sativa">Sativa</SelectItem>
                            <SelectItem value="hybrid">Híbrida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={templateForm.category}
                          onValueChange={(value) => setTemplateForm((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="exotic">Exotic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="thc">THC %</Label>
                        <Input
                          id="thc"
                          type="number"
                          step="0.1"
                          value={templateForm.thc_percentage}
                          onChange={(e) =>
                            setTemplateForm((prev) => ({
                              ...prev,
                              thc_percentage: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cbd">CBD %</Label>
                        <Input
                          id="cbd"
                          type="number"
                          step="0.1"
                          value={templateForm.cbd_percentage}
                          onChange={(e) =>
                            setTemplateForm((prev) => ({
                              ...prev,
                              cbd_percentage: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Efeitos</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {templateForm.effects.map((effect) => (
                          <Badge
                            key={effect}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeArrayItem("effects", effect)}
                          >
                            {effect} ×
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={(value) => addArrayItem("effects", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Adicionar efeito" />
                        </SelectTrigger>
                        <SelectContent>
                          {effectOptions.map((effect) => (
                            <SelectItem key={effect} value={effect}>
                              {effect}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Sabores</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {templateForm.flavors.map((flavor) => (
                          <Badge
                            key={flavor}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeArrayItem("flavors", flavor)}
                          >
                            {flavor} ×
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={(value) => addArrayItem("flavors", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Adicionar sabor" />
                        </SelectTrigger>
                        <SelectContent>
                          {flavorOptions.map((flavor) => (
                            <SelectItem key={flavor} value={flavor}>
                              {flavor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Usos Medicinais</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {templateForm.medical_uses.map((use) => (
                          <Badge
                            key={use}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeArrayItem("medical_uses", use)}
                          >
                            {use} ×
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={(value) => addArrayItem("medical_uses", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Adicionar uso medicinal" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicalOptions.map((use) => (
                            <SelectItem key={use} value={use}>
                              {use}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <textarea
                        id="description"
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        value={templateForm.description}
                        onChange={(e) => setTemplateForm((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        {editingTemplate ? "Atualizar" : "Criar"} Template
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowTemplateForm(false)
                          setEditingTemplate(null)
                          resetTemplateForm()
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-green-800">{template.name}</CardTitle>
                        <CardDescription>
                          {template.type} • {template.category}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>THC: {template.thc_percentage}%</span>
                        <span>CBD: {template.cbd_percentage}%</span>
                      </div>

                      {template.effects && template.effects.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Efeitos:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.effects.slice(0, 3).map((effect) => (
                              <Badge key={effect} variant="secondary" className="text-xs">
                                {effect}
                              </Badge>
                            ))}
                            {template.effects.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.effects.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {template.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(template.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-green-800">Produtos</h2>
              <Button onClick={() => setShowProductForm(true)} className="bg-green-600 hover:bg-green-700">
                <Package className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {showProductForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Novo Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template_id">Template Base</Label>
                        <Select
                          value={productForm.template_id}
                          onValueChange={(value) => setProductForm((prev) => ({ ...prev, template_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name} ({template.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="product_name">Nome do Produto</Label>
                        <Input
                          id="product_name"
                          value={productForm.name}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="extraction_type">Tipo de Extração</Label>
                        <Select
                          value={productForm.extraction_type}
                          onValueChange={(value) => setProductForm((prev) => ({ ...prev, extraction_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {extractionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price">Preço (R$/g)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Estoque (gramas)</Label>
                        <Input
                          id="stock"
                          type="number"
                          step="0.1"
                          value={productForm.stock_grams}
                          onChange={(e) =>
                            setProductForm((prev) => ({ ...prev, stock_grams: Number.parseFloat(e.target.value) || 0 }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="product_description">Descrição</Label>
                      <textarea
                        id="product_description"
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        value={productForm.description}
                        onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Criar Produto
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowProductForm(false)
                          resetProductForm()
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-green-800">{product.name}</CardTitle>
                        <CardDescription>
                          {product.template_name} • {product.extraction_type}
                        </CardDescription>
                      </div>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">R$ {product.price.toFixed(2)}/g</span>
                        <span className="text-sm text-gray-600">{product.stock_grams}g em estoque</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-gray-500" />
                        <span className="text-sm capitalize">
                          {extractionTypes.find((t) => t.value === product.extraction_type)?.label}
                        </span>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      )}

                      <div className="pt-2 border-t">
                        <span className="text-xs text-gray-500">
                          Criado em {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
