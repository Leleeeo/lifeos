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
  LogOut,
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
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-[72px] md:flex-col md:fixed md:inset-y-0 items-center py-6 glass-card rounded-2xl m-3 gap-6 z-50">
      <Link href="/" className="mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06d6a0, #00b4d8)' }}>
          <span className="text-[#0a0e27] font-bold text-lg">L</span>
        </div>
      </Link>

      <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-[#06d6a0] text-[#0a0e27] shadow-lg shadow-[#06d6a0]/20'
                  : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-white/5'
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-3">
        <ThemeToggle />
        <a href="/auth/logout" className="w-11 h-11 flex items-center justify-center rounded-xl text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all">
          <LogOut className="h-5 w-5" />
        </a>
      </div>
    </aside>
  )
}
