'use client'

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
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

// Demo data (will be replaced with real data from Supabase)
const demoData = {
  netWorth: 845000,
  netWorthChange: 4.2,
  totalAssets: 1200000,
  totalLiabilities: 355000,
  activeLoansGiven: 3,
  activeLoansGivenAmount: 300000,
  activeLoansTaken: 2,
  activeLoansTakenAmount: 355000,
  alerts: [
    { id: 1, type: 'warning', message: 'Ravi loan overdue by 10 days', amount: 100000 },
    { id: 2, type: 'info', message: 'Gold price up by ₹200/g today', amount: null },
  ]
}

// Format currency
function formatCurrency(amount) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return `₹${amount}`
}

// Net Worth Card Component
function NetWorthCard() {
  const isPositive = demoData.netWorthChange >= 0

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
              <motion.h2
                className="text-4xl md:text-5xl font-bold gradient-text"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                {formatCurrency(demoData.netWorth)}
              </motion.h2>
              <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{demoData.netWorthChange}% this month
                </span>
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
function SummaryCard({ title, amount, icon: Icon, color, subtext, trend }) {
  const colorClasses = {
    success: 'from-success/20 to-success/5 text-success',
    warning: 'from-warning/20 to-warning/5 text-warning',
    gold: 'from-gold/20 to-gold/5 text-gold',
    primary: 'from-primary/20 to-primary/5 text-primary',
    danger: 'from-destructive/20 to-destructive/5 text-destructive',
  }

  const iconBgClasses = {
    success: 'bg-success/20',
    warning: 'bg-warning/20',
    gold: 'bg-gold/20',
    primary: 'bg-primary/20',
    danger: 'bg-destructive/20',
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className={`relative overflow-hidden floating-card bg-gradient-to-br ${colorClasses[color]} border-0`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(amount)}</p>
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
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              {trend >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-success" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={`text-xs ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Alerts Card Component
function AlertsCard() {
  if (demoData.alerts.length === 0) return null

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Alerts & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {demoData.alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${alert.type === 'warning' ? 'bg-warning animate-pulse' : 'bg-primary'
                }`} />
              <div className="flex-1">
                <p className="text-sm">{alert.message}</p>
                {alert.amount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Amount: {formatCurrency(alert.amount)}
                  </p>
                )}
              </div>
              <Badge variant={alert.type === 'warning' ? 'destructive' : 'secondary'} className="shrink-0">
                {alert.type === 'warning' ? 'Action Needed' : 'Info'}
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
    { label: 'Add Asset', icon: Wallet, href: '/add?type=asset', color: 'success' },
    { label: 'Record Loan', icon: HandCoins, href: '/add?type=loan-given', color: 'gold' },
    { label: 'Track EMI', icon: CreditCard, href: '/add?type=loan-taken', color: 'primary' },
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
                <motion.a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-accent/50 hover:bg-accent transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${action.color}/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${action.color}`} />
                  </div>
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </motion.a>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Net Worth Hero */}
      <NetWorthCard />

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Assets"
          amount={demoData.totalAssets}
          icon={Wallet}
          color="success"
          trend={5.2}
        />
        <SummaryCard
          title="Liabilities"
          amount={demoData.totalLiabilities}
          icon={CreditCard}
          color="danger"
          subtext={`${demoData.activeLoansTaken} active loans`}
        />
        <SummaryCard
          title="Loans Given"
          amount={demoData.activeLoansGivenAmount}
          icon={HandCoins}
          color="gold"
          subtext={`${demoData.activeLoansGiven} active`}
        />
        <SummaryCard
          title="Expected Interest"
          amount={60000}
          icon={Coins}
          color="primary"
          subtext="This year"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Alerts */}
      <AlertsCard />
    </motion.div>
  )
}
