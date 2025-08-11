"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Package, AlertCircle } from "lucide-react"

interface GeneticTemplate {
  id: number
  name: string
  strain_type: "indica" | "sativa" | "hybrid"
  thc_min: number
  thc_max: number
  cbd_min: number
  cbd_max: number
  description: string
  effects: string[]
  flavors: string[]
  medical_uses: string[]
  flowering_time_weeks: number
  yield_indoor: string
  yield_outdoor: string
  active: boolean
  products_count: number
  active_products: number
  created_at: string
}

interface Product {
  id: number
  name: string
  template_name: string
  strain_type: string
  extraction_type: string
  color_code: string
  price_per_gram: number
  stock_grams: number
  thc_percentage: number
  cbd_percentage: number
  active: boolean
  created_at: string
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<GeneticTemplate[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [showNewProduct, setShowNewProduct] = useState(false)

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    strain_type: "hybrid" as const,
    thc_min: 0,
    thc_max: 0,
    cbd_min: 0,
    cbd_max: 0,
    description: "",
    effects: "",
    flavors: "",
    medical_uses: "",
    flowering_time_weeks: 8,
    yield_indoor: "",
    yield_outdoor: "",
  })

  const [newProduct, setNewProduct] = useState({
    template_id: "",
    extraction_type_id: "1",
    category_id: "2",
    name: "",
    price_per_gram: 50,
    stock_grams: 10,
    thc_percentage: 20,
    cbd_percentage: 0.5,
    description: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [templatesRes, productsRes] = await Promise.all([
        fetch("/api/admin/templates"),
        fetch("/api/admin/products"),
      ])

      const templatesData = await templatesRes.json()
      const productsData = await productsRes.json()

      if (templatesData.success) setTemplates(templatesData.templates)
      if (productsData.success) setProducts(productsData.products)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async () => {
    try {
      const templateData = {
        ...newTemplate,
        effects: newTemplate.effects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        flavors: newTemplate.flavors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        medical_uses: newTemplate.medical_uses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }

      const response = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      })

      const data = await response.json()
      if (data.success) {
        setTemplates([...templates, data.template])
        setShowNewTemplate(false)
        setNewTemplate({
          name: "",
          strain_type: "hybrid",
          thc_min: 0,
          thc_max: 0,
          cbd_min: 0,
          cbd_max: 0,
          description: "",
          effects: "",
          flavors: "",
          medical_uses: "",
          flowering_time_weeks: 8,
          yield_indoor: "",
          yield_outdoor: "",
        })
      }
    } catch (error) {
      console.error("Error creating template:", error)
    }
  }

  const createProduct = async () => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })

      const data = await response.json()
      if (data.success) {
        fetchData() // Refresh data
        setShowNewProduct(false)
        setNewProduct({
          template_id: "",
          extraction_type_id: "1",
          category_id: "2",
          name: "",
          price_per_gram: 50,
          stock_grams: 10,
          thc_percentage: 20,
          cbd_percentage: 0.5,
          description: "",
        })
      }
    } catch (error) {
      console.error("Error creating product:", error)
    }
  }

  const updateProductStock = async (productId: number, newStock: number) => {
    try {
      const product = products.find((p) => p.id === productId)
      if (!product) return

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_grams: newStock,
          price_per_gram: product.price_per_gram,
          active: product.active,
          reason: "Stock update via admin panel",
        }),
      })

      const data = await response.json()
      if (data.success) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error("Error updating stock:", error)
    }
  }

  const getStrainColor = (type: string) => {
    switch (type) {
      case "indica":
        return "bg-purple-100 text-purple-800"
      case "sativa":
        return "bg-green-100 text-green-800"
      case "hybrid":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧬 Painel Admin - Genéticas & Produtos</h1>
          <p className="text-gray-600">Gerencie templates de genéticas e produtos do marketplace</p>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates de Genéticas</TabsTrigger>
            <TabsTrigger value="products">Produtos & Estoque</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Templates de Genéticas</h2>
              <Button onClick={() => setShowNewTemplate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Genética
              </Button>
            </div>

            {showNewTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Nova Genética</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome da Genética</Label>
                      <Input
                        id="name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="Ex: Purple Haze"
                      />
                    </div>
                    <div>
                      <Label htmlFor="strain_type">Tipo</Label>
                      <Select
                        value={newTemplate.strain_type}
                        onValueChange={(value: any) => setNewTemplate({ ...newTemplate, strain_type: value })}
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
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="thc_min">THC Min (%)</Label>
                      <Input
                        id="thc_min"
                        type="number"
                        value={newTemplate.thc_min}
                        onChange={(e) => setNewTemplate({ ...newTemplate, thc_min: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="thc_max">THC Max (%)</Label>
                      <Input
                        id="thc_max"
                        type="number"
                        value={newTemplate.thc_max}
                        onChange={(e) => setNewTemplate({ ...newTemplate, thc_max: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cbd_min">CBD Min (%)</Label>
                      <Input
                        id="cbd_min"
                        type="number"
                        step="0.1"
                        value={newTemplate.cbd_min}
                        onChange={(e) => setNewTemplate({ ...newTemplate, cbd_min: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cbd_max">CBD Max (%)</Label>
                      <Input
                        id="cbd_max"
                        type="number"
                        step="0.1"
                        value={newTemplate.cbd_max}
                        onChange={(e) => setNewTemplate({ ...newTemplate, cbd_max: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      placeholder="Descrição detalhada da genética..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="effects">Efeitos (separados por vírgula)</Label>
                      <Input
                        id="effects"
                        value={newTemplate.effects}
                        onChange={(e) => setNewTemplate({ ...newTemplate, effects: e.target.value })}
                        placeholder="relaxante, eufórico, criativo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="flavors">Sabores (separados por vírgula)</Label>
                      <Input
                        id="flavors"
                        value={newTemplate.flavors}
                        onChange={(e) => setNewTemplate({ ...newTemplate, flavors: e.target.value })}
                        placeholder="terroso, cítrico, doce"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medical_uses">Usos Medicinais (separados por vírgula)</Label>
                      <Input
                        id="medical_uses"
                        value={newTemplate.medical_uses}
                        onChange={(e) => setNewTemplate({ ...newTemplate, medical_uses: e.target.value })}
                        placeholder="ansiedade, dor, insônia"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={createTemplate}>Criar Template</Button>
                    <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getStrainColor(template.strain_type)}>{template.strain_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>
                        THC: {template.thc_min}% - {template.thc_max}%
                      </span>
                      <span>
                        CBD: {template.cbd_min}% - {template.cbd_max}%
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>

                    {template.effects && template.effects.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Efeitos:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.effects.slice(0, 3).map((effect, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-gray-500">
                        <Package className="w-4 h-4 inline mr-1" />
                        {template.active_products}/{template.products_count} produtos
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Produtos & Estoque</h2>
              <Button onClick={() => setShowNewProduct(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {showNewProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template_id">Template Base</Label>
                      <Select
                        value={newProduct.template_id}
                        onValueChange={(value) => setNewProduct({ ...newProduct, template_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma genética" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name} ({template.strain_type})
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
                        placeholder="Ex: OG Kush - Ice Hash"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Preço por Grama (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price_per_gram}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, price_per_gram: Number.parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Estoque (gramas)</Label>
                      <Input
                        id="stock"
                        type="number"
                        step="0.001"
                        value={newProduct.stock_grams}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, stock_grams: Number.parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="thc">THC (%)</Label>
                      <Input
                        id="thc"
                        type="number"
                        step="0.1"
                        value={newProduct.thc_percentage}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, thc_percentage: Number.parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={createProduct}>Criar Produto</Button>
                    <Button variant="outline" onClick={() => setShowNewProduct(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <Badge className={getStrainColor(product.strain_type)}>{product.strain_type}</Badge>
                          <Badge style={{ backgroundColor: product.color_code, color: "white" }}>
                            {product.extraction_type}
                          </Badge>
                          {!product.active && (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Preço/g:</span>
                            <p className="font-medium">R$ {product.price_per_gram.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Estoque:</span>
                            <p
                              className={`font-medium ${product.stock_grams <= 5 ? "text-red-600" : "text-green-600"}`}
                            >
                              {product.stock_grams}g
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">THC:</span>
                            <p className="font-medium">{product.thc_percentage}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">CBD:</span>
                            <p className="font-medium">{product.cbd_percentage}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.001"
                          className="w-24"
                          placeholder="Novo estoque"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const newStock = Number.parseFloat((e.target as HTMLInputElement).value)
                              if (!isNaN(newStock)) {
                                updateProductStock(product.id, newStock)
                                ;(e.target as HTMLInputElement).value = ""
                              }
                            }
                          }}
                        />
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
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
