import { useState } from 'react'
import { Check, Zap, Building2, Rocket, ChevronRight } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Rocket,
    price: 29,
    images: '1,000',
    description: 'Perfect for small stores getting started.',
    features: [
      'Up to 1,000 images/month',
      'Watermark removal',
      'Background removal',
      '2x AI upscaling',
      'JPG, PNG, WEBP export',
      'Email support',
    ],
    cta: 'Upgrade to Starter',
    current: false,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    price: 99,
    images: '10,000',
    description: 'The go-to plan for growing e-commerce teams.',
    features: [
      'Up to 10,000 images/month',
      'All Starter features',
      '4x AI upscaling',
      'AVIF & TIFF export',
      'Custom background colors',
      'API access',
      'Priority support',
      'Batch presets (saved configs)',
    ],
    cta: 'Current Plan',
    current: true,
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    price: null,
    images: 'Unlimited',
    description: 'For large catalogs and development teams.',
    features: [
      'Unlimited images',
      'All Pro features',
      'Custom AI model fine-tuning',
      'Dedicated infrastructure',
      'SLA guarantee (99.99% uptime)',
      'SSO / SAML',
      'Team seats & roles',
      'Dedicated account manager',
      'Custom integrations & webhooks',
    ],
    cta: 'Contact Sales',
    current: false,
    highlight: false,
  },
]

const INVOICES = [
  { id: 'INV-2024-06', date: 'Jun 1, 2026', amount: '$99.00', status: 'paid' },
  { id: 'INV-2024-05', date: 'May 1, 2026', amount: '$99.00', status: 'paid' },
  { id: 'INV-2024-04', date: 'Apr 1, 2026', amount: '$99.00', status: 'paid' },
  { id: 'INV-2024-03', date: 'Mar 1, 2026', amount: '$99.00', status: 'paid' },
]

export default function Billing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Billing & Plans</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Manage your subscription and usage.
          </p>
        </div>

        {/* Current usage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)] mb-0.5">
                  Pro Plan · June 2026
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Renews July 1, 2026 · $99.00
                </p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="space-y-3">
              <UsageBar label="Images processed" used={2580} total={10000} unit="images" />
              <UsageBar label="API calls" used={1240} total={50000} unit="calls" />
              <UsageBar label="Storage" used={4.2} total={20} unit="GB" />
            </div>
          </CardContent>
        </Card>

        {/* Billing toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Plans</h2>
          <div className="flex items-center rounded-xl border border-[var(--border)] p-1 bg-white">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                billing === 'monthly'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                billing === 'annual'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              Annual
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                billing === 'annual' ? 'bg-white/20 text-white' : 'bg-[oklch(0.92_0.08_150)] text-[oklch(0.40_0.18_150)]'
              )}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const price = plan.price
              ? billing === 'annual'
                ? Math.round(plan.price * 0.8)
                : plan.price
              : null

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-2xl border p-6 flex flex-col transition-all',
                  plan.highlight
                    ? 'border-[var(--primary)] shadow-blue bg-white'
                    : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/30 hover:shadow-md'
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="shadow-sm">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl mb-4',
                  plan.highlight ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
                )}>
                  <Icon className={cn('h-5 w-5', plan.highlight ? 'text-white' : 'text-[var(--muted-foreground)]')} />
                </div>

                <h3 className="text-base font-bold text-[var(--foreground)]">{plan.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 mb-4">{plan.description}</p>

                <div className="mb-5">
                  {price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[var(--foreground)]">${price}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">/mo</span>
                      {billing === 'annual' && (
                        <span className="ml-1 text-xs text-[oklch(0.50_0.18_150)] font-medium">
                          billed annually
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-[var(--foreground)]">Custom</span>
                  )}
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {plan.images} images/month
                  </p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={cn(
                        'h-3.5 w-3.5 mt-0.5 shrink-0',
                        plan.highlight ? 'text-[var(--primary)]' : 'text-[oklch(0.62_0.18_150)]'
                      )} />
                      <span className="text-xs text-[var(--muted-foreground)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.current ? 'outline' : plan.highlight ? 'default' : 'primary-outline'}
                  className="w-full"
                  disabled={plan.current}
                >
                  {plan.cta}
                  {!plan.current && <ChevronRight className="h-3.5 w-3.5" />}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Invoice history */}
        <Card>
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Invoice History</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--muted)] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{inv.id}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{inv.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{inv.amount}</span>
                  <Badge variant="success">Paid</Badge>
                  <Button variant="ghost" size="sm" className="text-xs text-[var(--primary)]">
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function UsageBar({
  label,
  used,
  total,
  unit,
}: {
  label: string
  used: number
  total: number
  unit: string
}) {
  const pct = Math.round((used / total) * 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
        <span className="text-xs font-semibold text-[var(--foreground)]">
          {typeof used === 'number' && used < 10 ? used.toFixed(1) : used.toLocaleString()} / {typeof total === 'number' && total < 100 ? total : total.toLocaleString()} {unit}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  )
}
