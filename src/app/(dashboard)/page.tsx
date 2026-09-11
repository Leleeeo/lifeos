'use client'

import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, Target, Search, Bell, MoreHorizontal, Calendar, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[#64748b] text-sm mt-1">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[#06d6a0]/50 focus:ring-1 focus:ring-[#06d6a0]/20 w-64"
            />
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative">
            <Bell className="h-5 w-5 text-[#64748b]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full text-[10px] font-bold flex items-center justify-center text-white">3</span>
          </button>
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
            <div className="w-full h-full bg-gradient-to-br from-[#06d6a0] to-[#00b4d8] flex items-center justify-center text-[#0a0e27] font-bold">
              U
            </div>
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
            <p className="text-3xl font-bold gradient-text">R$ 0,00</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-[#06d6a0] bg-[#06d6a0]/10 px-2 py-0.5 rounded-full">+0%</span>
              <span className="text-xs text-[#64748b]">este mês</span>
            </div>
          </div>

          <div className="col-span-6 lg:col-span-4 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#64748b] text-sm">Receitas</span>
              <div className="w-9 h-9 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-[#06d6a0]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#06d6a0]">R$ 0,00</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-[#06d6a0] bg-[#06d6a0]/10 px-2 py-0.5 rounded-full">+0%</span>
              <span className="text-xs text-[#64748b]">este mês</span>
            </div>
          </div>

          <div className="col-span-6 lg:col-span-4 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#64748b] text-sm">Despesas</span>
              <div className="w-9 h-9 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-[#ef4444]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#ef4444]">R$ 0,00</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded-full">+0%</span>
              <span className="text-xs text-[#64748b]">este mês</span>
            </div>
          </div>

          <div className="col-span-12 glass-card p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Evolução</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs rounded-lg bg-[#06d6a0]/10 text-[#06d6a0] border border-[#06d6a0]/20">Mensal</button>
                <button className="px-3 py-1 text-xs rounded-lg text-[#64748b] hover:bg-white/5 transition-colors">Semanal</button>
                <button className="px-3 py-1 text-xs rounded-lg text-[#64748b] hover:bg-white/5 transition-colors">Diário</button>
              </div>
            </div>
            <div className="h-[200px] flex items-end gap-2 px-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-lg transition-all duration-500 hover:opacity-80"
                    style={{
                      height: `${h}%`,
                      background: i === 11 ? 'linear-gradient(180deg, #06d6a0, #00b4d8)' : 'rgba(6, 214, 160, 0.2)',
                    }}
                  />
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
            <p className="text-2xl font-bold text-[#00b4d8]">R$ 0,00</p>
            <p className="text-xs text-[#64748b] mt-1">Total investido</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#06d6a0]/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-[#06d6a0]" />
                  </div>
                  <span className="text-sm">Renda Fixa</span>
                </div>
                <span className="text-sm font-medium">R$ 0,00</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00b4d8]/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-[#00b4d8]" />
                  </div>
                  <span className="text-sm">Ações</span>
                </div>
                <span className="text-sm font-medium">R$ 0,00</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Últimas Transações</h3>
              <MoreHorizontal className="h-5 w-5 text-[#64748b]" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-[#06d6a0]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Salário</p>
                    <p className="text-xs text-[#64748b]">Hoje</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#06d6a0]">+R$ 5.000</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                    <ArrowDownRight className="h-4 w-4 text-[#ef4444]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aluguel</p>
                    <p className="text-xs text-[#64748b]">Ontem</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#ef4444]">-R$ 1.500</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-[#f59e0b]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Supermercado</p>
                    <p className="text-xs text-[#64748b]">2 dias atrás</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#ef4444]">-R$ 450</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Metas</h3>
            <button className="text-xs text-[#06d6a0] hover:underline">Ver todas</button>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#06d6a0]" />
                  <span className="text-sm font-medium">Reserva de Emergência</span>
                </div>
                <span className="text-xs text-[#64748b]">0%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#06d6a0] to-[#00b4d8]" style={{ width: '0%' }} />
              </div>
              <p className="text-xs text-[#64748b] mt-2">R$ 0 / R$ 10.000</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Contas Recorrentes</h3>
            <button className="text-xs text-[#06d6a0] hover:underline">Ver todas</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Netflix</p>
                  <p className="text-xs text-[#64748b]">Todo dia 15</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#ef4444]">-R$ 39,90</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[#f59e0b]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Academia</p>
                  <p className="text-xs text-[#64748b]">Todo dia 5</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#ef4444]">-R$ 89,90</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
