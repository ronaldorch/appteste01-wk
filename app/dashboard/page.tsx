"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, DollarSign, Users, TrendingUp, Leaf, Shield, Plus, Eye } from "lucide-react"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  recentOrders: Array<{
    id: number
    user_email: string
    total_amount: number
    status: string
    created_at: string
  }>
  topProducts: Array<{
    id: number
    name: string
    total_sold: number
    revenue: number
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentOrders: [],
    topProducts: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header de Aviso */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4" />🎮 DASHBOARD FICTÍCIO - DADOS DE DEMONSTRAÇÃO - MARKETPLACE DE JOGOS
          <Shield className="h-4 w-4" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                GreenLeaf Market
              </span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                🎮 Fictício
              </Badge>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-green-700 hover:text-green-900 font-medium">
                Home
              </Link>
              <Link href="/produtos" className="text-green-700 hover:text-green-900 font-medium">
                Produtos
              </Link>
              <Link href="/login" className="text-green-700 hover:text-green-900 font-medium">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Dashboard GreenLeaf</h1>
          <p className="text-gray-600 text-lg">Painel de controle do marketplace de cannabis fictício</p>
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-4">
            <p className="text-blue-800 font-medium">
              📊 DADOS FICTÍCIOS: Todas as estatísticas são simuladas para demonstração do sistema.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? "..." : stats.totalProducts}</div>
              <p className="text-xs text-gray-500">Produtos cadastrados no sistema</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pedidos Realizados</CardTitle>
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{loading ? "..." : stats.totalOrders}</div>
              <p className="text-xs text-gray-500">Pedidos processados</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                R$ {loading ? "..." : stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Receita total fictícia</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Usuários Cadastrados</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? "..." : stats.totalUsers}</div>
              <p className="text-xs text-gray-500">Usuários registrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Gerenciar Produtos
              </CardTitle>
              <CardDescription>Adicione, edite ou remova produtos do catálogo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href="/dashboard/products/new">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </Link>
                <Link href="/dashboard/products">
                  <Button
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
                Pedidos
              </CardTitle>
              <CardDescription>Gerencie pedidos e acompanhe vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/orders">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Pedidos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Relatórios
              </CardTitle>
              <CardDescription>Análises e relatórios de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent">
                <TrendingUp className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>Últimos pedidos realizados no marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Pedido #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.user_email}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">R$ {order.total_amount.toFixed(2)}</p>
                        <Badge variant={order.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Ranking dos produtos com melhor performance</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : stats.topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum produto vendido ainda</p>
              ) : (
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.total_sold} vendidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">R$ {product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
