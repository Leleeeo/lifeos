'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowUpRight, Wallet, TrendingUp } from 'lucide-react'

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
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
              <span className="text-primary-foreground font-bold text-2xl">L</span>
            </div>
            <span className="text-3xl font-bold tracking-tight">LifeOS</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
            Gerencie suas<br />
            <span className="text-primary">finanças</span> com<br />
            inteligência
          </h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Controle gastos, defina metas e acompanhe seus investimentos em um só lugar.
          </p>
        </div>
        <div className="relative z-10 flex gap-8">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Receitas</p>
              <p className="text-lg font-bold">R$ 0,00</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Investimentos</p>
              <p className="text-lg font-bold">R$ 0,00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">LifeOS</span>
          </div>

          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">
                {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Preencha seus dados para começar' : 'Entre na sua conta para continuar'}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded-lg">{error}</p>
                )}

                <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium" disabled={loading}>
                  {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  {isSignUp ? 'Ja tem conta?' : 'Nao tem conta?'}{' '}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                    className="text-primary hover:underline font-medium"
                  >
                    {isSignUp ? 'Fazer login' : 'Criar conta'}
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
