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
    <aside className="hidden md:flex md:w-[260px] md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border/50">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold tracking-tight">LifeOS</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto px-3">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 border-t border-border/50 p-4">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/auth/logout" className="flex-1">
              <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
                Sair da conta
              </button>
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
