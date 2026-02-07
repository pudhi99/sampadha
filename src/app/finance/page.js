'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp,
    Plus,
    Trash2,
    Edit,
    Calendar,
    Percent,
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    Zap,
    Building2,
    Users,
    Landmark,
    Coins,
    PiggyBank,
    ArrowUpRight,
    IndianRupee,
    RefreshCw,
    Filter
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFinanceSchemes, createFinanceScheme, updateFinanceScheme, deleteFinanceScheme, getFinancePayments, addFinancePayment, deleteFinancePayment, getAllFinancePayments } from '@/lib/db'
import { useAuth } from '@/context/AuthContext'
import { demoFinanceSchemes } from '@/lib/demoData'

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
}

// Investment Scheme Types Configuration
const SCHEME_TYPES = {
    PRIVATE_FINANCE: {
        label: 'Private Finance',
        icon: Zap,
        color: 'violet',
        gradient: 'from-violet-500/10 to-violet-600/5',
        description: 'High-yield private lending schemes'
    },
    CHIT_FUND: {
        label: 'Chit Fund',
        icon: Users,
        color: 'blue',
        gradient: 'from-blue-500/10 to-blue-600/5',
        description: 'Traditional rotating savings group'
    },
    POST_OFFICE_FD: {
        label: 'Post Office FD',
        icon: Building2,
        color: 'emerald',
        gradient: 'from-emerald-500/10 to-emerald-600/5',
        description: 'Fixed Deposit with guaranteed returns'
    },
    POST_OFFICE_RD: {
        label: 'Post Office RD',
        icon: PiggyBank,
        color: 'teal',
        gradient: 'from-teal-500/10 to-teal-600/5',
        description: 'Monthly recurring deposit scheme'
    },
    NSC: {
        label: 'NSC',
        icon: Landmark,
        color: 'orange',
        gradient: 'from-orange-500/10 to-orange-600/5',
        description: 'National Savings Certificate'
    },
    KVP: {
        label: 'KVP',
        icon: Coins,
        color: 'amber',
        gradient: 'from-amber-500/10 to-amber-600/5',
        description: 'Kisan Vikas Patra - doubles in 115 months'
    },
    PPF: {
        label: 'PPF',
        icon: TrendingUp,
        color: 'green',
        gradient: 'from-green-500/10 to-green-600/5',
        description: 'Public Provident Fund - 15 year scheme'
    },
    SCSS: {
        label: 'SCSS',
        icon: Building2,
        color: 'rose',
        gradient: 'from-rose-500/10 to-rose-600/5',
        description: 'Senior Citizen Savings Scheme'
    }
}

// Current Interest Rates (as of Q4 FY 2024-25)
const INTEREST_RATES = {
    POST_OFFICE_FD: { '1Y': 6.9, '2Y': 7.0, '3Y': 7.1, '5Y': 7.5 },
    POST_OFFICE_RD: 6.7,
    NSC: 7.7,
    KVP: 7.5,
    PPF: 7.1,
    SCSS: 8.2
}

// Risk level config
const riskConfig = {
    LOW: { label: 'Low Risk', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
    MEDIUM: { label: 'Medium Risk', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    HIGH: { label: 'High Risk', color: 'bg-red-500/20 text-red-500 border-red-500/30' }
}

// Status config
const statusConfig = {
    ACTIVE: { label: 'Active', icon: CheckCircle2, color: 'text-emerald-500' },
    DELAYED: { label: 'Delayed', icon: Clock, color: 'text-amber-500' },
    CLOSED: { label: 'Closed', icon: CheckCircle2, color: 'text-muted-foreground' },
    MATURED: { label: 'Matured', icon: CheckCircle2, color: 'text-blue-500' },
    DEFAULTED: { label: 'Defaulted', icon: XCircle, color: 'text-red-500' }
}

// Format currency
function formatCurrency(amount) {
    const num = Number(amount) || 0
    if (num < 100000) {
        return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    } else if (num >= 100000 && num < 10000000) {
        return `₹${(num / 100000).toFixed(2)}L`
    } else {
        return `₹${(num / 10000000).toFixed(2)}Cr`
    }
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

// Calculate expected returns based on scheme type
function calculateExpectedReturns(scheme) {
    const principal = Number(scheme.principal) || 0
    const rate = Number(scheme.interest_rate) / 100 || 0
    const startDate = new Date(scheme.start_date)
    const today = new Date()
    const years = Math.max(0, (today - startDate) / (1000 * 60 * 60 * 24 * 365))

    switch (scheme.scheme_type) {
        case 'CHIT_FUND': {
            // Chit fund: Calculate based on completed installments
            const monthlyAmount = Number(scheme.monthly_amount) || 0
            const totalMonths = Number(scheme.duration_months) || 20
            const completedMonths = Math.min(totalMonths, Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30)))
            const totalPaid = monthlyAmount * completedMonths
            const chitValue = Number(scheme.chit_value) || (monthlyAmount * totalMonths)
            const commission = (Number(scheme.commission_percent) || 4) / 100

            // If won, calculate based on when won
            if (scheme.won_at_month) {
                const wonAmount = chitValue * (1 - commission)
                return wonAmount - (monthlyAmount * scheme.won_at_month)
            }
            return totalPaid * 0.02 // Estimate 2% dividend till bidding
        }
        case 'POST_OFFICE_RD': {
            // RD: Quarterly compounding
            const monthly = Number(scheme.monthly_amount) || 0
            const months = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30))
            const deposited = monthly * months
            const maturityMonths = 60 // 5 years
            const r = rate / 4 // Quarterly rate
            const maturityValue = monthly * (((1 + r) ** (maturityMonths / 3) - 1) / r) * (1 + r)
            const currentValue = deposited * (1 + (rate * months / 12 / 2))
            return currentValue - deposited
        }
        case 'KVP': {
            // KVP: Doubles in 115 months
            const months = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30))
            const maturityMonths = 115
            const progress = Math.min(1, months / maturityMonths)
            return principal * progress // Compound interest approximation
        }
        case 'PPF': {
            // PPF: 15 year with annual compounding
            const yearlyDeposit = Number(scheme.yearly_deposit) || principal / 15
            const completedYears = Math.floor(years)
            let balance = 0
            for (let i = 0; i < completedYears; i++) {
                balance = (balance + yearlyDeposit) * (1 + rate)
            }
            const totalDeposited = yearlyDeposit * completedYears
            return balance - totalDeposited
        }
        default:
            // Simple interest for FD, NSC, Private Finance
            return principal * rate * years
    }
}

// Calculate expected returns based on actual payments
function calculateExpectedReturnsWithPayments(scheme, actualPaid) {
    const principal = Number(scheme.principal) || 0
    const rate = Number(scheme.interest_rate) / 100 || 0
    const startDate = new Date(scheme.start_date)
    const today = new Date()
    const years = Math.max(0, (today - startDate) / (1000 * 60 * 60 * 24 * 365))

    switch (scheme.scheme_type) {
        case 'CHIT_FUND': {
            const chitValue = Number(scheme.chit_value) || principal
            const commission = (Number(scheme.commission_percent) || 4) / 100

            // If won, calculate actual gain: (chit value - commission) - total payments made
            if (scheme.won_at_month) {
                const wonAmount = chitValue * (1 - commission)
                // Net gain = what we received - what we paid so far
                // But we still need to pay remaining installments
                return wonAmount - actualPaid
            }

            // Not won yet - show estimated dividend (typically 2-5% of paid amount)
            return actualPaid * 0.03
        }
        case 'POST_OFFICE_RD': {
            // RD: Interest earned on deposits so far
            if (actualPaid <= 0) return 0
            const monthsPaid = Math.ceil(actualPaid / (Number(scheme.monthly_amount) || 1))
            const avgHoldingPeriod = monthsPaid / 2 / 12 // Average holding in years
            return actualPaid * rate * avgHoldingPeriod
        }
        case 'PPF': {
            // PPF with annual compounding
            if (actualPaid <= 0) return principal * rate * years
            const completedYears = Math.floor(years)
            return actualPaid * rate * (completedYears / 2) // Simplified
        }
        default:
            // Simple interest for FD, NSC, Private Finance
            return principal * rate * years
    }
}

// Calculate maturity date
function getMaturityDate(scheme) {
    const start = new Date(scheme.start_date)
    const type = scheme.scheme_type

    switch (type) {
        case 'POST_OFFICE_FD':
            const fdYears = parseInt(scheme.tenure) || 1
            return new Date(start.setFullYear(start.getFullYear() + fdYears))
        case 'POST_OFFICE_RD':
            return new Date(start.setFullYear(start.getFullYear() + 5))
        case 'NSC':
            return new Date(start.setFullYear(start.getFullYear() + 5))
        case 'KVP':
            return new Date(start.setMonth(start.getMonth() + 115))
        case 'PPF':
            return new Date(start.setFullYear(start.getFullYear() + 15))
        case 'SCSS':
            return new Date(start.setFullYear(start.getFullYear() + 5))
        case 'CHIT_FUND':
            const months = Number(scheme.duration_months) || 20
            return new Date(start.setMonth(start.getMonth() + months))
        default:
            return scheme.end_date ? new Date(scheme.end_date) : null
    }
}

// Scheme Card Component
function SchemeCard({ scheme, onEdit, onDelete, onViewHistory, payments = [] }) {
    const schemeType = SCHEME_TYPES[scheme.scheme_type] || SCHEME_TYPES.PRIVATE_FINANCE
    const TypeIcon = schemeType.icon
    const risk = riskConfig[scheme.risk_level] || riskConfig.MEDIUM
    const status = statusConfig[scheme.status] || statusConfig.ACTIVE
    const StatusIcon = status.icon
    const maturityDate = getMaturityDate(scheme)

    // Calculate actual invested from payments for recurring schemes
    const schemePayments = payments.filter(p => p.scheme_id === scheme.id)
    const actualPaid = schemePayments.reduce((sum, p) => sum + Number(p.amount), 0)

    // Delegate chit funds to dedicated component
    if (scheme.scheme_type === 'CHIT_FUND') {
        return (
            <ChitFundCard
                scheme={scheme}
                payments={schemePayments}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewHistory={onViewHistory}
            />
        )
    }

    // For other schemes
    const isRecurring = ['POST_OFFICE_RD', 'PPF'].includes(scheme.scheme_type)
    const displayedInvested = isRecurring && actualPaid > 0 ? actualPaid : Number(scheme.principal)

    // Calculate expected returns based on actual payments
    const expectedReturns = calculateExpectedReturnsWithPayments(scheme, actualPaid)

    const getTypeSpecificInfo = () => {
        switch (scheme.scheme_type) {
            case 'CHIT_FUND':
                // Calculate variable installments
                const chitValue = Number(scheme.chit_value) || 0
                const durationMonths = Number(scheme.duration_months) || 20
                const baseInstallment = chitValue / durationMonths
                const firstBonus = Math.round(baseInstallment * 0.27)
                const firstMonthPayment = Math.round(baseInstallment - firstBonus)
                const lastMonthPayment = Math.round(baseInstallment)
                const currentMonth = scheme.current_month || Math.floor((new Date() - new Date(scheme.start_date)) / (1000 * 60 * 60 * 24 * 30))

                return (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Chit Value</span>
                            <span className="font-medium">{formatCurrency(chitValue)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Installment Range</span>
                            <span className="font-medium text-sm">
                                ₹{firstMonthPayment.toLocaleString('en-IN')} → ₹{lastMonthPayment.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                                {Math.min(currentMonth, durationMonths)}/{durationMonths} months
                            </span>
                        </div>
                        {scheme.won_at_month && (
                            <div className="flex items-center justify-between text-emerald-500">
                                <span>Won at</span>
                                <span className="font-medium">Month {scheme.won_at_month}</span>
                            </div>
                        )}
                    </>
                )
            case 'POST_OFFICE_RD':
                return (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Monthly</span>
                            <span className="font-medium">{formatCurrency(scheme.monthly_amount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Interest</span>
                            <span className="font-medium">{scheme.interest_rate}% p.a.</span>
                        </div>
                    </>
                )
            case 'PPF':
                return (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Yearly Deposit</span>
                            <span className="font-medium">{formatCurrency(scheme.yearly_deposit || scheme.principal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Interest</span>
                            <span className="font-medium">{scheme.interest_rate}% p.a.</span>
                        </div>
                    </>
                )
            case 'POST_OFFICE_FD':
                return (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tenure</span>
                            <span className="font-medium">{scheme.tenure} Year{scheme.tenure > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Interest</span>
                            <span className="font-medium">{scheme.interest_rate}% p.a.</span>
                        </div>
                    </>
                )
            default:
                return (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Percent className="w-4 h-4" />
                                Interest
                            </span>
                            <span className="font-medium">{scheme.interest_rate}% / year</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Payout
                            </span>
                            <span className="font-medium">{scheme.payment_cycle}</span>
                        </div>
                    </>
                )
        }
    }

    return (
        <motion.div
            variants={itemVariants}
            layout
            whileHover={{ y: -4 }}
            className="group"
        >
            <Card className={`relative overflow-hidden bg-gradient-to-br ${schemeType.gradient} border-0 floating-card`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity" />

                <CardContent className="p-5 relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className={`w-12 h-12 rounded-xl bg-${schemeType.color}-500/20 flex items-center justify-center`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <TypeIcon className={`w-6 h-6 text-${schemeType.color}-500`} />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1">{scheme.name}</h3>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-xs bg-background/50">
                                        {schemeType.label}
                                    </Badge>
                                    {scheme.scheme_type === 'PRIVATE_FINANCE' && (
                                        <Badge variant="outline" className={`${risk.color} text-xs`}>
                                            {risk.label}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {['CHIT_FUND', 'PRIVATE_FINANCE', 'POST_OFFICE_RD'].includes(scheme.scheme_type) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                    onClick={() => onViewHistory && onViewHistory(scheme)}
                                    title="Payment History"
                                >
                                    <Clock className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit(scheme)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => onDelete(scheme.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Amount Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                {isRecurring ? 'Paid So Far' : 'Invested'}
                            </p>
                            <p className="text-xl font-bold">{formatCurrency(displayedInvested)}</p>
                            {isRecurring && scheme.scheme_type === 'CHIT_FUND' && (
                                <p className="text-xs text-muted-foreground">of {formatCurrency(scheme.chit_value || scheme.principal)}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                {scheme.scheme_type === 'CHIT_FUND' && scheme.won_at_month ? 'Net Gain' : 'Est. Returns'}
                            </p>
                            <p className={`text-xl font-bold ${expectedReturns >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {expectedReturns >= 0 ? '+' : ''}{formatCurrency(expectedReturns)}
                            </p>
                        </div>
                    </div>

                    {/* Type-specific Details */}
                    <div className="space-y-2 text-sm">
                        {getTypeSpecificInfo()}

                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-medium flex items-center gap-1 ${status.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {status.label}
                            </span>
                        </div>

                        {maturityDate && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Matures</span>
                                <span className="font-medium">{formatDate(maturityDate)}</span>
                            </div>
                        )}
                    </div>

                    {scheme.notes && (
                        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border line-clamp-2">
                            {scheme.notes}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Dedicated Chit Fund Card Component with Payment Tracking
function ChitFundCard({ scheme, payments = [], onEdit, onDelete, onViewHistory }) {
    const chitValue = Number(scheme.chit_value) || Number(scheme.principal) || 0
    const durationMonths = Number(scheme.duration_months) || 20
    const commissionPercent = Number(scheme.commission_percent) || 4
    const startDate = new Date(scheme.start_date)

    // Calculate installment structure (decreasing bonus model)
    // Based on standard chit fund calculation where bonus decreases linearly
    const baseInstallment = chitValue / durationMonths
    const firstBonus = Math.round(baseInstallment * 0.27) // ~27% first month discount
    // Exact decrement to reach 0 bonus at last month
    const bonusDecrement = firstBonus / (durationMonths - 1)

    // Calculate total to pay (sum of all installments)
    let totalToPay = 0
    // Generate schedule
    const schedule = []
    for (let month = 1; month <= durationMonths; month++) {
        // Round bonus to nearest 50 for clean values (matches standard chit fund tables)
        let monthBonus
        if (month === durationMonths) {
            monthBonus = 0 // Last month: no bonus, full payment
        } else {
            // Round to nearest 50 for cleaner values that match standard tables
            monthBonus = Math.round((firstBonus - (bonusDecrement * (month - 1))) / 50) * 50
            monthBonus = Math.max(0, monthBonus)
        }
        const monthPayment = Math.round(baseInstallment - monthBonus)
        schedule.push({ month, payment: monthPayment, bonus: monthBonus })
        totalToPay += monthPayment
    }

    // Calculate from actual payments
    const actualPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const monthsPaid = payments.length

    // What user receives (at maturity)
    const commission = Math.round(chitValue * (commissionPercent / 100))
    const youReceive = chitValue - commission

    // Net gain/loss
    const netGain = youReceive - totalToPay

    // Remaining to pay
    const remainingToPay = Math.max(0, totalToPay - actualPaid)

    // Progress percentage
    const progressPercent = (monthsPaid / durationMonths) * 100

    // First and last month payments for reference
    const firstMonthPayment = schedule[0]?.payment || 0
    const lastMonthPayment = schedule[schedule.length - 1]?.payment || 0

    // Calculate next payment amount
    const nextMonth = monthsPaid + 1
    const nextMonthData = schedule[nextMonth - 1]
    const nextMonthPayment = nextMonthData?.payment || 0

    const [expanded, setExpanded] = useState(false)
    const [viewSchedule, setViewSchedule] = useState(false)
    const [isAddingPayment, setIsAddingPayment] = useState(false)

    return (
        <motion.div
            variants={itemVariants}
            layout
            className="group"
        >
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-blue-600/10 border-0 floating-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity" />

                <CardContent className="p-5 relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <Users className="w-6 h-6 text-blue-500" />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1">{scheme.name}</h3>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs bg-background/50">
                                        {durationMonths} months
                                    </Badge>
                                    {nextMonth <= durationMonths ? (
                                        <Badge className="text-xs bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 border-blue-200">
                                            Next: {formatCurrency(nextMonthPayment)}
                                        </Badge>
                                    ) : (
                                        <Badge className="text-xs bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 border-emerald-200">
                                            Completed
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onEdit(scheme)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onDelete(scheme.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Payment Progress with Visual Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Payment Progress</span>
                            <span className="font-semibold text-blue-500">
                                {monthsPaid} / {durationMonths} months
                            </span>
                        </div>
                        <div className="h-3 bg-background/50 rounded-full overflow-hidden border border-blue-500/20">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Monthly: ₹{firstMonthPayment.toLocaleString('en-IN')} → ₹{lastMonthPayment.toLocaleString('en-IN')}
                        </p>
                    </div>

                    {/* Financial Summary Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Paid So Far</p>
                            <p className="text-lg font-bold text-emerald-500">{formatCurrency(actualPaid)}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Investment</p>
                            <p className="text-lg font-bold text-blue-500">{formatCurrency(totalToPay)}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Remaining</p>
                            <p className="text-lg font-bold text-amber-500">{formatCurrency(remainingToPay)}</p>
                        </div>
                    </div>

                    {/* Detailed Breakdown - Always Visible */}
                    <div className="space-y-1.5 text-sm border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">Chit Value</span>
                            <span className="font-medium">{formatCurrency(chitValue)}</span>
                        </div>
                        <div className="flex items-center justify-between text-amber-500">
                            <span className="text-xs">Broker Commission ({commissionPercent}%)</span>
                            <span className="font-medium text-xs">- {formatCurrency(commission)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">Net Gain</span>
                            <span className={`font-medium text-xs ${netGain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {netGain >= 0 ? '+' : ''}{formatCurrency(netGain)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-background/30 -mx-3 px-3 py-2 rounded-lg mt-2">
                            <span className="font-medium text-emerald-500">You Receive (Month {durationMonths})</span>
                            <span className="font-bold text-lg text-emerald-500">{formatCurrency(youReceive)}</span>
                        </div>
                    </div>

                    {/* Footer Actions / Expand Trigger */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                                onClick={() => setIsAddingPayment(true)}
                            >
                                <Plus className="w-3 h-3" />
                                <span className="text-xs">Add Payment</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`h-8 gap-1 border-blue-500/30 hover:bg-blue-500/10 ${viewSchedule ? 'bg-blue-500/10 text-blue-500' : 'text-muted-foreground'}`}
                                onClick={() => setViewSchedule(!viewSchedule)}
                            >
                                <Calendar className="w-3 h-3" />
                                <span className="text-xs">{viewSchedule ? 'Hide Schedule' : 'Schedule'}</span>
                            </Button>

                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <span className="text-xs">{expanded ? 'Hide Details' : 'View Details & History'}</span>
                            <ArrowUpRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : 'rotate-90'}`} />
                        </Button>
                    </div>

                    {/* Expandable Section */}
                    <AnimatePresence>
                        {(expanded || isAddingPayment || viewSchedule) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 border-t border-border mt-4">

                                    {/* Projected Schedule View */}
                                    {viewSchedule && (
                                        <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-500" /> Payment Schedule
                                                </h4>
                                                <Badge variant="outline" className="text-[10px] bg-background">
                                                    Projected
                                                </Badge>
                                            </div>
                                            <div className="rounded-lg border border-border overflow-hidden bg-background/40">
                                                <div className="grid grid-cols-4 gap-2 p-2 bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground text-center tracking-wider">
                                                    <div>Month</div>
                                                    <div>Pay</div>
                                                    <div>Bonus</div>
                                                    <div>Status</div>
                                                </div>
                                                <div className="max-h-[250px] overflow-y-auto scrollbar-thin">
                                                    {schedule.map((item) => {
                                                        const isPaid = item.month <= monthsPaid;
                                                        const isNext = item.month === monthsPaid + 1;
                                                        return (
                                                            <div
                                                                key={item.month}
                                                                className={`grid grid-cols-4 gap-2 p-2.5 text-xs text-center border-t border-border/40 items-center transition-colors
                                                                    ${isPaid ? 'bg-emerald-500/5' : ''}
                                                                    ${isNext ? 'bg-blue-500/10 font-medium' : 'hover:bg-accent/30'}
                                                                `}
                                                            >
                                                                <div className="text-muted-foreground">#{item.month}</div>
                                                                <div className={isNext ? 'text-blue-500' : ''}>{formatCurrency(item.payment)}</div>
                                                                <div className="text-muted-foreground">{formatCurrency(item.bonus)}</div>
                                                                <div>
                                                                    {isPaid ? (
                                                                        <div className="flex justify-center text-emerald-500"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                                                    ) : isNext ? (
                                                                        <Badge variant="secondary" className="text-[10px] h-5 bg-blue-500/20 text-blue-600 border-0">Due</Badge>
                                                                    ) : (
                                                                        <span className="text-muted-foreground/30">-</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}



                                    <ChitPaymentHistory
                                        scheme={scheme}
                                        payments={payments}
                                        isAdding={isAddingPayment}
                                        setIsAdding={setIsAddingPayment}
                                        onViewHistory={onViewHistory} // To trigger refersh
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Inline Chit Payment History Component
function ChitPaymentHistory({ scheme, payments, isAdding, setIsAdding, onViewHistory }) {
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [monthNumber, setMonthNumber] = useState(payments.length + 1)
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleAddPayment = async (e) => {
        e.preventDefault()
        if (!amount || Number(amount) <= 0) return

        setSubmitting(true)
        try {
            const newPayment = {
                scheme_id: scheme.id,
                amount: Number(amount),
                payment_date: date,
                notes: notes,
                month_number: Number(monthNumber) || null,
                created_at: new Date().toISOString()
            }

            await addFinancePayment(newPayment)

            // Reset form
            setAmount('')
            setNotes('')
            setMonthNumber(payments.length + 2) // +2 because we just added one (though list isn't refreshed yet locally, ideally we refresh)
            setIsAdding(false)

            // Trigger refresh in parent
            if (onViewHistory) onViewHistory(scheme) // Using existing hook to trigger refresh

        } catch (error) {
            console.error('Error adding payment:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeletePayment = async (id) => {
        if (!confirm('Delete this payment record?')) return
        try {
            await deleteFinancePayment(id)
            if (onViewHistory) onViewHistory(scheme) // Trigger refresh
        } catch (error) {
            console.error('Error deleting payment:', error)
        }
    }

    return (
        <div className="space-y-4">
            {isAdding ? (
                <div className="bg-background/50 p-4 rounded-lg border border-border animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">Add Payment</h4>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsAdding(false)}>
                            <XCircle className="w-4 h-4" />
                        </Button>
                    </div>
                    <form onSubmit={handleAddPayment} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Amount</Label>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="h-8"
                                    placeholder="Amount"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Month No.</Label>
                                <Input
                                    type="number"
                                    value={monthNumber}
                                    onChange={(e) => setMonthNumber(e.target.value)}
                                    className="h-8"
                                    placeholder="#"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Notes</Label>
                                <Input
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="h-8"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="ghost" size="sm" className="h-7" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button type="submit" size="sm" className="h-7 bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Payment'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : null}

            <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center justify-between">
                    <span>Payment History</span>
                    <span className="text-xs text-muted-foreground">{payments.length} records</span>
                </h4>

                {payments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 bg-background/30 rounded-lg border border-dashed">
                        No payments recorded yet.
                    </p>
                ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {payments.map(payment => (
                            <div key={payment.id} className="flex items-center justify-between p-2 rounded bg-background/40 hover:bg-background/60 border border-transparent hover:border-border/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                                        {payment.month_number || '#'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{formatCurrency(payment.amount)}</p>
                                        <p className="text-[10px] text-muted-foreground">{formatDate(payment.payment_date)}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeletePayment(payment.id)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Dynamic Form Component based on Scheme Type
function SchemeForm({ scheme, onSubmit, onClose }) {
    const [schemeType, setSchemeType] = useState(scheme?.scheme_type || 'PRIVATE_FINANCE')
    const [formData, setFormData] = useState({
        name: scheme?.name || '',
        scheme_type: scheme?.scheme_type || 'PRIVATE_FINANCE',
        principal: scheme?.principal || '',
        interest_rate: scheme?.interest_rate || '',
        payment_cycle: scheme?.payment_cycle || 'MONTHLY',
        risk_level: scheme?.risk_level || 'MEDIUM',
        status: scheme?.status || 'ACTIVE',
        start_date: scheme?.start_date || new Date().toISOString().split('T')[0],
        notes: scheme?.notes || '',
        // Chit fund specific
        chit_value: scheme?.chit_value || '',
        duration_months: scheme?.duration_months || '20',
        commission_percent: scheme?.commission_percent || '4',
        won_at_month: scheme?.won_at_month || '',
        current_month: scheme?.current_month || '1',
        // FD specific
        tenure: scheme?.tenure || '1',
        // PPF specific
        yearly_deposit: scheme?.yearly_deposit || '',
        // Account details
        account_number: scheme?.account_number || '',
        branch: scheme?.branch || ''
    })
    const [loading, setLoading] = useState(false)

    // Auto-set interest rate based on scheme type
    useEffect(() => {
        if (!scheme) { // Only for new schemes
            const rates = INTEREST_RATES[schemeType]
            if (rates) {
                if (typeof rates === 'object') {
                    // FD has tenure-based rates
                    setFormData(prev => ({
                        ...prev,
                        interest_rate: rates[`${prev.tenure}Y`] || rates['1Y']
                    }))
                } else {
                    setFormData(prev => ({ ...prev, interest_rate: rates }))
                }
            }
        }
    }, [schemeType, formData.tenure])

    const handleSchemeTypeChange = (type) => {
        setSchemeType(type)
        setFormData(prev => ({
            ...prev,
            scheme_type: type,
            risk_level: type === 'PRIVATE_FINANCE' ? 'HIGH' :
                type === 'CHIT_FUND' ? 'MEDIUM' : 'LOW'
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Build submission data based on type
            const submitData = {
                name: formData.name,
                scheme_type: schemeType,
                principal: Number(formData.principal) || 0,
                interest_rate: Number(formData.interest_rate) || 0,
                status: formData.status,
                start_date: formData.start_date,
                notes: formData.notes,
                risk_level: formData.risk_level
            }

            // Add type-specific fields
            switch (schemeType) {
                case 'CHIT_FUND':
                    submitData.chit_value = Number(formData.chit_value) || 0
                    submitData.duration_months = Number(formData.duration_months) || 20
                    submitData.commission_percent = Number(formData.commission_percent) || 4
                    submitData.won_at_month = formData.won_at_month ? Number(formData.won_at_month) : null
                    submitData.current_month = Number(formData.current_month) || 1
                    submitData.principal = submitData.chit_value // Principal = total chit value
                    break
                case 'POST_OFFICE_FD':
                    submitData.tenure = formData.tenure
                    submitData.payment_cycle = 'YEARLY'
                    submitData.account_number = formData.account_number
                    submitData.branch = formData.branch
                    break
                case 'POST_OFFICE_RD':
                    submitData.monthly_amount = Number(formData.monthly_amount) || 0
                    submitData.principal = submitData.monthly_amount * 60 // 5 year
                    submitData.payment_cycle = 'MONTHLY'
                    submitData.account_number = formData.account_number
                    submitData.branch = formData.branch
                    break
                case 'PPF':
                    submitData.yearly_deposit = Number(formData.yearly_deposit) || Number(formData.principal)
                    submitData.payment_cycle = 'YEARLY'
                    submitData.account_number = formData.account_number
                    submitData.branch = formData.branch
                    break
                case 'NSC':
                case 'KVP':
                case 'SCSS':
                    submitData.account_number = formData.account_number
                    submitData.branch = formData.branch
                    submitData.payment_cycle = 'LUMPSUM'
                    break
                default:
                    submitData.payment_cycle = formData.payment_cycle
            }

            // Add payment due day if available
            if (formData.payment_due_day) {
                submitData.payment_due_day = Number(formData.payment_due_day)
            }

            await onSubmit(submitData)
            onClose()
        } catch (error) {
            console.error('Error saving scheme:', error)
        } finally {
            setLoading(false)
        }
    }

    // Render type-specific form fields
    const renderTypeSpecificFields = () => {
        switch (schemeType) {
            case 'CHIT_FUND':
                // Calculate installment range based on chit value
                const chitVal = Number(formData.chit_value) || 500000
                const months = Number(formData.duration_months) || 20
                const baseInst = chitVal / months
                const firstBonus = Math.round(baseInst * 0.27) // ~27% bonus first month
                const firstInstallment = baseInst - firstBonus
                const lastInstallment = baseInst

                return (
                    <>
                        {/* Chit Value Presets */}
                        <div className="space-y-2">
                            <Label>Chit Value (Quick Select)</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {['3L', '5L', '10L', '20L'].map((preset) => {
                                    const val = parseInt(preset) * 100000
                                    return (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => {
                                                const newMonths = 20
                                                const newBase = val / newMonths
                                                setFormData({
                                                    ...formData,
                                                    chit_value: val,
                                                    duration_months: newMonths,
                                                    principal: val
                                                })
                                            }}
                                            className={`p-2 rounded-lg border text-sm transition-all ${Number(formData.chit_value) === val
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                                                : 'border-border hover:border-muted-foreground'
                                                }`}
                                        >
                                            ₹{preset}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Chit Value (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="500000"
                                    value={formData.chit_value ?? ''}
                                    onChange={(e) => setFormData({ ...formData, chit_value: e.target.value, principal: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (months)</Label>
                                <Select
                                    value={formData.duration_months || '20'}
                                    onValueChange={(value) => setFormData({ ...formData, duration_months: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="20">20 months</SelectItem>
                                        <SelectItem value="25">25 months</SelectItem>
                                        <SelectItem value="30">30 months</SelectItem>
                                        <SelectItem value="40">40 months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Calculated Installment Range */}
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="text-sm text-muted-foreground mb-2">Calculated Installment Range</div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Base:</span>
                                    <span className="font-medium ml-1">₹{baseInst.toLocaleString('en-IN')}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Month 1:</span>
                                    <span className="font-medium ml-1 text-emerald-500">₹{Math.round(firstInstallment).toLocaleString('en-IN')}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Month {months}:</span>
                                    <span className="font-medium ml-1">₹{Math.round(lastInstallment).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Early months pay less (more bonus), last month pays full base amount
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Commission %</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="4"
                                    value={formData.commission_percent ?? ''}
                                    onChange={(e) => setFormData({ ...formData, commission_percent: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Foreman/organizer fee</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Won at Month (if won)</Label>
                                <Select
                                    value={formData.won_at_month || 'none'}
                                    onValueChange={(value) => setFormData({ ...formData, won_at_month: value === 'none' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Not yet won" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Not yet won</SelectItem>
                                        {Array.from({ length: months }, (_, i) => i + 1).map((m) => (
                                            <SelectItem key={m} value={String(m)}>Month {m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Current Month Tracker */}
                        <div className="space-y-2">
                            <Label>Current Month (running)</Label>
                            <Select
                                value={formData.current_month || '1'}
                                onValueChange={(value) => setFormData({ ...formData, current_month: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: months }, (_, i) => i + 1).map((m) => (
                                        <SelectItem key={m} value={String(m)}>Month {m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )

            case 'POST_OFFICE_FD':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Deposit Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="100000"
                                    value={formData.principal ?? ''}
                                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tenure</Label>
                                <Select
                                    value={formData.tenure}
                                    onValueChange={(value) => {
                                        const rate = INTEREST_RATES.POST_OFFICE_FD[`${value}Y`]
                                        setFormData({ ...formData, tenure: value, interest_rate: rate })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Year @ 6.9%</SelectItem>
                                        <SelectItem value="2">2 Years @ 7.0%</SelectItem>
                                        <SelectItem value="3">3 Years @ 7.1%</SelectItem>
                                        <SelectItem value="5">5 Years @ 7.5%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input
                                    placeholder="PO Account No."
                                    value={formData.account_number ?? ''}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Branch</Label>
                                <Input
                                    placeholder="Post Office Branch"
                                    value={formData.branch ?? ''}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </div>
                        </div>
                    </>
                )

            case 'POST_OFFICE_RD':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Monthly Deposit (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="5000"
                                    value={formData.monthly_amount ?? ''}
                                    onChange={(e) => setFormData({ ...formData, monthly_amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Interest Rate</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.interest_rate || INTEREST_RATES.POST_OFFICE_RD}
                                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground">5-year term @ 6.7% p.a.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input
                                    placeholder="RD Account No."
                                    value={formData.account_number ?? ''}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Branch</Label>
                                <Input
                                    placeholder="Post Office Branch"
                                    value={formData.branch ?? ''}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </div>
                        </div>
                    </>
                )

            case 'NSC':
            case 'KVP':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Investment Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="100000"
                                    value={formData.principal ?? ''}
                                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Interest Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.interest_rate || INTEREST_RATES[schemeType]}
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground">
                                    {schemeType === 'NSC' ? '5 years @ 7.7% p.a.' : 'Doubles in 115 months'}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Certificate / Account No.</Label>
                                <Input
                                    placeholder="Certificate Number"
                                    value={formData.account_number ?? ''}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Branch</Label>
                                <Input
                                    placeholder="Post Office Branch"
                                    value={formData.branch ?? ''}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </div>
                        </div>
                    </>
                )

            case 'PPF':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Total Balance (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="Current balance"
                                    value={formData.principal ?? ''}
                                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Yearly Deposit (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="150000"
                                    value={formData.yearly_deposit ?? ''}
                                    onChange={(e) => setFormData({ ...formData, yearly_deposit: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Max ₹1.5L/year</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input
                                    placeholder="PPF Account No."
                                    value={formData.account_number ?? ''}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Interest Rate</Label>
                                <Input
                                    value={`${INTEREST_RATES.PPF}%`}
                                    disabled
                                />
                            </div>
                        </div>
                    </>
                )

            default: // PRIVATE_FINANCE
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount Invested (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="200000"
                                    value={formData.principal ?? ''}
                                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Interest Rate (%/year)</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="18"
                                    value={formData.interest_rate ?? ''}
                                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payout Cycle</Label>
                                <Select
                                    value={formData.payment_cycle}
                                    onValueChange={(value) => setFormData({ ...formData, payment_cycle: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                        <SelectItem value="YEARLY">Yearly</SelectItem>
                                        <SelectItem value="LUMPSUM">Lumpsum</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Risk Level</Label>
                                <Select
                                    value={formData.risk_level}
                                    onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                )
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Scheme Type Selector */}
            <div className="space-y-2">
                <Label>Investment Type</Label>
                <div className="grid grid-cols-4 gap-2">
                    {Object.entries(SCHEME_TYPES).map(([key, config]) => {
                        const Icon = config.icon
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleSchemeTypeChange(key)}
                                className={`p-2 rounded-lg border text-center transition-all ${schemeType === key
                                    ? `border-${config.color}-500 bg-${config.color}-500/10`
                                    : 'border-border hover:border-muted-foreground'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mx-auto mb-1 ${schemeType === key ? `text-${config.color}-500` : 'text-muted-foreground'}`} />
                                <span className="text-xs">{config.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Scheme Name */}
            <div className="space-y-2">
                <Label htmlFor="name">
                    {schemeType === 'CHIT_FUND' ? 'Chit Name / Organizer' :
                        schemeType.startsWith('POST') || schemeType === 'NSC' || schemeType === 'KVP' || schemeType === 'PPF' ? 'Account Name / Description' :
                            'Scheme / Person Name'}
                </Label>
                <Input
                    id="name"
                    placeholder={
                        schemeType === 'CHIT_FUND' ? 'e.g., Lakshmi Chits - 5L' :
                            schemeType === 'POST_OFFICE_FD' ? 'e.g., Post Office FD 2024' :
                                'e.g., Ravi Finance Scheme'
                    }
                    value={formData.name ?? ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            {/* Type-specific fields */}
            {renderTypeSpecificFields()}

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        value={formData.start_date ?? ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                    />
                </div>

                {['CHIT_FUND', 'PRIVATE_FINANCE', 'POST_OFFICE_RD'].includes(schemeType) && (
                    <div className="space-y-2">
                        <Label>Payment Due Day</Label>
                        <Select
                            value={formData.payment_due_day ? String(formData.payment_due_day) : 'none'}
                            onValueChange={(value) => setFormData({ ...formData, payment_due_day: value === 'none' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                    <SelectItem key={d} value={String(d)}>{d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} of month</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="MATURED">Matured</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            {schemeType === 'PRIVATE_FINANCE' && (
                                <>
                                    <SelectItem value="DELAYED">Delayed</SelectItem>
                                    <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                    placeholder="Additional details, contact info, etc."
                    value={formData.notes ?? ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                />
            </div>

            <div className="flex gap-3 pt-4 sticky bottom-0 bg-background">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : (scheme ? 'Update' : 'Add Investment')}
                </Button>
            </div>
        </form >
    )
}

// Empty State
function EmptyState({ onAdd }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <motion.div
                className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <TrendingUp className="w-8 h-8 text-violet-500" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No Investments Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-xs">
                Track your chit funds, post office schemes, and private finance investments.
            </p>
            <Button onClick={onAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Investment
            </Button>
        </motion.div>
    )
}

// Payment History Dialog Component
function PaymentHistoryDialog({ scheme, onClose }) {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')
    const [monthNumber, setMonthNumber] = useState('')

    // Fetch payments on load
    useEffect(() => {
        loadPayments()
    }, [scheme.id])

    async function loadPayments() {
        try {
            const data = await getFinancePayments(scheme.id)
            setPayments(data || [])
        } catch (error) {
            console.error('Error fetching payments:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddPayment(e) {
        e.preventDefault()
        if (!amount || Number(amount) <= 0) return

        try {
            const newPayment = {
                scheme_id: scheme.id,
                amount: Number(amount),
                payment_date: date,
                notes: notes,
                created_at: new Date().toISOString()
            }

            if (scheme.scheme_type === 'CHIT_FUND') {
                newPayment.month_number = Number(monthNumber) || null
            }

            const saved = await addFinancePayment(newPayment)
            if (saved) {
                setPayments([saved, ...payments])
                setAmount('')
                setNotes('')
                setMonthNumber('')
                // If it's a chit fund, user might want to update current_month of scheme too - optional
                // future task: prompt to update scheme current_month
            }
        } catch (error) {
            console.error('Error adding payment:', error)
        }
    }

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this payment?')) return
        try {
            await deleteFinancePayment(id)
            setPayments(payments.filter(p => p.id !== id))
        } catch (error) {
            console.error('Error deleting payment:', error)
        }
    }

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    return (
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Payment History - {scheme.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
                {/* Stats */}
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalPaid)}</p>
                    </div>
                    {scheme.scheme_type === 'CHIT_FUND' && (
                        <div>
                            <p className="text-sm text-muted-foreground text-right">Months Paid</p>
                            <p className="text-2xl font-bold text-right">{payments.length}</p>
                        </div>
                    )}
                </div>

                {/* Add Payment Form */}
                <form onSubmit={handleAddPayment} className="space-y-4 p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Record New Payment
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {scheme.scheme_type === 'CHIT_FUND' && (
                        <div className="space-y-2">
                            <Label>Instalment Month No.</Label>
                            <Input
                                type="number"
                                value={monthNumber}
                                onChange={(e) => setMonthNumber(e.target.value)}
                                placeholder={`e.g. ${payments.length + 1}`}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Transaction ID, remarks..."
                        />
                    </div>

                    <Button type="submit" size="sm" className="w-full">
                        Add Payment
                    </Button>
                </form>

                {/* List */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-sm">History</h4>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading history...</div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                            No payments recorded yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors flex justify-between items-center group"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                                            {new Date(payment.payment_date).getDate()}
                                            <span className="text-[10px] ml-0.5">
                                                {new Date(payment.payment_date).toLocaleString('default', { month: 'short' }).substring(0, 3)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                            <div className="text-xs text-muted-foreground flex gap-2">
                                                <span>{formatDate(payment.payment_date)}</span>
                                                {payment.month_number && (
                                                    <span className="bg-blue-500/10 text-blue-500 px-1.5 rounded">
                                                        Month {payment.month_number}
                                                    </span>
                                                )}
                                            </div>
                                            {payment.notes && (
                                                <p className="text-xs text-muted-foreground mt-0.5 italic">{payment.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(payment.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
    )
}

export default function FinancePage() {
    const { isDemo } = useAuth()
    const [schemes, setSchemes] = useState([])
    const [allPayments, setAllPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingScheme, setEditingScheme] = useState(null)
    const [filter, setFilter] = useState('ALL')
    const [historyScheme, setHistoryScheme] = useState(null)

    useEffect(() => {
        fetchSchemes()
    }, [isDemo])

    const fetchSchemes = async () => {
        try {
            if (isDemo) {
                setSchemes(demoFinanceSchemes)
                setAllPayments([])
            } else {
                const [schemesData, paymentsData] = await Promise.all([
                    getFinanceSchemes(),
                    getAllFinancePayments()
                ])
                setSchemes(schemesData || [])
                setAllPayments(paymentsData || [])
            }
        } catch (error) {
            console.error('Error fetching schemes:', error)
        } finally {
            setLoading(false)
        }
    }

    // Helper to get payments for a scheme
    const getPaymentsForScheme = (schemeId) => allPayments.filter(p => p.scheme_id === schemeId)

    // Helper to calculate actual invested for a scheme
    const getActualInvested = (scheme) => {
        const isRecurring = ['CHIT_FUND', 'POST_OFFICE_RD', 'PPF'].includes(scheme.scheme_type)
        if (!isRecurring) return Number(scheme.principal) || 0

        // For recurring schemes, use actual payment records
        const payments = getPaymentsForScheme(scheme.id)
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
        // Return actual paid amount (even if 0) for recurring schemes
        return totalPaid
    }

    // Filter schemes
    const filteredSchemes = filter === 'ALL'
        ? schemes
        : schemes.filter(s => s.scheme_type === filter)

    // Calculate totals based on actual payments
    const totalInvested = schemes.reduce((sum, s) => sum + getActualInvested(s), 0)
    const activeSchemes = schemes.filter(s => s.status === 'ACTIVE')
    const totalExpectedReturns = schemes.reduce((sum, s) => {
        const payments = getPaymentsForScheme(s.id)
        const actualPaid = payments.reduce((psum, p) => psum + Number(p.amount), 0)
        return sum + calculateExpectedReturnsWithPayments(s, actualPaid)
    }, 0)
    const highRiskSchemes = schemes.filter(s => s.risk_level === 'HIGH' && s.status === 'ACTIVE')

    const handleSubmit = async (data) => {
        if (editingScheme) {
            await updateFinanceScheme(editingScheme.id, data)
        } else {
            await createFinanceScheme(data)
        }
        setEditingScheme(null)
        fetchSchemes()
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this scheme?')) {
            await deleteFinanceScheme(id)
            fetchSchemes()
        }
    }

    const handleEdit = (scheme) => {
        setEditingScheme(scheme)
        setDialogOpen(true)
    }

    const handleAdd = () => {
        setEditingScheme(null)
        setDialogOpen(true)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Investments</h1>
                    <p className="text-muted-foreground">Track chits, post office schemes & private finance</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={handleAdd}>
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Investment</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingScheme ? 'Edit Investment' : 'Add Investment'}</DialogTitle>
                        </DialogHeader>
                        <SchemeForm
                            scheme={editingScheme}
                            onSubmit={handleSubmit}
                            onClose={() => setDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="glass-card border-0">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invested</p>
                                <p className="text-2xl font-bold gradient-text">{formatCurrency(totalInvested)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Returns</p>
                                <p className="text-xl font-semibold text-emerald-500">+{formatCurrency(totalExpectedReturns)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active</p>
                                <p className="text-xl font-semibold">{activeSchemes.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">High Risk</p>
                                <p className={`text-xl font-semibold ${highRiskSchemes.length > 0 ? 'text-red-500' : ''}`}>
                                    {highRiskSchemes.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Filter Tabs */}
            {schemes.length > 0 && (
                <Tabs value={filter} onValueChange={setFilter} className="w-full">
                    <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
                        <TabsTrigger value="ALL" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            All
                        </TabsTrigger>
                        {Object.entries(SCHEME_TYPES).map(([key, config]) => {
                            const count = schemes.filter(s => s.scheme_type === key).length
                            if (count === 0) return null
                            return (
                                <TabsTrigger
                                    key={key}
                                    value={key}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    {config.label} ({count})
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </Tabs>
            )}

            {/* Warning for high risk */}
            {highRiskSchemes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-sm">
                                <span className="font-medium text-amber-500">{highRiskSchemes.length} high-risk scheme(s)</span>
                                <span className="text-muted-foreground"> with {formatCurrency(highRiskSchemes.reduce((sum, s) => sum + Number(s.principal), 0))} invested</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Schemes List */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-52 rounded-xl bg-card animate-pulse" />
                        ))}
                    </div>
                ) : filteredSchemes.length === 0 ? (
                    <EmptyState onAdd={handleAdd} />
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {filteredSchemes.map((scheme) => (
                            <SchemeCard
                                key={scheme.id}
                                scheme={scheme}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewHistory={(s) => {
                                    if (s.scheme_type === 'CHIT_FUND') {
                                        fetchSchemes() // Refresh data for inline updates
                                    } else {
                                        setHistoryScheme(s) // Open dialog for others
                                    }
                                }}
                                payments={allPayments}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment History Dialog */}
            <Dialog open={!!historyScheme} onOpenChange={(open) => !open && setHistoryScheme(null)}>
                {historyScheme && (
                    <PaymentHistoryDialog
                        scheme={historyScheme}
                        onClose={() => {
                            setHistoryScheme(null)
                            fetchSchemes() // Refresh data after adding payments
                        }}
                    />
                )}
            </Dialog>
        </motion.div>
    )
}
