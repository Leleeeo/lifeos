'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Target, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import type { Goal, GoalContribution } from '@/types'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [contributions, setContributions] = useState<GoalContribution[]>([])

  const [formName, setFormName] = useState('')
  const [formTargetAmount, setFormTargetAmount] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formColor, setFormColor] = useState('#8b5cf6')
  const [formLoading, setFormLoading] = useState(false)

  const [contribAmount, setContribAmount] = useState('')
  const [contribDate, setContribDate] = useState(new Date().toISOString().split('T')[0])
  const [contribNotes, setContribNotes] = useState('')
  const [contribLoading, setContribLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchGoals()
  }, [])

  useEffect(() => {
    if (editingGoal) {
      setFormName(editingGoal.name)
      setFormTargetAmount(editingGoal.target_amount.toString())
      setFormDeadline(editingGoal.deadline || '')
      setFormColor(editingGoal.color || '#8b5cf6')
    } else {
      resetGoalForm()
    }
  }, [editingGoal])

  const fetchGoals = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setGoals(data)
    }
    setLoading(false)
  }

  const fetchContributions = async (goalId: string) => {
    const { data } = await supabase
      .from('goal_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: false })

    if (data) {
      setContributions(data)
    }
  }

  const resetGoalForm = () => {
    setFormName('')
    setFormTargetAmount('')
    setFormDeadline('')
    setFormColor('#8b5cf6')
  }

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const goalData = {
      user_id: user.id,
      name: formName,
      target_amount: parseFloat(formTargetAmount),
      current_amount: editingGoal?.current_amount || 0,
      deadline: formDeadline || null,
      color: formColor,
      is_completed: editingGoal?.is_completed || false,
    }

    if (editingGoal) {
      const { error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', editingGoal.id)

      if (error) {
        console.error('Error updating goal:', error)
      }
    } else {
      const { error } = await supabase
        .from('goals')
        .insert([goalData])

      if (error) {
        console.error('Error creating goal:', error)
      }
    }

    setFormLoading(false)
    setGoalDialogOpen(false)
    setEditingGoal(null)
    resetGoalForm()
    fetchGoals()
  }

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal) return
    setContribLoading(true)

    const amount = parseFloat(contribAmount)

    const { error: contribError } = await supabase
      .from('goal_contributions')
      .insert([{
        goal_id: selectedGoal.id,
        amount,
        date: contribDate,
        notes: contribNotes || null,
      }])

    if (contribError) {
      console.error('Error creating contribution:', contribError)
      setContribLoading(false)
      return
    }

    const newCurrentAmount = selectedGoal.current_amount + amount
    const isCompleted = newCurrentAmount >= selectedGoal.target_amount

    const { error: goalError } = await supabase
      .from('goals')
      .update({
        current_amount: newCurrentAmount,
        is_completed: isCompleted,
      })
      .eq('id', selectedGoal.id)

    if (goalError) {
      console.error('Error updating goal:', goalError)
    }

    setContribLoading(false)
    setContributionDialogOpen(false)
    setContribAmount('')
    setContribDate(new Date().toISOString().split('T')[0])
    setContribNotes('')
    setSelectedGoal(null)
    fetchGoals()
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta e todas as suas contribuições?')) return

    await supabase
      .from('goal_contributions')
      .delete()
      .eq('goal_id', id)

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchGoals()
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setGoalDialogOpen(true)
  }

  const handleOpenContributionDialog = async (goal: Goal) => {
    setSelectedGoal(goal)
    await fetchContributions(goal.id)
    setContributionDialogOpen(true)
  }

  const handleOpenGoalDialog = () => {
    setEditingGoal(null)
    resetGoalForm()
    setGoalDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metas</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe seus objetivos financeiros
          </p>
        </div>
        <Button onClick={handleOpenGoalDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma meta encontrada</p>
            <Button variant="link" onClick={handleOpenGoalDialog} className="mt-2">
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const percentage = Math.min(
              Math.round((goal.current_amount / goal.target_amount) * 100),
              100
            )
            const remaining = goal.target_amount - goal.current_amount
            const daysLeft = goal.deadline ? getDaysRemaining(goal.deadline) : null

            return (
              <Card key={goal.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <Target className="h-5 w-5" style={{ color: goal.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        {goal.deadline && (
                          <p className="text-xs text-muted-foreground">
                            {daysLeft !== null && daysLeft > 0
                              ? `${daysLeft} dias restantes`
                              : daysLeft === 0
                                ? 'Vence hoje'
                                : 'Prazo encerrado'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {goal.is_completed ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Concluída
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Acumulado</p>
                      <p className="font-medium">{formatCurrency(goal.current_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Meta</p>
                      <p className="font-medium">{formatCurrency(goal.target_amount)}</p>
                    </div>
                  </div>

                  {!goal.is_completed && remaining > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Faltam {formatCurrency(remaining)}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {!goal.is_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenContributionDialog(goal)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Contribuir
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditGoal(goal)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
            <DialogDescription>
              {editingGoal
                ? 'Atualize os dados da sua meta'
                : 'Defina um novo objetivo financeiro'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Nome</Label>
              <Input
                id="goal-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Viagem, Reserva de emergência..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-target">Valor alvo (R$)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formTargetAmount}
                  onChange={(e) => setFormTargetAmount(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Prazo (opcional)</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-color">Cor</Label>
              <div className="flex items-center gap-2">
                <input
                  id="goal-color"
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="h-10 w-14 rounded border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{formColor}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setGoalDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Salvando...' : editingGoal ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={contributionDialogOpen} onOpenChange={setContributionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Contribuição</DialogTitle>
            <DialogDescription>
              {selectedGoal && `Meta: ${selectedGoal.name}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContributionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contrib-amount">Valor (R$)</Label>
              <Input
                id="contrib-amount"
                type="number"
                step="0.01"
                min="0"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrib-date">Data</Label>
              <Input
                id="contrib-date"
                type="date"
                value={contribDate}
                onChange={(e) => setContribDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrib-notes">Observações (opcional)</Label>
              <Input
                id="contrib-notes"
                value={contribNotes}
                onChange={(e) => setContribNotes(e.target.value)}
                placeholder="Ex: Depósito mensal..."
              />
            </div>

            {contributions.length > 0 && (
              <div className="space-y-2">
                <Label>Histórico de contribuições</Label>
                <div className="max-h-40 overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contributions.map((contrib) => (
                        <TableRow key={contrib.id}>
                          <TableCell className="text-sm">
                            {formatDate(contrib.date)}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-emerald-500">
                            +{formatCurrency(contrib.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setContributionDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={contribLoading}>
                {contribLoading ? 'Salvando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
