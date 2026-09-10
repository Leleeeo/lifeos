'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, TrendingUp, TrendingDown, Wallet, Pencil, Trash2 } from 'lucide-react'
import { InvestmentForm } from '@/components/investments/investment-form'
import type { Investment } from '@/types'

const typeLabels: Record<string, string> = {
  fixed_income: 'Renda Fixa',
  stocks: 'Ações',
  funds: 'Fundos (FIIs)',
  crypto: 'Criptomoedas',
  other: 'Outros',
}

const typeBadgeVariant: Record<string, string> = {
  fixed_income: 'bg-blue-500/10 text-blue-500',
  stocks: 'bg-violet-500/10 text-violet-500',
  funds: 'bg-amber-500/10 text-amber-500',
  crypto: 'bg-emerald-500/10 text-emerald-500',
  other: 'bg-gray-500/10 text-gray-500',
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setInvestments(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este investimento?')) return

    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchInvestments()
    }
  }

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment)
    setFormOpen(true)
  }

  const filteredInvestments = investments.filter((inv) =>
    inv.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.institution?.toLowerCase().includes(search.toLowerCase())
  )

  const totalInvested = investments.reduce((sum, inv) => sum + inv.initial_amount, 0)
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current_amount, 0)
  const totalProfit = totalCurrent - totalInvested
  const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">
            Acompanhe sua carteira de investimentos
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Investimento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              {investments.length} investimentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-500">{formatCurrency(totalCurrent)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total da carteira
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalProfit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}% no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(
                investments.reduce((acc, inv) => {
                  acc[inv.type] = (acc[inv.type] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <span key={type} className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${typeBadgeVariant[type]}`}>
                  {typeLabels[type]} ({count})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar investimentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhum investimento encontrado</p>
              <Button
                variant="link"
                onClick={() => setFormOpen(true)}
                className="mt-2"
              >
                Adicionar primeiro investimento
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Data Compra</TableHead>
                  <TableHead className="text-right">Valor Inicial</TableHead>
                  <TableHead className="text-right">Valor Atual</TableHead>
                  <TableHead className="text-right">Rentabilidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestments.map((investment) => {
                  const profit = investment.current_amount - investment.initial_amount
                  const profitPercent = investment.initial_amount > 0
                    ? (profit / investment.initial_amount) * 100
                    : 0

                  return (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeBadgeVariant[investment.type]}`}>
                            {investment.type === 'fixed_income' && <Wallet className="h-4 w-4" />}
                            {investment.type === 'stocks' && <TrendingUp className="h-4 w-4" />}
                            {investment.type === 'funds' && <TrendingUp className="h-4 w-4" />}
                            {investment.type === 'crypto' && <TrendingUp className="h-4 w-4" />}
                            {investment.type === 'other' && <Wallet className="h-4 w-4" />}
                          </div>
                          {investment.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${typeBadgeVariant[investment.type]}`}>
                          {typeLabels[investment.type]}
                        </span>
                      </TableCell>
                      <TableCell>{investment.institution || '-'}</TableCell>
                      <TableCell>{formatDate(investment.purchase_date)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(investment.initial_amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(investment.current_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-medium ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                        </div>
                        <div className={`text-xs ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(investment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(investment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InvestmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        investment={editingInvestment}
        onSuccess={() => {
          fetchInvestments()
          setEditingInvestment(null)
        }}
      />
    </div>
  )
}
