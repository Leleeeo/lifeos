'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { RecurringForm } from '@/components/recurring/recurring-form'
import type { RecurringTransaction } from '@/types'

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
}

const frequencyBadgeVariant: Record<string, string> = {
  daily: 'bg-blue-500/10 text-blue-500',
  weekly: 'bg-violet-500/10 text-violet-500',
  monthly: 'bg-amber-500/10 text-amber-500',
  yearly: 'bg-emerald-500/10 text-emerald-500',
}

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchRecurring()
  }, [])

  const fetchRecurring = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('next_payment', { ascending: true })

    if (data) {
      setRecurring(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta recorrência?')) return

    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchRecurring()
    }
  }

  const handleToggleActive = async (item: RecurringTransaction) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: !item.is_active })
      .eq('id', item.id)

    if (!error) {
      fetchRecurring()
    }
  }

  const handleEdit = (item: RecurringTransaction) => {
    setEditingRecurring(item)
    setFormOpen(true)
  }

  const filteredRecurring = recurring.filter((r) =>
    r.description.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = recurring.filter((r) => r.is_active).length
  const totalMonthly = recurring
    .filter((r) => r.is_active && r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0)

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
          <h1 className="text-3xl font-bold">Contas Recorrentes</h1>
          <p className="text-muted-foreground">
            Gerencie suas assinaturas e despesas fixas
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Recorrência
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recorrências</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurring.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCount} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Mensal Estimado</CardTitle>
            <RefreshCw className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalMonthly)}</div>
            <p className="text-xs text-muted-foreground">
              Apenas recorrências mensais ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
            <RefreshCw className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recurring.filter((r) => r.is_active).length > 0
                ? formatDate(
                    recurring
                      .filter((r) => r.is_active)
                      .sort((a, b) => new Date(a.next_payment).getTime() - new Date(b.next_payment).getTime())[0]
                      .next_payment
                  )
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Recorrência mais próxima
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recorrências..."
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
          ) : filteredRecurring.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhuma recorrência encontrada</p>
              <Button
                variant="link"
                onClick={() => setFormOpen(true)}
                className="mt-2"
              >
                Adicionar primeira recorrência
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Próximo Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecurring.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.type === 'income'
                            ? 'bg-emerald-500/10'
                            : 'bg-red-500/10'
                        }`}>
                          <RefreshCw className={`h-4 w-4 ${
                            item.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                          }`} />
                        </div>
                        <div>
                          <p>{item.description}</p>
                          {item.category && (
                            <p className="text-xs text-muted-foreground">
                              {item.category.icon} {item.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${frequencyBadgeVariant[item.frequency]}`}>
                        {frequencyLabels[item.frequency]}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(item.next_payment)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={() => handleToggleActive(item)}
                        />
                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                          {item.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      item.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RecurringForm
        open={formOpen}
        onOpenChange={setFormOpen}
        recurring={editingRecurring}
        onSuccess={() => {
          fetchRecurring()
          setEditingRecurring(null)
        }}
      />
    </div>
  )
}
