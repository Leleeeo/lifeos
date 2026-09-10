'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import type { Budget, Category } from '@/types'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface BudgetWithSpent extends Budget {
  category?: Category
  spent: number
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpent | null>(null)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const [formCategoryId, setFormCategoryId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    if (editingBudget) {
      setFormCategoryId(editingBudget.category_id)
      setFormAmount(editingBudget.amount.toString())
    } else {
      setFormCategoryId('')
      setFormAmount('')
    }
  }, [editingBudget])

  const fetchBudgets = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: budgetData } = await supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .order('created_at', { ascending: false })

    if (!budgetData) {
      setBudgets([])
      setLoading(false)
      return
    }

    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const endMonth = selectedMonth === 12 ? 1 : selectedMonth + 1
    const endYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

    const { data: transactions } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lt('date', endDate)

    const spentByCategory = new Map<string, number>()
    if (transactions) {
      for (const t of transactions) {
        if (t.category_id) {
          spentByCategory.set(
            t.category_id,
            (spentByCategory.get(t.category_id) || 0) + t.amount
          )
        }
      }
    }

    const enriched: BudgetWithSpent[] = budgetData.map((b) => ({
      ...b,
      spent: spentByCategory.get(b.category_id) || 0,
    }))

    setBudgets(enriched)
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .order('name')

    if (data) {
      setCategories(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const budgetData = {
      user_id: user.id,
      category_id: formCategoryId,
      amount: parseFloat(formAmount),
      month: selectedMonth,
      year: selectedYear,
    }

    if (editingBudget) {
      const { error } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', editingBudget.id)

      if (error) {
        console.error('Error updating budget:', error)
      }
    } else {
      const { error } = await supabase
        .from('budgets')
        .insert([budgetData])

      if (error) {
        console.error('Error creating budget:', error)
      }
    }

    setFormLoading(false)
    setDialogOpen(false)
    setEditingBudget(null)
    setFormCategoryId('')
    setFormAmount('')
    fetchBudgets()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchBudgets()
    }
  }

  const handleEdit = (budget: BudgetWithSpent) => {
    setEditingBudget(budget)
    setDialogOpen(true)
  }

  const handleOpenDialog = () => {
    setEditingBudget(null)
    setFormCategoryId('')
    setFormAmount('')
    setDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orçamento</h1>
          <p className="text-muted-foreground">
            Controle seus gastos por categoria
          </p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhum orçamento para este período</p>
              <Button variant="link" onClick={handleOpenDialog} className="mt-2">
                Criar primeiro orçamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const percentage = Math.min(
                  Math.round((budget.spent / budget.amount) * 100),
                  100
                )
                const isNearLimit = percentage >= 80
                const isOverBudget = percentage >= 100

                return (
                  <Card key={budget.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${budget.category?.color}20` }}
                          >
                            <span className="text-sm">
                              {budget.category?.icon || '📦'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{budget.category?.name || 'Sem categoria'}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverBudget ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Estourado
                            </Badge>
                          ) : isNearLimit ? (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Próximo do limite
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Dentro do limite</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(budget)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(budget.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                      />
                      <p className="text-right text-sm text-muted-foreground mt-1">
                        {percentage}%
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
            <DialogDescription>
              {editingBudget
                ? 'Atualize o limite de gasto desta categoria'
                : 'Defina um limite de gasto para uma categoria'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formCategoryId}
                onValueChange={(v) => setFormCategoryId(v ?? '')}
                disabled={!!editingBudget}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-amount">Limite (R$)</Label>
              <Input
                id="budget-amount"
                type="number"
                step="0.01"
                min="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Salvando...' : editingBudget ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
