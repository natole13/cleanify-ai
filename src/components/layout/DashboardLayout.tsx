import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  History,
  Key,
  Settings,
  CreditCard,
  Zap,
  Bell,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/batch', icon: Layers, label: 'New Batch' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/api-keys', icon: Key, label: 'API Keys' },
]

const BOTTOM_ITEMS = [
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/billing', icon: CreditCard, label: 'Billing' },
  { href: '/help', icon: HelpCircle, label: 'Help & Docs' },
]

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  badge?: string
  onClick?: () => void
}) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-[var(--accent)] text-[var(--primary)]'
          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          active ? 'text-[var(--primary)]' : 'group-hover:text-[var(--foreground)]'
        )}
      />
      <span className="flex-1">{label}</span>
      {badge && (
        <Badge variant="processing" className="text-[10px] px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </Link>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  credits?: number
  maxCredits?: number
  userName?: string
  userInitials?: string
}

export function DashboardLayout({
  children,
  credits = 7420,
  maxCredits = 10000,
  userName = 'Anatole L.',
  userInitials = 'AL',
}: DashboardLayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const creditsPercent = Math.round((credits / maxCredits) * 100)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--sidebar-border)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-[var(--foreground)] tracking-tight">
          Cleanify<span className="text-[var(--primary)]">.ai</span>
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          Main
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={location.pathname === item.href}
            onClick={() => setSidebarOpen(false)}
          />
        ))}

        <p className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          Account
        </p>
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={location.pathname === item.href}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      {/* Credits widget */}
      <div className="p-3 border-t border-[var(--sidebar-border)]">
        <div className="rounded-xl bg-[var(--accent)] p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--accent-foreground)]">Credits</span>
            <span className="text-xs font-bold text-[var(--primary)]">
              {credits.toLocaleString()} / {maxCredits.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
              style={{ width: `${creditsPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--accent-foreground)] opacity-80">
            {maxCredits - credits} images remaining this month
          </p>
        </div>

        {/* User */}
        <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[var(--muted)] transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-semibold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-[var(--foreground)] truncate">{userName}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">Pro Plan</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-transform duration-200 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--muted)]"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-4 border-b border-[var(--border)] bg-white px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--muted)]"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <button className="relative p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <Bell className="h-4.5 w-4.5 text-[var(--muted-foreground)]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
          </button>

          <Link
            to="/batch"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            New Batch
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[oklch(0.975_0_0)]">
          {children}
        </main>
      </div>
    </div>
  )
}
