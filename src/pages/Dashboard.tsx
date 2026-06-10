import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ImageIcon,
  Zap,
  Clock,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Download,
  Plus,
  Key,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const STATS = [
  {
    label: 'Images Processed',
    value: '34,821',
    change: '+12.4%',
    positive: true,
    icon: ImageIcon,
    color: 'text-[var(--primary)]',
    bg: 'bg-[var(--accent)]',
  },
  {
    label: 'Credits Used (June)',
    value: '2,580',
    change: '74% remaining',
    positive: true,
    icon: Zap,
    color: 'text-[oklch(0.62_0.18_150)]',
    bg: 'bg-[oklch(0.94_0.06_150)]',
  },
  {
    label: 'Avg Processing Time',
    value: '1.3s',
    change: '-0.2s vs last month',
    positive: true,
    icon: Clock,
    color: 'text-[oklch(0.55_0.18_70)]',
    bg: 'bg-[oklch(0.96_0.05_70)]',
  },
  {
    label: 'Accuracy Rate',
    value: '99.4%',
    change: 'Industry benchmark',
    positive: true,
    icon: TrendingUp,
    color: 'text-[oklch(0.50_0.20_300)]',
    bg: 'bg-[oklch(0.95_0.05_300)]',
  },
]

type JobStatus = 'completed' | 'processing' | 'failed'

const RECENT_JOBS: {
  id: string
  name: string
  images: number
  status: JobStatus
  operations: string[]
  time: string
  duration: string
  progress?: number
}[] = [
  {
    id: 'JOB-1042',
    name: 'Nike Summer Collection',
    images: 1240,
    status: 'completed',
    operations: ['Watermark', 'Background', 'Upscale 2x'],
    time: '2 min ago',
    duration: '4m 12s',
  },
  {
    id: 'JOB-1041',
    name: 'Zara Catalog Q3',
    images: 3800,
    status: 'processing',
    operations: ['Background', 'Upscale 4x'],
    time: 'Running...',
    duration: '',
    progress: 67,
  },
  {
    id: 'JOB-1040',
    name: 'H&M Product Shots',
    images: 520,
    status: 'completed',
    operations: ['Watermark'],
    time: '1h ago',
    duration: '1m 55s',
  },
  {
    id: 'JOB-1039',
    name: 'Amazon SKU Batch',
    images: 200,
    status: 'failed',
    operations: ['Background'],
    time: '3h ago',
    duration: '—',
  },
  {
    id: 'JOB-1038',
    name: 'Shopify Migration Batch',
    images: 4200,
    status: 'completed',
    operations: ['Watermark', 'Background'],
    time: '5h ago',
    duration: '12m 30s',
  },
]

const STATUS_CONFIG: Record<JobStatus, {
  label: string
  badgeVariant: 'success' | 'processing' | 'destructive'
  icon: React.ComponentType<{ className?: string }>
}> = {
  completed: {
    label: 'Completed',
    badgeVariant: 'success',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Processing',
    badgeVariant: 'processing',
    icon: Loader2,
  },
  failed: {
    label: 'Failed',
    badgeVariant: 'destructive',
    icon: AlertCircle,
  },
}

export default function Dashboard() {
  const [activeJob] = useState(RECENT_JOBS.find((j) => j.status === 'processing'))

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Good morning, Anatole 👋
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              Here's what's happening with your image pipeline today.
            </p>
          </div>
          <Link to="/batch">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              New Batch
            </Button>
          </Link>
        </div>

        {/* Active job banner */}
        {activeJob && (
          <div className="rounded-xl border border-[oklch(0.85_0.08_264)] bg-[var(--accent)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {activeJob.name}
                  </p>
                  <Badge variant="processing">
                    {activeJob.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={activeJob.progress} className="h-1.5 flex-1 max-w-xs" />
                  <span className="text-xs font-medium text-[var(--primary)]">
                    {activeJob.progress}%
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {activeJob.images.toLocaleString()} images
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Details
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                      <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{stat.label}</p>
                  <p className={`text-xs mt-1.5 font-medium ${stat.positive ? 'text-[oklch(0.50_0.18_150)]' : 'text-[var(--destructive)]'}`}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent jobs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Batches</CardTitle>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary)]">
                  View all
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      Batch
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      Operations
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      Images
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide hidden sm:table-cell">
                      Duration
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {RECENT_JOBS.map((job) => {
                    const statusCfg = STATUS_CONFIG[job.status]
                    const StatusIcon = statusCfg.icon
                    return (
                      <tr key={job.id} className="hover:bg-[var(--muted)] transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-[var(--foreground)]">{job.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{job.id} · {job.time}</p>
                          </div>
                          {job.progress !== undefined && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <Progress value={job.progress} className="h-1 w-24" />
                              <span className="text-xs text-[var(--primary)] font-medium">{job.progress}%</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {job.operations.map((op) => (
                              <Badge key={op} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {op}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {job.images.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusCfg.badgeVariant} className="gap-1">
                            <StatusIcon className={`h-3 w-3 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                            {statusCfg.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-sm text-[var(--muted-foreground)]">{job.duration}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {job.status === 'completed' && (
                            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Download className="h-3.5 w-3.5 text-[var(--primary)]" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCard
            icon={<Zap className="h-5 w-5 text-[var(--primary)]" />}
            title="Quick Process"
            description="Drop images and apply your saved preset in seconds."
            href="/batch"
            cta="Start Now"
          />
          <QuickActionCard
            icon={<Key className="h-5 w-5 text-[oklch(0.55_0.18_70)]" />}
            title="API Integration"
            description="Connect your store directly via REST API or webhooks."
            href="/api-keys"
            cta="View API Keys"
          />
          <QuickActionCard
            icon={<TrendingUp className="h-5 w-5 text-[oklch(0.50_0.20_300)]" />}
            title="Upgrade Plan"
            description="Get 50,000 images/month with the Business plan."
            href="/billing"
            cta="View Plans"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <Card className="hover:shadow-md transition-all hover:border-[var(--primary)]/30 group">
      <CardContent className="p-5">
        <div className="mb-3">{icon}</div>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">{title}</h3>
        <p className="text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">{description}</p>
        <Link to={href}>
          <Button variant="outline" size="sm" className="w-full group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] transition-colors">
            {cta}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
