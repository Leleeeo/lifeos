'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, TrendingUp, Wallet } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      alert('Conta criada! Verifique seu email se precisar, depois volte pra login.')
      setIsSignUp(false)
      setLoading(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0e27]">
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(6, 214, 160, 0.08), transparent 70%)' }} />
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(6, 214, 160, 0.1), transparent 70%)' }} />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0, 180, 216, 0.08), transparent 70%)' }} />

        <div className="relative z-10 max-w-lg px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06d6a0, #00b4d8)' }}>
              <span className="text-[#0a0e27] font-bold text-2xl">L</span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">LifeOS</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            <span className="gradient-text">Gerencie</span> suas<br />
            finanças com<br />
            <span className="gradient-text">inteligência</span>
          </h1>
          <p className="text-lg text-[#64748b] max-w-md">
            Controle gastos, defina metas e acompanhe seus investimentos em um só lugar.
          </p>

          <div className="flex gap-4 mt-12">
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-[#06d6a0]" />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Receitas</p>
                <p className="text-sm font-bold text-white">R$ 0,00</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#00b4d8]" />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Investimentos</p>
                <p className="text-sm font-bold text-white">R$ 0,00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06d6a0, #00b4d8)' }}>
              <span className="text-[#0a0e27] font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">LifeOS</span>
          </div>

          <div className="glass-card p-8 glow-cyan">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-sm text-[#64748b] mb-8">
              {isSignUp ? 'Preencha seus dados para começar' : 'Entre na sua conta para continuar'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748b] focus:outline-none focus:border-[#06d6a0]/50 focus:ring-1 focus:ring-[#06d6a0]/20 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Senha</label>
                <input
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748b] focus:outline-none focus:border-[#06d6a0]/50 focus:ring-1 focus:ring-[#06d6a0]/20 transition-all"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-[#ef4444] text-center bg-[#ef4444]/10 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold text-[#0a0e27] transition-all duration-300 hover:shadow-lg hover:shadow-[#06d6a0]/20 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #06d6a0, #00b4d8)' }}
              >
                {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
              </button>

              <p className="text-center text-sm text-[#64748b] pt-2">
                {isSignUp ? 'Ja tem conta?' : 'Nao tem conta?'}{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                  className="text-[#06d6a0] hover:underline font-medium"
                >
                  {isSignUp ? 'Fazer login' : 'Criar conta'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
