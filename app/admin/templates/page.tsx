"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Eye, Trash2, Package, Leaf, TestTube } from "lucide-react"
import Image from "next/image"

interface Template {
  id: number
  name: string
  description: string
  genetics: string
  strain_type: string
  thc_level: string
  cbd_level: string
  effects: string[]
  flavors: string[]
  flowering_time: string
  difficulty: string
  yield: string
  height: string
  medical_uses: string[]
  terpenes: string[]
  grow_tips: string[]
  base_price: number
  image_url: string
  is_active: boolean
  category_name: string
  active_products: number
}

export default function TemplatesAdminPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    genetics: "",
    strain_type: "hybrid",
    thc_level: "",
    cbd_level: "",
    effects: "",
    flavors: "",
    flowering_time: "",
    difficulty: "medium",
    yield: "",
    height: "",
    medical_uses: "",
    terpenes: "",
    grow_tips: "",
    base_price: "",
    category_id: 1,
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const templateData = {
        ...formData,
        base_price: Number.parseFloat(formData.base_price),
        effects: formData.effects.split(",").map((s) => s.trim()),
        flavors: formData.flavors.split(",").map((s) => s.trim()),
        medical_uses: formData.medical_uses.split(",").map((s) => s.trim()),
        terpenes: formData.terpenes.split(",").map((s) => s.trim()),
        grow_tips: formData.grow_tips.split(",").map((s) => s.trim()),
      }

      const response = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        fetchTemplates()
        // Reset form
        setFormData({
          name: "",
          description: "",
          genetics: "",
          strain_type: "hybrid",
          thc_level: "",
          cbd_level: "",
          effects: "",
          flavors: "",
          flowering_time: "",
          difficulty: "medium",
          yield: "",
          height: "",
          medical_uses: "",
          terpenes: "",
          grow_tips: "",
          base_price: "",
          category_id: 1,
        })
      }
    } catch (error) {
      console.error("Erro ao criar template:", error)
    }
  }

  const getStrainTypeColor = (type: string) => {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Leaf className="h-8 w-8 text-green-600" />
                Templates de Genéticas
              </h1>
              <p className="text-gray-600 mt-1">Gerencie os templates base para seus produtos</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="products">Produtos Ativos</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            {showCreateForm && (
              <Card className="mb-6 bg-white/80 backdrop-blur-sm border-green-200">
                <CardHeader>
                  <CardTitle>Criar Novo Template</CardTitle>
                  <CardDescription>Defina as características base da genética</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTemplate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome da Genética</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: OG Kush"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="genetics">Genética</Label>
                        <Input
                          id="genetics"
                          value={formData.genetics}
                          onChange={(e) => setFormData({ ...formData, genetics: e.target.value })}
                          placeholder="Ex: Chemdawg x Lemon Thai"
                        />
                      </div>
                      <div>
                        <Label htmlFor="strain_type">Tipo</Label>
                        <select
                          id="strain_type"
                          value={formData.strain_type}
                          onChange={(e) => setFormData({ ...formData, strain_type: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="indica">Indica</option>
                          <option value="sativa">Sativa</option>
                          <option value="hybrid">Híbrida</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="base_price">Preço Base (R$/g)</Label>
                        <Input
                          id="base_price"
                          type="number"
                          step="0.01"
                          value={formData.base_price}
                          onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                          placeholder="45.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="thc_level">Nível THC</Label>
                        <Input
                          id="thc_level"
                          value={formData.thc_level}
                          onChange={(e) => setFormData({ ...formData, thc_level: e.target.value })}
                          placeholder="20-25%"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cbd_level">Nível CBD</Label>
                        <Input
                          id="cbd_level"
                          value={formData.cbd_level}
                          onChange={(e) => setFormData({ ...formData, cbd_level: e.target.value })}
                          placeholder="<1%"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Descrição detalhada da genética..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="effects">Efeitos (separados por vírgula)</Label>
                        <Input
                          id="effects"
                          value={formData.effects}
                          onChange={(e) => setFormData({ ...formData, effects: e.target.value })}
                          placeholder="relaxante, eufórico, criativo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="flavors">Sabores (separados por vírgula)</Label>
                        <Input
                          id="flavors"
                          value={formData.flavors}
                          onChange={(e) => setFormData({ ...formData, flavors: e.target.value })}
                          placeholder="terroso, pinho, limão"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Criar Template
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative bg-gradient-to-br from-green-100 to-emerald-200 rounded-t-lg">
                    <Image
                      src={template.image_url || "/placeholder.svg?height=300&width=300&text=🌿"}
                      alt={template.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className={getStrainTypeColor(template.strain_type)}>{template.strain_type}</Badge>
                      <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">{template.genetics}</CardDescription>
                      </div>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">R$ {template.base_price.toFixed(2)}/g</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {template.active_products} produtos
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">THC:</span> {template.thc_level}
                      </div>
                      <div>
                        <span className="font-medium">CBD:</span> {template.cbd_level}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.effects.slice(0, 3).map((effect, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {effect}
                        </Badge>
                      ))}
                      {template.effects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.effects.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Produtos Ativos por Template
                </CardTitle>
                <CardDescription>Gerencie o estoque dos produtos baseados nos templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Funcionalidade de gerenciamento de produtos em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle>Análises e Relatórios</CardTitle>
                <CardDescription>Métricas de performance dos templates e produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Relatórios e análises em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
