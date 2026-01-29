'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Wallet,
    HandCoins,
    CreditCard,
    TrendingUp,
    FileText,
    PlusCircle,
    Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * EmptyState - Beautiful empty state component with illustration and CTA
 */
export function EmptyState({
    icon: Icon = FileText,
    title = 'No data yet',
    description = 'Get started by adding your first entry',
    actionLabel = 'Add New',
    actionHref = '/add',
    iconColor = 'text-primary',
    iconBg = 'bg-primary/10'
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
        >
            {/* Floating icon with glow */}
            <motion.div
                className="relative mb-6"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className={`absolute inset-0 ${iconBg} rounded-full blur-xl scale-150 opacity-50`} />
                <div className={`relative w-20 h-20 rounded-2xl ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-10 h-10 ${iconColor}`} />
                </div>
            </motion.div>

            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>

            <Link href={actionHref}>
                <Button className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    {actionLabel}
                </Button>
            </Link>
        </motion.div>
    )
}

// Preset empty states for different sections
export function EmptyAssets() {
    return (
        <EmptyState
            icon={Wallet}
            title="No assets tracked"
            description="Start tracking your cash, gold, and investments to see your wealth grow"
            actionLabel="Add Asset"
            actionHref="/add?type=asset"
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
        />
    )
}

export function EmptyLoansGiven() {
    return (
        <EmptyState
            icon={HandCoins}
            title="No loans given"
            description="Track money you've lent to friends, family, or business contacts"
            actionLabel="Add Loan Given"
            actionHref="/add?type=loan-given"
            iconColor="text-amber-500"
            iconBg="bg-amber-500/10"
        />
    )
}

export function EmptyLoansTaken() {
    return (
        <EmptyState
            icon={CreditCard}
            title="No loans taken"
            description="Track your EMIs, debts, and borrowed money in one place"
            actionLabel="Add Loan Taken"
            actionHref="/add?type=loan-taken"
            iconColor="text-red-500"
            iconBg="bg-red-500/10"
        />
    )
}

export function EmptyFinance() {
    return (
        <EmptyState
            icon={TrendingUp}
            title="No finance schemes"
            description="Track your private finance investments and expected returns"
            actionLabel="Add Finance Scheme"
            actionHref="/add?type=finance"
            iconColor="text-violet-500"
            iconBg="bg-violet-500/10"
        />
    )
}

/**
 * WelcomeCard - Shown on dashboard when user is just getting started
 */
export function WelcomeCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-chart-2/10 to-chart-3/20 p-6 md:p-8"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-chart-2/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Icon */}
                <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                >
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Welcome to Sampadha! 🎉</h2>
                    <p className="text-muted-foreground mb-4">
                        Your personal finance tracker. Start by adding your assets, loans, and investments to get a complete picture of your wealth.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/add?type=asset">
                            <Button size="sm" className="gap-2">
                                <Wallet className="w-4 h-4" />
                                Add Asset
                            </Button>
                        </Link>
                        <Link href="/add?type=loan-given">
                            <Button size="sm" variant="outline" className="gap-2">
                                <HandCoins className="w-4 h-4" />
                                Add Loan
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
