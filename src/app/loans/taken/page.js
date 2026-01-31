'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CreditCard,
    Plus,
    Trash2,
    Edit,
    Calendar,
    Percent,
    Building2,
    TrendingDown,
    CheckCircle2,
    Clock,
    Receipt,
    ChevronDown,
    ChevronUp
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getLoans, createLoan, updateLoan, deleteLoan, getPaymentsByLoanId } from '@/lib/db'
import { PaymentDialog, PaymentHistory } from '@/components/loans/PaymentDialog'
import { calculateLoanBalance } from '@/lib/calculations'
import { useAuth } from '@/context/AuthContext'
import { demoLoans, demoPayments } from '@/lib/demoData'

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

// Calculate EMI
function calculateEMI(principal, rate, months) {
    const p = Number(principal) || 0
    const r = (Number(rate) / 100) / 12
    const n = Number(months) || 12

    if (r === 0) return p / n
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

// Calculate remaining amount
function calculateRemaining(principal, startDate) {
    // Simplified - in real app you'd track payments
    return Number(principal) || 0
}

// Loan Card Component with Payment Tracking
function LoanCard({ loan, onEdit, onDelete, onPaymentAdded, isDemo }) {
    const [expanded, setExpanded] = useState(false)
    const [payments, setPayments] = useState([])
    const [loadingPayments, setLoadingPayments] = useState(false)

    const monthsToEnd = loan.end_date
        ? Math.max(0, Math.ceil((new Date(loan.end_date) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
        : 12
    const emi = calculateEMI(loan.principal, loan.interest_rate, monthsToEnd || 12)

    // Calculate balance based on payments
    const balance = calculateLoanBalance(loan, payments)
    const totalPaid = balance.totalPaid
    const principalAmount = Number(loan.principal) || 0
    const progress = principalAmount > 0 ? Math.min((totalPaid / principalAmount) * 100, 100) : 0
    const remaining = Math.max(0, principalAmount - totalPaid)

    // Load payments when expanded
    useEffect(() => {
        if (expanded && payments.length === 0) {
            loadPayments()
        }
    }, [expanded])

    const loadPayments = async () => {
        setLoadingPayments(true)
        try {
            if (isDemo) {
                // Use demo payments from imported data
                const data = demoPayments.filter(p => p.loan_id === loan.id)
                setPayments(data)
            } else {
                const data = await getPaymentsByLoanId(loan.id)
                setPayments(data || [])
            }
        } catch (error) {
            console.error('Error loading payments:', error)
        } finally {
            setLoadingPayments(false)
        }
    }

    const handlePaymentAdded = () => {
        loadPayments()
        if (onPaymentAdded) onPaymentAdded()
    }

    return (
        <motion.div
            variants={itemVariants}
            layout
            className="group"
        >
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-600/5 border-0 floating-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity" />

                <CardContent className="p-5 relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center"
                                whileHover={{ scale: 1.1, rotate: -5 }}
                            >
                                <Building2 className="w-6 h-6 text-red-500" />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-lg">{loan.party_name}</h3>
                                <Badge variant="outline" className={`text-xs ${loan.status === 'ACTIVE'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                    : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {loan.status === 'ACTIVE' ? (
                                        <TrendingDown className="w-3 h-3 mr-1" />
                                    ) : (
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                    )}
                                    {loan.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit(loan)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => onDelete(loan.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Amount Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Principal</p>
                            <p className="text-xl font-bold">{formatCurrency(loan.principal)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">EMI</p>
                            <p className="text-xl font-bold text-red-400">{formatCurrency(emi)}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Paid: {formatCurrency(totalPaid)}</span>
                            <span>Remaining: {formatCurrency(remaining)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Percent className="w-4 h-4" />
                                Interest
                            </span>
                            <span className="font-medium">{loan.interest_rate}% p.a.</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                End Date
                            </span>
                            <span className="font-medium">{formatDate(loan.end_date)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <PaymentDialog loan={loan} onPaymentAdded={handlePaymentAdded}>
                            <Button variant="outline" size="sm" className="flex-1 gap-2">
                                <Receipt className="w-4 h-4" />
                                Add Payment
                            </Button>
                        </PaymentDialog>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className="gap-1"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    Hide
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    History
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Expandable Payment History */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 pt-4 border-t border-border">
                                    <h4 className="text-sm font-semibold mb-3">Payment History</h4>
                                    <PaymentHistory payments={payments} loading={loadingPayments} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loan.notes && !expanded && (
                        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border line-clamp-2">
                            {loan.notes}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Loan Form Component
function LoanForm({ loan, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        party_name: loan?.party_name || '',
        principal: loan?.principal || '',
        interest_rate: loan?.interest_rate || '10',
        interest_type: loan?.interest_type || 'COMPOUND',
        start_date: loan?.start_date || new Date().toISOString().split('T')[0],
        end_date: loan?.end_date || '',
        status: loan?.status || 'ACTIVE',
        notes: loan?.notes || ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit({
                ...formData,
                type: 'TAKEN',
                principal: Number(formData.principal) || 0,
                interest_rate: Number(formData.interest_rate) || 0
            })
            onClose()
        } catch (error) {
            console.error('Error saving loan:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="party_name">Lender / Bank Name</Label>
                <Input
                    id="party_name"
                    placeholder="e.g., HDFC Bank, Personal Loan"
                    value={formData.party_name}
                    onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="principal">Loan Amount (₹)</Label>
                    <Input
                        id="principal"
                        type="number"
                        placeholder="500000"
                        value={formData.principal}
                        onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                        id="interest_rate"
                        type="number"
                        step="0.1"
                        placeholder="10.5"
                        value={formData.interest_rate}
                        onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                    id="notes"
                    placeholder="EMI date, account number, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : (loan ? 'Update' : 'Add Loan')}
                </Button>
            </div>
        </form>
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
                className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <CreditCard className="w-8 h-8 text-red-500" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No Loans Taken</h3>
            <p className="text-muted-foreground mb-4 max-w-xs">
                Track your EMIs and debts to manage liabilities effectively.
            </p>
            <Button onClick={onAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Loan
            </Button>
        </motion.div>
    )
}

export default function LoansTakenPage() {
    const { isDemo } = useAuth()
    const [loans, setLoans] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingLoan, setEditingLoan] = useState(null)

    useEffect(() => {
        fetchLoans()
    }, [isDemo])

    const fetchLoans = async () => {
        try {
            if (isDemo) {
                const takenLoans = demoLoans.filter(l => l.type === 'TAKEN')
                setLoans(takenLoans)
            } else {
                const data = await getLoans('TAKEN')
                setLoans(data || [])
            }
        } catch (error) {
            console.error('Error fetching loans:', error)
        } finally {
            setLoading(false)
        }
    }

    // Calculate totals
    const totalDebt = loans.reduce((sum, l) => sum + Number(l.principal), 0)
    const activeLoans = loans.filter(l => l.status === 'ACTIVE')
    const totalMonthlyEMI = activeLoans.reduce((sum, l) => {
        const months = l.end_date
            ? Math.max(1, Math.ceil((new Date(l.end_date) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
            : 12
        return sum + calculateEMI(l.principal, l.interest_rate, months)
    }, 0)

    const handleSubmit = async (data) => {
        if (editingLoan) {
            await updateLoan(editingLoan.id, data)
        } else {
            await createLoan(data)
        }
        setEditingLoan(null)
        fetchLoans()
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this loan?')) {
            await deleteLoan(id)
            fetchLoans()
        }
    }

    const handleEdit = (loan) => {
        setEditingLoan(loan)
        setDialogOpen(true)
    }

    const handleAdd = () => {
        setEditingLoan(null)
        setDialogOpen(true)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Loans Taken</h1>
                    <p className="text-muted-foreground">Track your EMIs and liabilities</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={handleAdd}>
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Loan</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingLoan ? 'Edit Loan' : 'Add Loan Taken'}</DialogTitle>
                        </DialogHeader>
                        <LoanForm
                            loan={editingLoan}
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
                <Card className="glass-card border-0 border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Debt</p>
                                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalDebt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly EMI</p>
                                <p className="text-xl font-semibold">{formatCurrency(totalMonthlyEMI)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Loans</p>
                                <p className="text-xl font-semibold">{activeLoans.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Loans List */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-56 rounded-xl bg-card animate-pulse" />
                        ))}
                    </div>
                ) : loans.length === 0 ? (
                    <EmptyState onAdd={handleAdd} />
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {loans.map((loan) => (
                            <LoanCard
                                key={loan.id}
                                loan={loan}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onPaymentAdded={fetchLoans}
                                isDemo={isDemo}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
