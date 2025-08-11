"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Package, Leaf } from "lucide-react"

interface GeneticTemplate {
  id: number
  name: string
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
  name: string
  slug: string
  extraction_type: string
  price: number
  stock_grams: number
  is_active: boolean
  template_name: string
  template_category: string
  created_at: string
}

const CATEGORIES = ["Indica", "Sativa", "Híbrida"]
const EXTRACTION_TYPES = ["Ice", "PAC", "Dry", "Rosin", "Live Resin", "Bubble Hash"]
const EFFECTS = ["Relaxante", "Energizante", "Criativo", "Focado", "Eufórico", "Sedativo", "Analgésico"]
const FLAVORS = ["Citrus", "Doce", "Terroso", "Pinho", "Frutal", "Diesel", "Skunk", "Floral"]
const MEDICAL_USES = ["Ansiedade", "Dor", "Insônia", "Depressão", "Náusea", "Inflamação", "Epilepsia"]

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<GeneticTemplate[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<GeneticTemplate | null>(null)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "",
    thc_percentage: 0,
    cbd_percentage: 0,
    effects: [] as string[],
    flavors: [] as string[],
    medical_uses: [] as string[],
    description: "",
  })

  // Product form state
  const [productForm, setProductForm] = useState({
    template_id: "",
    name: "",
    extraction_type: "",
    price: 0,
    stock_grams: 0,
    description: "",
  })

  useEffect(() => {
    fetchTemplates()
    fetchProducts()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTemplate ? "/api/admin/templates" : "/api/admin/templates"
      const method = editingTemplate ? "PUT" : "POST"
      const body = editingTemplate ? { ...templateForm, id: editingTemplate.id } : templateForm

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        fetchTemplates()
        resetTemplateForm()
        setShowTemplateForm(false)
      }
    } catch (error) {
      console.error("Error saving template:", error)
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
        fetchProducts()
        resetProductForm()
        setShowProductForm(false)
      }
    } catch (error) {
      console.error("Error creating product:", error)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este template?")) {
      try {
        const response = await fetch(`/api/admin/templates?id=${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchTemplates()
        }
      } catch (error) {
        console.error("Error deleting template:", error)
      }
    }
  }

  const handleEditTemplate = (template: GeneticTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
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
      category: "",
      thc_percentage: 0,
      cbd_percentage: 0,
      effects: [],
      flavors: [],
      medical_uses: [],
      description: "",
    })
    setEditingTemplate(null)
  }

  const resetProductForm = () => {
    setProductForm({
      template_id: "",
      name: "",
      extraction_type: "",
      price: 0,
      stock_grams: 0,
      description: "",
    })
  }

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item))
    } else {
      setter([...array, item])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🌿 Painel Admin - Cannabis Marketplace</h1>
          <p className="text-green-200">Gerencie templates de genéticas e produtos</p>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="bg-green-800/50 border-green-600">
            <TabsTrigger value="templates" className="data-[state=active]:bg-green-600">
              <Leaf className="w-4 h-4 mr-2" />
              Templates de Genéticas
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-green-600">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Templates de Genéticas</h2>
              <Button onClick={() => setShowTemplateForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </div>

            {showTemplateForm && (
              <Card className="bg-green-800/30 border-green-600">
                <CardHeader>
                  <CardTitle className="text-white">{editingTemplate ? "Editar Template" : "Novo Template"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-green-200">
                          Nome da Genética
                        </Label>
                        <Input
                          id="name"
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                          className="bg-green-900/50 border-green-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-green-200">
                          Categoria
                        </Label>
                        <Select
                          value={templateForm.category}
                          onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
                        >
                          <SelectTrigger className="bg-green-900/50 border-green-600 text-white">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="thc" className="text-green-200">
                          THC %
                        </Label>
                        <Input
                          id="thc"
                          type="number"
                          step="0.1"
                          value={templateForm.thc_percentage}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, thc_percentage: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="bg-green-900/50 border-green-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cbd" className="text-green-200">
                          CBD %
                        </Label>
                        <Input
                          id="cbd"
                          type="number"
                          step="0.1"
                          value={templateForm.cbd_percentage}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, cbd_percentage: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="bg-green-900/50 border-green-600 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-green-200">Efeitos</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {EFFECTS.map((effect) => (
                          <Badge
                            key={effect}
                            variant={templateForm.effects.includes(effect) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              templateForm.effects.includes(effect)
                                ? "bg-green-600 text-white"
                                : "border-green-600 text-green-200 hover:bg-green-600 hover:text-white"
                            }`}
                            onClick={() =>
                              toggleArrayItem(templateForm.effects, effect, (effects) =>
                                setTemplateForm({ ...templateForm, effects }),
                              )
                            }
                          >
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-green-200">Sabores</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {FLAVORS.map((flavor) => (
                          <Badge
                            key={flavor}
                            variant={templateForm.flavors.includes(flavor) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              templateForm.flavors.includes(flavor)
                                ? "bg-green-600 text-white"
                                : "border-green-600 text-green-200 hover:bg-green-600 hover:text-white"
                            }`}
                            onClick={() =>
                              toggleArrayItem(templateForm.flavors, flavor, (flavors) =>
                                setTemplateForm({ ...templateForm, flavors }),
                              )
                            }
                          >
                            {flavor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-green-200">Usos Medicinais</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {MEDICAL_USES.map((use) => (
                          <Badge
                            key={use}
                            variant={templateForm.medical_uses.includes(use) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              templateForm.medical_uses.includes(use)
                                ? "bg-green-600 text-white"
                                : "border-green-600 text-green-200 hover:bg-green-600 hover:text-white"
                            }`}
                            onClick={() =>
                              toggleArrayItem(templateForm.medical_uses, use, (medical_uses) =>
                                setTemplateForm({ ...templateForm, medical_uses }),
                              )
                            }
                          >
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-green-200">
                        Descrição
                      </Label>
                      <textarea
                        id="description"
                        value={templateForm.description}
                        onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                        className="w-full p-3 bg-green-900/50 border border-green-600 rounded-md text-white resize-none"
                        rows={3}
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
                          resetTemplateForm()
                        }}
                        className="border-green-600 text-green-200 hover:bg-green-600 hover:text-white"
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
                <Card key={template.id} className="bg-green-800/30 border-green-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{template.name}</CardTitle>
                        <CardDescription className="text-green-200">{template.category}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTemplate(template)}
                          className="border-green-600 text-green-200 hover:bg-green-600 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="border-red-600 text-red-200 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-200">THC: {template.thc_percentage}%</span>
                        <span className="text-green-200">CBD: {template.cbd_percentage}%</span>
                      </div>

                      {template.effects && template.effects.length > 0 && (
                        <div>
                          <p className="text-green-200 text-sm mb-1">Efeitos:</p>
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
                        <p className="text-green-200 text-sm line-clamp-2">{template.description}</p>
                      )}

                      <div className="flex justify-between items-center">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        <span className="text-xs text-green-300">
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
              <h2 className="text-2xl font-bold text-white">Produtos</h2>
              <Button onClick={() => setShowProductForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {showProductForm && (
              <Card className="bg-green-800/30 border-green-600">
                <CardHeader>
                  <CardTitle className="text-white">Novo Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template_id" className="text-green-200">
                          Template Base
                        </Label>
                        <Select
                          value={productForm.template_id}
                          onValueChange={(value) => setProductForm({ ...productForm, template_id: value })}
                        >
                          <SelectTrigger className="bg-green-900/50 border-green-600 text-white">
                            <SelectValue placeholder="Selecione o template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates
                              .filter((t) => t.is_active)
                              .map((template) => (
                                <SelectItem key={template.id} value={template.id.toString()}>
                                  {template.name} ({template.category})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="product_name" className="text-green-200">
                          Nome do Produto
                        </Label>
                        <Input
                          id="product_name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="bg-green-900/50 border-green-600 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="extraction_type" className="text-green-200">
                          Tipo de Extração
                        </Label>
                        <Select
                          value={productForm.extraction_type}
                          onValueChange={(value) => setProductForm({ ...productForm, extraction_type: value })}
                        >
                          <SelectTrigger className="bg-green-900/50 border-green-600 text-white">
                            <SelectValue placeholder="Tipo de extração" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXTRACTION_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-green-200">
                          Preço (R$/g)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({ ...productForm, price: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="bg-green-900/50 border-green-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock_grams" className="text-green-200">
                          Estoque (gramas)
                        </Label>
                        <Input
                          id="stock_grams"
                          type="number"
                          step="0.1"
                          value={productForm.stock_grams}
                          onChange={(e) =>
                            setProductForm({ ...productForm, stock_grams: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="bg-green-900/50 border-green-600 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="product_description" className="text-green-200">
                        Descrição
                      </Label>
                      <textarea
                        id="product_description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full p-3 bg-green-900/50 border border-green-600 rounded-md text-white resize-none"
                        rows={3}
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
                        className="border-green-600 text-green-200 hover:bg-green-600 hover:text-white"
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
                <Card key={product.id} className="bg-green-800/30 border-green-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{product.name}</CardTitle>
                        <CardDescription className="text-green-200">
                          {product.template_name} • {product.extraction_type}
                        </CardDescription>
                      </div>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-green-200">Preço:</span>
                        <span className="text-white font-bold">R$ {product.price.toFixed(2)}/g</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-200">Estoque:</span>
                        <span className={`font-bold ${product.stock_grams > 0 ? "text-green-400" : "text-red-400"}`}>
                          {product.stock_grams}g
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-200">Categoria:</span>
                        <Badge variant="outline" className="border-green-600 text-green-200">
                          {product.template_category}
                        </Badge>
                      </div>
                      <div className="text-xs text-green-300">
                        Criado em: {new Date(product.created_at).toLocaleDateString()}
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
