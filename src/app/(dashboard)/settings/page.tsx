'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  User,
  Palette,
  Download,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
} from 'lucide-react'
import type { User as UserType, Category } from '@/types'

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryIcon, setCategoryIcon] = useState('')
  const [categoryColor, setCategoryColor] = useState('#6d28d9')
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    setUser({
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || '',
      avatar_url: authUser.user_metadata?.avatar_url || '',
    })
    setFullName(authUser.user_metadata?.full_name || '')
    setEmail(authUser.email || '')

    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', authUser.id)
      .order('name')

    if (cats) {
      setCategories(cats)
    }
    setLoading(false)
  }

  const handleUpdateProfile = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    })

    if (!error) {
      setUser((prev) => prev ? { ...prev, full_name: fullName } : prev)
    }
    setSaving(false)
  }

  const handleExportData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const [transactionsRes, budgetsRes, goalsRes, investmentsRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', authUser.id),
      supabase.from('budgets').select('*').eq('user_id', authUser.id),
      supabase.from('goals').select('*').eq('user_id', authUser.id),
      supabase.from('investments').select('*').eq('user_id', authUser.id),
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name,
      },
      categories,
      transactions: transactionsRes.data || [],
      budgets: budgetsRes.data || [],
      goals: goalsRes.data || [],
      investments: investmentsRes.data || [],
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lifeos-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryName(category.name)
      setCategoryIcon(category.icon || '')
      setCategoryColor(category.color)
      setCategoryType(category.type)
    } else {
      setEditingCategory(null)
      setCategoryName('')
      setCategoryIcon('')
      setCategoryColor('#6d28d9')
      setCategoryType('expense')
    }
    setCategoryDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryName,
          icon: categoryIcon || null,
          color: categoryColor,
          type: categoryType,
        })
        .eq('id', editingCategory.id)

      if (!error) {
        setCategoryDialogOpen(false)
        fetchData()
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: authUser.id,
          name: categoryName,
          icon: categoryIcon || null,
          color: categoryColor,
          type: categoryType,
        })

      if (!error) {
        setCategoryDialogOpen(false)
        fetchData()
      }
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchData()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie seu perfil e preferências
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                <User className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Informações pessoais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {user?.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user?.full_name || ''} />
                ) : null}
                <AvatarFallback>
                  {user?.full_name ? getInitials(user.full_name) : user?.email?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.full_name || 'Sem nome'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="opacity-60"
              />
            </div>

            <Button onClick={handleUpdateProfile} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a interface</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Modo escuro</p>
                <p className="text-sm text-muted-foreground">
                  Alterne entre tema claro e escuro
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                  <span className="text-lg">🏷️</span>
                </div>
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>Gerencie suas categorias</CardDescription>
                </div>
              </div>
              <Button onClick={() => openCategoryDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma categoria encontrada
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon || '📁'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {category.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openCategoryDialog(category)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Dados</CardTitle>
                <CardDescription>Exporte suas informações</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Exporte todos os seus dados em formato JSON.
            </p>
            <Button variant="outline" onClick={handleExportData} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Conta</CardTitle>
                <CardDescription>Gerencie sua sessão</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Encerre sua sessão atual.
            </p>
            <Button
              variant="destructive"
              onClick={() => window.location.href = '/auth/logout'}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Atualize as informações da categoria'
                : 'Adicione uma nova categoria'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nome da categoria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryIcon">Ícone (emoji)</Label>
              <Input
                id="categoryIcon"
                value={categoryIcon}
                onChange={(e) => setCategoryIcon(e.target.value)}
                placeholder="Ex: 🍔, 🏠, 💰"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryColor">Cor</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="categoryColor"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <Input
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-28"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={categoryType === 'expense' ? 'default' : 'outline'}
                  onClick={() => setCategoryType('expense')}
                >
                  Despesa
                </Button>
                <Button
                  type="button"
                  variant={categoryType === 'income' ? 'default' : 'outline'}
                  onClick={() => setCategoryType('income')}
                >
                  Receita
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
