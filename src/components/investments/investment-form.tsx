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
import type { Investment } from '@/types'

interface InvestmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment?: Investment | null
  onSuccess: () => void
}

type InvestmentType = 'fixed_income' | 'stocks' | 'funds' | 'crypto' | 'other'

const investmentTypeLabels: Record<InvestmentType, string> = {
  fixed_income: 'Renda Fixa',
  stocks: 'Ações',
  funds: 'Fundos (FIIs)',
  crypto: 'Criptomoedas',
  other: 'Outros',
}

export function InvestmentForm({ open, onOpenChange, investment, onSuccess }: InvestmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<InvestmentType>('fixed_income')
  const [institution, setInstitution] = useState('')
  const [initialAmount, setInitialAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (investment) {
      setName(investment.name)
      setType(investment.type)
      setInstitution(investment.institution || '')
      setInitialAmount(investment.initial_amount.toString())
      setCurrentAmount(investment.current_amount.toString())
      setPurchaseDate(investment.purchase_date)
      setNotes(investment.notes || '')
    } else {
      resetForm()
    }
  }, [investment])

  const resetForm = () => {
    setName('')
    setType('fixed_income')
    setInstitution('')
    setInitialAmount('')
    setCurrentAmount('')
    setPurchaseDate(new Date().toISOString().split('T')[0])
    setNotes('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const investmentData = {
      user_id: user.id,
      name,
      type,
      institution: institution || null,
      initial_amount: parseFloat(initialAmount),
      current_amount: parseFloat(currentAmount || initialAmount),
      purchase_date: purchaseDate,
      notes: notes || null,
    }

    if (investment) {
      const { error } = await supabase
        .from('investments')
        .update(investmentData)
        .eq('id', investment.id)

      if (error) {
        console.error('Error updating investment:', error)
      }
    } else {
      const { error } = await supabase
        .from('investments')
        .insert([investmentData])

      if (error) {
        console.error('Error creating investment:', error)
      }
    }

    setLoading(false)
    onOpenChange(false)
    resetForm()
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {investment ? 'Editar Investimento' : 'Novo Investimento'}
          </DialogTitle>
          <DialogDescription>
            {investment ? 'Atualize os dados do investimento' : 'Adicione um novo investimento'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: CDB Banco XYZ, PETR4..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => v && setType(v as InvestmentType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(investmentTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Instituição</Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Ex: Nubank, XP..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial_amount">Valor Inicial</Label>
              <Input
                id="initial_amount"
                type="number"
                step="0.01"
                min="0"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_amount">Valor Atual</Label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_date">Data da Compra</Label>
            <Input
              id="purchase_date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione detalhes..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : investment ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
