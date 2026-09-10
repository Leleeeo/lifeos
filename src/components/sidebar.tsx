'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ArrowUpDown,
  PiggyBank,
  Target,
  Repeat,
  TrendingUp,
  FileText,
  Upload,
  Settings,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: ArrowUpDown },
  { name: 'Orçamento', href: '/budget', icon: PiggyBank },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Recorrentes', href: '/recurring', icon: Repeat },
  { name: 'Investimentos', href: '/investments', icon: TrendingUp },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Importar', href: '/import', icon: Upload },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="text-xl font-bold">LifeOS</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-white' : 'text-muted-foreground'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t p-4">
          <ThemeToggle />
          <a href="/auth/logout" className="w-full">
            <Button variant="ghost" className="w-full justify-start ml-2">
              Sair
            </Button>
          </a>
        </div>
      </div>
    </aside>
  )
}
