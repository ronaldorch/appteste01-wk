"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Save, X, Leaf, Beaker, Package } from "lucide-react"

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
  description: string
  price: number
  stock_grams: number
  extraction_type: string
  is_active: boolean
  template_name: string
  template_type: string
  template_category: string
  created_at: string
  updated_at: string
}

const EXTRACTION_TYPES = [
  { value: "flower", label: "Flower (Flor)" },
  { value: "ice", label: "Ice Hash" },
  { value: "pac", label: "PAC (Pressed)" },
  { value: "dry", label: "Dry Sift" },
  { value: "rosin", label: "Rosin" },
  { value: "live_resin", label: "Live Resin" },
  { value: "shatter", label: "Shatter" },
  { value: "wax", label: "Wax" },
]

const CANNABIS_TYPES = [
  { value: "indica", label: "Indica" },
  { value: "sativa", label: "Sativa" },
  { value: "hybrid", label: "Híbrida" },
  { value: "ruderalis", label: "Ruderalis" },
]

const CATEGORIES = [
  { value: "premium", label: "Premium" },
  { value: "standard", label: "Standard" },
  { value: "budget", label: "Budget" },
  { value: "exotic", label: "Exotic" },
  { value: "medical", label: "Medical" },
]

const COMMON_EFFECTS = [
  "Relaxante",
  "Eufórico",
  "Criativo",
  "Energético",
  "Sonolento",
  "Focado",
  "Feliz",
  "Calmante",
  "Estimulante",
  "Analgésico",
]

const COMMON_FLAVORS = [
  "Citrus",
  "Doce",
  "Terroso",
  "Pinheiro",
  "Frutal",
  "Floral",
  "Picante",
  "Diesel",
  "Mentolado",
  "Tropical",
]

const MEDICAL_USES = [
  "Ansiedade",
  "Depressão",
  "Dor Crônica",
  "Insônia",
  "Estresse",
  "Inflamação",
  "Náusea",
  "Perda de Apetite",
  "Epilepsia",
  "PTSD",
]

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<GeneticTemplate[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<GeneticTemplate | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [showNewProduct, setShowNewProduct] = useState(false)

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "hybrid",
    category: "standard",
    thc_percentage: 0,
    cbd_percentage: 0,
    effects: [] as string[],
    flavors: [] as string[],
    medical_uses: [] as string[],
    description: "",
  })

  const [newProduct, setNewProduct] = useState({
    template_id: 0,
    name: "",
    description: "",
    price: 0,
    stock_grams: 0,
    extraction_type: "flower",
  })

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
        setTemplates(templatesData)
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }
    } catch (error) {
      setError("Erro ao carregar dados")
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      })

      if (response.ok) {
        setSuccess("Template criado com sucesso!")
        setShowNewTemplate(false)
        setNewTemplate({
          name: "",
          type: "hybrid",
          category: "standard",
          thc_percentage: 0,
          cbd_percentage: 0,
          effects: [],
          flavors: [],
          medical_uses: [],
          description: "",
        })
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao criar template")
      }
    } catch (error) {
      setError("Erro ao criar template")
      console.error("Error creating template:", error)
    }
  }

  const handleCreateProduct = async () => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })

      if (response.ok) {
        setSuccess("Produto criado com sucesso!")
        setShowNewProduct(false)
        setNewProduct({
          template_id: 0,
          name: "",
          description: "",
          price: 0,
          stock_grams: 0,
          extraction_type: "flower",
        })
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao criar produto")
      }
    } catch (error) {
      setError("Erro ao criar produto")
      console.error("Error creating product:", error)
    }
  }

  const handleUpdateTemplate = async (template: GeneticTemplate) => {
    try {
      const response = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      })

      if (response.ok) {
        setSuccess("Template atualizado com sucesso!")
        setEditingTemplate(null)
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao atualizar template")
      }
    } catch (error) {
      setError("Erro ao atualizar template")
      console.error("Error updating template:", error)
    }
  }

  const handleUpdateProduct = async (product: Product) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })

      if (response.ok) {
        setSuccess("Produto atualizado com sucesso!")
        setEditingProduct(null)
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao atualizar produto")
      }
    } catch (error) {
      setError("Erro ao atualizar produto")
      console.error("Error updating product:", error)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este template?")) return

    try {
      const response = await fetch(`/api/admin/templates?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Template deletado com sucesso!")
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao deletar template")
      }
    } catch (error) {
      setError("Erro ao deletar template")
      console.error("Error deleting template:", error)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Produto deletado com sucesso!")
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao deletar produto")
      }
    } catch (error) {
      setError("Erro ao deletar produto")
      console.error("Error deleting product:", error)
    }
  }

  const addArrayItem = (array: string[], item: string, setter: (value: string[]) => void, maxItems = 10) => {
    if (item && !array.includes(item) && array.length < maxItems) {
      setter([...array, item])
    }
  }

  const removeArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    setter(array.filter((i) => i !== item))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Leaf className="h-10 w-10" />
            Painel Admin - Cannabis Marketplace
          </h1>
          <p className="text-green-100">Gerencie templates de genéticas e produtos</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-green-800">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Templates de Genéticas
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Templates de Genéticas ({templates.length})</h2>
              <Button onClick={() => setShowNewTemplate(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </div>

            {showNewTemplate && (
              <Card className="border-green-500 bg-white/95 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Criar Novo Template</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewTemplate(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome da Genética</Label>
                      <Input
                        id="name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="Ex: OG Kush, White Widow..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={newTemplate.type}
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CANNABIS_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="thc">THC %</Label>
                      <Input
                        id="thc"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={newTemplate.thc_percentage}
                        onChange={(e) =>
                          setNewTemplate({ ...newTemplate, thc_percentage: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="cbd">CBD %</Label>
                      <Input
                        id="cbd"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={newTemplate.cbd_percentage}
                        onChange={(e) =>
                          setNewTemplate({ ...newTemplate, cbd_percentage: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Efeitos</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newTemplate.effects.map((effect) => (
                        <Badge
                          key={effect}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() =>
                            removeArrayItem(newTemplate.effects, effect, (effects) =>
                              setNewTemplate({ ...newTemplate, effects }),
                            )
                          }
                        >
                          {effect} ×
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) =>
                        addArrayItem(newTemplate.effects, value, (effects) =>
                          setNewTemplate({ ...newTemplate, effects }),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Adicionar efeito" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_EFFECTS.filter((effect) => !newTemplate.effects.includes(effect)).map((effect) => (
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
                      {newTemplate.flavors.map((flavor) => (
                        <Badge
                          key={flavor}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() =>
                            removeArrayItem(newTemplate.flavors, flavor, (flavors) =>
                              setNewTemplate({ ...newTemplate, flavors }),
                            )
                          }
                        >
                          {flavor} ×
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) =>
                        addArrayItem(newTemplate.flavors, value, (flavors) =>
                          setNewTemplate({ ...newTemplate, flavors }),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Adicionar sabor" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_FLAVORS.filter((flavor) => !newTemplate.flavors.includes(flavor)).map((flavor) => (
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
                      {newTemplate.medical_uses.map((use) => (
                        <Badge
                          key={use}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() =>
                            removeArrayItem(newTemplate.medical_uses, use, (medical_uses) =>
                              setNewTemplate({ ...newTemplate, medical_uses }),
                            )
                          }
                        >
                          {use} ×
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) =>
                        addArrayItem(newTemplate.medical_uses, value, (medical_uses) =>
                          setNewTemplate({ ...newTemplate, medical_uses }),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Adicionar uso medicinal" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICAL_USES.filter((use) => !newTemplate.medical_uses.includes(use)).map((use) => (
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
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      placeholder="Descrição detalhada da genética..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateTemplate} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Criar Template
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="border-green-500 bg-white/95 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{template.name}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {template.type} • {template.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>THC: {template.thc_percentage}%</span>
                        <span>CBD: {template.cbd_percentage}%</span>
                      </div>
                      {template.effects.length > 0 && (
                        <div>
                          <strong>Efeitos:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.effects.slice(0, 3).map((effect) => (
                              <Badge key={effect} variant="outline" className="text-xs">
                                {effect}
                              </Badge>
                            ))}
                            {template.effects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.effects.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {products.filter((p) => p.template_id === template.id).length} produtos
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
              <h2 className="text-2xl font-bold text-white">Produtos ({products.length})</h2>
              <Button onClick={() => setShowNewProduct(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {showNewProduct && (
              <Card className="border-green-500 bg-white/95 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Criar Novo Produto</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewProduct(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template">Template Base</Label>
                      <Select
                        value={newProduct.template_id.toString()}
                        onValueChange={(value) => setNewProduct({ ...newProduct, template_id: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates
                            .filter((t) => t.is_active)
                            .map((template) => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name} ({template.type})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="extraction_type">Tipo de Extração</Label>
                      <Select
                        value={newProduct.extraction_type}
                        onValueChange={(value) => setNewProduct({ ...newProduct, extraction_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXTRACTION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="product_name">Nome do Produto</Label>
                      <Input
                        id="product_name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Ex: OG Kush Ice Hash Premium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Preço (R$ por grama)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Estoque (gramas)</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        step="0.1"
                        value={newProduct.stock_grams}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, stock_grams: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="product_description">Descrição do Produto</Label>
                    <textarea
                      id="product_description"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Descrição específica do produto..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateProduct} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Criar Produto
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewProduct(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="border-green-500 bg-white/95 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-sm">{product.name}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {product.template_name} • {product.extraction_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Preço: R$ {product.price.toFixed(2)}/g</span>
                        <span>Estoque: {product.stock_grams}g</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline">
                          {EXTRACTION_TYPES.find((t) => t.value === product.extraction_type)?.label}
                        </Badge>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      )}
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
