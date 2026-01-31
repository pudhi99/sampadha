'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  HandCoins,
  CreditCard,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Sparkles,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getDashboardSummary, getLoans } from '@/lib/db'
import { AnimatedCurrency } from '@/components/ui/animated'
import { WelcomeCard } from '@/components/ui/empty-state'
import { useAuth } from '@/context/AuthContext'
import { demoAssets, demoLoans, demoFinanceSchemes, getDemoTotals } from '@/lib/demoData'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
}

// Format currency
function formatCurrency(amount) {
  const num = Number(amount) || 0
  // Show full numbers up to 99,999
  if (num < 100000) {
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
  // Show in lakhs for 1,00,000 and above
  else if (num >= 100000 && num < 10000000) {
    return `₹${(num / 100000).toFixed(2)}L`
  }
  // Show in crores for 1,00,00,000 and above
  else {
    return `₹${(num / 10000000).toFixed(2)}Cr`
  }
}

// Net Worth Card Component
function NetWorthCard({ netWorth, loading }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden glass-card floating-card border-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-chart-2/20" />

        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-shimmer" />

        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Net Worth</p>
              {loading ? (
                <div className="h-12 w-40 bg-muted/50 rounded animate-pulse" />
              ) : (
                <motion.h2
                  className="text-4xl md:text-5xl font-bold gradient-text"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <AnimatedCurrency value={netWorth} />
                </motion.h2>
              )}
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Track your wealth growth</span>
              </div>
            </div>

            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 10, scale: 1.1 }}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                y: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
              }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Summary Card Component
function SummaryCard({ title, amount, icon: Icon, color, subtext, href, loading }) {
  const colorClasses = {
    success: 'from-emerald-500/20 to-emerald-600/5',
    warning: 'from-amber-500/20 to-amber-600/5',
    gold: 'from-amber-500/20 to-amber-600/5',
    primary: 'from-violet-500/20 to-violet-600/5',
    danger: 'from-red-500/20 to-red-600/5',
  }

  const iconBgClasses = {
    success: 'bg-emerald-500/20 text-emerald-500',
    warning: 'bg-amber-500/20 text-amber-500',
    gold: 'bg-amber-500/20 text-amber-500',
    primary: 'bg-violet-500/20 text-violet-500',
    danger: 'bg-red-500/20 text-red-500',
  }

  const CardWrapper = href ? Link : 'div'

  return (
    <motion.div variants={itemVariants}>
      <CardWrapper href={href}>
        <Card className={`relative overflow-hidden floating-card bg-gradient-to-br ${colorClasses[color]} border-0 cursor-pointer`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(amount)}</p>
                )}
                {subtext && (
                  <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
                )}
              </div>
              <motion.div
                className={`w-10 h-10 rounded-xl ${iconBgClasses[color]} flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </CardWrapper>
    </motion.div>
  )
}

// Alerts Card Component
function AlertsCard({ loans }) {
  // Find delayed or overdue loans
  const today = new Date()
  const alerts = loans.filter(loan => {
    if (loan.status === 'DELAYED' || loan.status === 'DEFAULTED') return true
    if (loan.end_date && new Date(loan.end_date) < today && loan.status === 'ACTIVE') return true
    return false
  }).slice(0, 3)

  if (alerts.length === 0) return null

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Alerts & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((loan, index) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
            >
              <div className="w-2 h-2 rounded-full mt-2 bg-amber-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{loan.party_name}</span>
                  {' '}loan {loan.status === 'DELAYED' ? 'is delayed' : 'needs attention'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount: {formatCurrency(loan.principal)}
                </p>
              </div>
              <Badge variant="destructive" className="shrink-0">
                {loan.status}
              </Badge>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    { label: 'Add Asset', icon: Wallet, href: '/add?type=asset', color: 'bg-emerald-500/20 text-emerald-500' },
    { label: 'Record Loan', icon: HandCoins, href: '/add?type=loan-given', color: 'bg-amber-500/20 text-amber-500' },
    { label: 'View Reports', icon: TrendingUp, href: '/reports', color: 'bg-violet-500/20 text-violet-500' },
  ]

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div key={action.label}>
                  <Link href={action.href}>
                    <motion.div
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-accent/50 hover:bg-accent transition-all"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { isDemo } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        if (isDemo) {
          // Use demo data
          const totals = getDemoTotals()
          const loansGiven = demoLoans.filter(l => l.type === 'GIVEN')
          const loansTaken = demoLoans.filter(l => l.type === 'TAKEN')

          setSummary({
            netWorth: totals.netWorth,
            totalAssets: totals.totalAssets,
            totalLiabilities: totals.totalLiabilities,
            loansGiven: {
              total: loansGiven.reduce((s, l) => s + Number(l.principal), 0),
              activeCount: loansGiven.filter(l => l.status === 'ACTIVE').length
            },
            loansTaken: {
              total: loansTaken.reduce((s, l) => s + Number(l.principal), 0),
              activeCount: loansTaken.filter(l => l.status === 'ACTIVE').length
            },
            financeSchemes: {
              total: demoFinanceSchemes.reduce((s, f) => s + Number(f.principal), 0),
              activeCount: demoFinanceSchemes.filter(s => s.status === 'ACTIVE').length
            }
          })
          setLoans(demoLoans)
        } else {
          const [summaryData, loansData] = await Promise.all([
            getDashboardSummary(),
            getLoans()
          ])
          setSummary(summaryData)
          setLoans(loansData || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isDemo])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Welcome Card for new users */}
      {!loading && summary?.netWorth === 0 && <WelcomeCard />}

      {/* Net Worth Hero */}
      <NetWorthCard netWorth={summary?.netWorth || 0} loading={loading} />

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Assets"
          amount={summary?.totalAssets || 0}
          icon={Wallet}
          color="success"
          href="/assets"
          loading={loading}
        />
        <SummaryCard
          title="Liabilities"
          amount={summary?.totalLiabilities || 0}
          icon={CreditCard}
          color="danger"
          subtext={`${summary?.loansTaken?.activeCount || 0} active loans`}
          href="/loans/taken"
          loading={loading}
        />
        <SummaryCard
          title="Loans Given"
          amount={summary?.loansGiven?.total || 0}
          icon={HandCoins}
          color="gold"
          subtext={`${summary?.loansGiven?.activeCount || 0} active`}
          href="/loans/given"
          loading={loading}
        />
        <SummaryCard
          title="Finance"
          amount={summary?.financeSchemes?.total || 0}
          icon={Zap}
          color="primary"
          subtext={`${summary?.financeSchemes?.activeCount || 0} schemes`}
          href="/finance"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Alerts */}
      <AlertsCard loans={loans} />
    </motion.div>
  )
}
