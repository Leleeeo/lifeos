'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingDown, TrendingUp, Calendar } from 'lucide-react'
import type { Transaction, Category } from '@/types'

type Period = 'week' | 'month' | 'year' | 'custom'

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [transactionsRes, categoriesRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id),
    ])

    if (transactionsRes.data) setTransactions(transactionsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    setLoading(false)
  }

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'custom':
        if (customStart && customEnd) {
          startDate = new Date(customStart)
          const endDate = new Date(customEnd)
          return transactions.filter((t) => {
            const d = new Date(t.date)
            return d >= startDate && d <= endDate
          })
        }
        return transactions
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return transactions.filter((t) => new Date(t.date) >= startDate)
  }, [transactions, period, customStart, customEnd])

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return { income, expenses, balance: income - expenses }
  }, [filteredTransactions])

  const categoryStats = useMemo(() => {
    const map = new Map<string, { category: Category; total: number; count: number }>()

    filteredTransactions
      .filter((t) => t.type === 'expense' && t.category)
      .forEach((t) => {
        const cat = t.category!
        const existing = map.get(cat.id)
        if (existing) {
          existing.total += t.amount
          existing.count += 1
        } else {
          map.set(cat.id, { category: cat, total: t.amount, count: 1 })
        }
      })

    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [filteredTransactions])

  const maxCategoryAmount = useMemo(() => {
    if (categoryStats.length === 0) return 1
    return Math.max(...categoryStats.map((c) => c.total))
  }, [categoryStats])

  const topTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
  }, [filteredTransactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const periodLabel = {
    week: 'Últimos 7 dias',
    month: 'Este mês',
    year: 'Este ano',
    custom: 'Personalizado',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">
          Análise detalhada das suas finanças
        </p>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>

          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-40"
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-40"
              />
            </div>
          )}
        </div>

        <TabsContent value={period}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-500">
                      {formatCurrency(stats.income)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {filteredTransactions.filter((t) => t.type === 'income').length} transações
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {formatCurrency(stats.expenses)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {filteredTransactions.filter((t) => t.type === 'expense').length} transações
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatCurrency(stats.balance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {periodLabel[period]}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryStats.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhuma despesa encontrada no período
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {categoryStats.map((item) => (
                          <div key={item.category.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{item.category.icon}</span>
                                <span className="text-sm font-medium">{item.category.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {item.count}x
                                </span>
                                <span className="text-sm font-medium">
                                  {formatCurrency(item.total)}
                                </span>
                              </div>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(item.total / maxCategoryAmount) * 100}%`,
                                  backgroundColor: item.category.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Maiores Transações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topTransactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhuma transação encontrada no período
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {topTransactions.map((t) => (
                          <div key={t.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                t.type === 'income'
                                  ? 'bg-emerald-500/10'
                                  : 'bg-red-500/10'
                              }`}>
                                {t.type === 'income' ? (
                                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{t.description}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${
                              t.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                              {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categorias de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryStats.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum dado disponível
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Transações</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">% do Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryStats.map((item, index) => (
                          <TableRow key={item.category.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: item.category.color }}
                                />
                                <span>{item.category.icon} {item.category.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.total)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">
                                {stats.expenses > 0
                                  ? ((item.total / stats.expenses) * 100).toFixed(1)
                                  : '0'}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
