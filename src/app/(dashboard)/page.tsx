'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, Target, Search, Bell, MoreHorizontal, Calendar, DollarSign } from 'lucide-react'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return `${diff} dias atrás`
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [recurring, setRecurring] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [transRes, goalsRes, recRes, invRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('recurring_transactions').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('investments').select('*').eq('user_id', user.id),
    ])

    if (transRes.data) setTransactions(transRes.data)
    if (goalsRes.data) setGoals(goalsRes.data)
    if (recRes.data) setRecurring(recRes.data)
    if (invRes.data) setInvestments(invRes.data)
  }

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = income - expenses
  const totalInvested = investments.reduce((sum, i) => sum + i.current_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[#64748b] text-sm mt-1">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
            <input type="text" placeholder="Buscar..." className="h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[#06d6a0]/50 focus:ring-1 focus:ring-[#06d6a0]/20 w-64" />
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative">
            <Bell className="h-5 w-5 text-[#64748b]" />
          </button>
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
            <div className="w-full h-full bg-gradient-to-br from-[#06d6a0] to-[#00b4d8] flex items-center justify-center text-[#0a0e27] font-bold">U</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4 glass-card p-5 glow-cyan">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#64748b] text-sm">Saldo Total</span>
              <div className="w-9 h-9 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-[#06d6a0]" />
              </div>
            </div>
            <p className="text-3xl font-bold gradient-text">{formatCurrency(balance)}</p>
          </div>

          <div className="col-span-6 lg:col-span-4 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#64748b] text-sm">Receitas</span>
              <div className="w-9 h-9 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-[#06d6a0]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#06d6a0]">{formatCurrency(income)}</p>
          </div>

          <div className="col-span-6 lg:col-span-4 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#64748b] text-sm">Despesas</span>
              <div className="w-9 h-9 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-[#ef4444]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#ef4444]">{formatCurrency(expenses)}</p>
          </div>

          <div className="col-span-12 glass-card p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Evolução</h3>
            </div>
            <div className="h-[200px] flex items-end gap-2 px-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-lg transition-all duration-500 hover:opacity-80" style={{ height: `${h}%`, background: i === 11 ? 'linear-gradient(180deg, #06d6a0, #00b4d8)' : 'rgba(6, 214, 160, 0.2)' }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 px-2 text-xs text-[#64748b]">
              <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
              <span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Investimentos</h3>
              <MoreHorizontal className="h-5 w-5 text-[#64748b]" />
            </div>
            <p className="text-2xl font-bold text-[#00b4d8]">{formatCurrency(totalInvested)}</p>
            <p className="text-xs text-[#64748b] mt-1">Total investido</p>
          </div>

          <div className="glass-card p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Últimas Transações</h3>
            </div>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-sm text-[#64748b] text-center py-4">Nenhuma transação ainda</p>
              ) : (
                transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-[#06d6a0]/10' : 'bg-[#ef4444]/10'}`}>
                        {t.type === 'income' ? <ArrowUpRight className="h-4 w-4 text-[#06d6a0]" /> : <ArrowDownRight className="h-4 w-4 text-[#ef4444]" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.description}</p>
                        <p className="text-xs text-[#64748b]">{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-[#06d6a0]' : 'text-[#ef4444]'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Metas</h3>
          </div>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-sm text-[#64748b] text-center py-4">Nenhuma meta criada</p>
            ) : (
              goals.slice(0, 3).map((g) => {
                const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0
                return (
                  <div key={g.id} className="p-4 rounded-xl bg-white/3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-[#06d6a0]" />
                        <span className="text-sm font-medium">{g.name}</span>
                      </div>
                      <span className="text-xs text-[#64748b]">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#06d6a0] to-[#00b4d8]" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-[#64748b] mt-2">{formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Contas Recorrentes</h3>
          </div>
          <div className="space-y-3">
            {recurring.length === 0 ? (
              <p className="text-sm text-[#64748b] text-center py-4">Nenhuma conta recorrente</p>
            ) : (
              recurring.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-[#7c3aed]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.description}</p>
                      <p className="text-xs text-[#64748b]">{r.frequency === 'monthly' ? 'Mensal' : r.frequency === 'weekly' ? 'Semanal' : r.frequency === 'yearly' ? 'Anual' : 'Diário'}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#ef4444]">-{formatCurrency(r.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
