'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { RecurringTransaction, Category } from '@/types'

interface RecurringFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recurring?: RecurringTransaction | null
  onSuccess: () => void
}

export function RecurringForm({ open, onOpenChange, recurring, onSuccess }: RecurringFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [nextPayment, setNextPayment] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [type])

  useEffect(() => {
    if (recurring) {
      setDescription(recurring.description)
      setAmount(recurring.amount.toString())
      setType(recurring.type)
      setFrequency(recurring.frequency)
      setStartDate(recurring.start_date)
      setNextPayment(recurring.next_payment)
      setCategoryId(recurring.category_id || '')
    } else {
      resetForm()
    }
  }, [recurring])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('name')

    if (data) {
      setCategories(data)
    }
  }

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setType('expense')
    setFrequency('monthly')
    setStartDate(new Date().toISOString().split('T')[0])
    setNextPayment(new Date().toISOString().split('T')[0])
    setCategoryId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const recurringData = {
      user_id: user.id,
      description,
      amount: parseFloat(amount),
      type,
      frequency,
      start_date: startDate,
      next_payment: nextPayment,
      category_id: categoryId || null,
    }

    if (recurring) {
      const { error } = await supabase
        .from('recurring_transactions')
        .update(recurringData)
        .eq('id', recurring.id)

      if (error) {
        console.error('Error updating recurring:', error)
      }
    } else {
      const { error } = await supabase
        .from('recurring_transactions')
        .insert([recurringData])

      if (error) {
        console.error('Error creating recurring:', error)
      }
    }

    setLoading(false)
    onOpenChange(false)
    resetForm()
    onSuccess()
  }

  const frequencyLabels: Record<string, string> = {
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    yearly: 'Anual',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {recurring ? 'Editar Recorrência' : 'Nova Recorrência'}
          </DialogTitle>
          <DialogDescription>
            {recurring ? 'Atualize os dados da recorrência' : 'Adicione uma nova transação recorrente'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              onClick={() => setType('income')}
              className={type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              Receita
            </Button>
            <Button
              type="button"
              variant={type === 'expense' ? 'default' : 'outline'}
              onClick={() => setType('expense')}
              className={type === 'expense' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              Despesa
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Netflix..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select value={frequency} onValueChange={(v) => v && setFrequency(v as typeof frequency)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Início</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_payment">Próximo Pagamento</Label>
              <Input
                id="next_payment"
                type="date"
                value={nextPayment}
                onChange={(e) => setNextPayment(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
              <SelectTrigger className="w-full">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : recurring ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
