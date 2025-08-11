"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Package, Leaf } from "lucide-react"

interface GeneticTemplate {
  id: number
  name: string
  type: string
  category: string
  thc_percentage: number
  cbd_percentage: number
  description: string
  effects: string[]
  flavors: string[]
  medical_uses: string[]
  growing_difficulty: string
  flowering_time: string
  yield_info: string
  genetics: string
  breeder: string
  image_url: string
  is_active: boolean
  product_count: number
  total_stock: number
  created_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<GeneticTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "flower",
    category: "hybrid",
    thc_percentage: "",
    cbd_percentage: "",
    description: "",
    effects: "",
    flavors: "",
    medical_uses: "",
    growing_difficulty: "medium",
    flowering_time: "",
    yield_info: "",
    genetics: "",
    breeder: "",
    image_url: "",
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/templates")
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("Erro ao buscar templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        thc_percentage: Number.parseFloat(formData.thc_percentage) || 0,
        cbd_percentage: Number.parseFloat(formData.cbd_percentage) || 0,
        effects: formData.effects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        flavors: formData.flavors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        medical_uses: formData.medical_uses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }

      const response = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          name: "",
          type: "flower",
          category: "hybrid",
          thc_percentage: "",
          cbd_percentage: "",
          description: "",
          effects: "",
          flavors: "",
          medical_uses: "",
          growing_difficulty: "medium",
          flowering_time: "",
          yield_info: "",
          genetics: "",
          breeder: "",
          image_url: "",
        })
        fetchTemplates()
      }
    } catch (error) {
      console.error("Erro ao criar template:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sativa":
        return "bg-green-100 text-green-800"
      case "indica":
        return "bg-purple-100 text-purple-800"
      case "hybrid":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flower":
        return <Leaf className="w-4 h-4" />
      case "extract":
        return <Package className="w-4 h-4" />
      default:
        return <Leaf className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Carregando templates...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Templates de Genéticas</h1>
            <p className="text-green-200">Gerencie os templates base para criar produtos</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 bg-white/10 backdrop-blur-sm border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white">Criar Novo Template</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">
                    Nome da Genética
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/20 border-green-500/30 text-white placeholder-green-200"
                    placeholder="Ex: OG Kush"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-white">
                    Tipo
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-white/20 border-green-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flower">Flower</SelectItem>
                      <SelectItem value="extract">Extrato</SelectItem>
                      <SelectItem value="edible">Comestível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category" className="text-white">
                    Categoria
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-white/20 border-green-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sativa">Sativa</SelectItem>
                      <SelectItem value="indica">Indica</SelectItem>
                      <SelectItem value="hybrid">Híbrida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="thc" className="text-white">
                    THC %
                  </Label>
                  <Input
                    id="thc"
                    type="number"
                    step="0.1"
                    value={formData.thc_percentage}
                    onChange={(e) => setFormData({ ...formData, thc_percentage: e.target.value })}
                    className="bg-white/20 border-green-500/30 text-white placeholder-green-200"
                    placeholder="Ex: 24.5"
                  />
                </div>

                <div>
                  <Label htmlFor="cbd" className="text-white">
                    CBD %
                  </Label>
                  <Input
                    id="cbd"
                    type="number"
                    step="0.1"
                    value={formData.cbd_percentage}
                    onChange={(e) => setFormData({ ...formData, cbd_percentage: e.target.value })}
                    className="bg-white/20 border-green-500/30 text-white placeholder-green-200"
                    placeholder="Ex: 0.3"
                  />
                </div>

                <div>
                  <Label htmlFor="breeder" className="text-white">
                    Breeder
                  </Label>
                  <Input
                    id="breeder"
                    value={formData.breeder}
                    onChange={(e) => setFormData({ ...formData, breeder: e.target.value })}
                    className="bg-white/20 border-green-500/30 text-white placeholder-green-200"
                    placeholder="Ex: DNA Genetics"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-white">
                    Descrição
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/20 border-green-500/30 text-white placeholder-green-200"
                    placeholder="Descrição da genética..."
                  />
                </div>

                <div>
                  <Label htmlFor="effects" className="text-white">
                    Efeitos (separados por vírgula)
                  </Label>
                  <Input
                    id="effects"
                    value={formData.effects}
                    onChange={(e) => setFormData({ ...formData, effects: e.target.value })}
                    className="bg-white/20 border-green-500/30 text-white placeholder-green-200"
                    placeholder="relaxante, eufórico, criativo"
                  />
                </div>

                <div>
                  <Label htmlFor="flavors" className="text-white">
                    Sabores (separados por vírgula)
                  </Label>
                  <Input
                    id="flavors"
                    value={formData.flavors}
                    onChange={(e) => setFormData({ ...formData, flavors: e.target.value })}
                    className="bg-white/20 border-green-500/30 text-white placeholder-green-200"
                    placeholder="terroso, pinho, limão"
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Criar Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-green-500/30 text-white hover:bg-green-500/20"
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
            <Card
              key={template.id}
              className="bg-white/10 backdrop-blur-sm border-green-500/20 hover:bg-white/15 transition-all"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(template.type)}
                    <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-green-200">THC: {template.thc_percentage}%</span>
                  <span className="text-green-200">CBD: {template.cbd_percentage}%</span>
                </div>

                <p className="text-green-100 text-sm line-clamp-2">{template.description}</p>

                {template.effects && template.effects.length > 0 && (
                  <div>
                    <p className="text-green-200 text-xs mb-1">Efeitos:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.effects.slice(0, 3).map((effect, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-green-600/20 text-green-200">
                          {effect}
                        </Badge>
                      ))}
                      {template.effects.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-200">
                          +{template.effects.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-green-500/20">
                  <div className="text-sm text-green-200">
                    <div>{template.product_count} produtos</div>
                    <div>{template.total_stock}g em estoque</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 text-green-200 hover:bg-green-500/20 bg-transparent"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-200 hover:bg-red-500/20 bg-transparent"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <Leaf className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum template encontrado</h3>
            <p className="text-green-200 mb-4">Crie seu primeiro template de genética para começar</p>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
