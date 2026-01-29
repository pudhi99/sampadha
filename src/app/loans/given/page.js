'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    HandCoins,
    Plus,
    Trash2,
    Edit,
    Calendar,
    Percent,
    User,
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { getLoans, createLoan, updateLoan, deleteLoan } from '@/lib/db'

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
    if (num >= 100000) {
        return `₹${(num / 100000).toFixed(2)}L`
    } else if (num >= 1000) {
        return `₹${(num / 1000).toFixed(1)}K`
    }
    return `₹${num.toLocaleString('en-IN')}`
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

// Calculate days overdue
function getDaysOverdue(endDate) {
    if (!endDate) return 0
    const end = new Date(endDate)
    const today = new Date()
    const diff = Math.floor((today - end) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
}

// Calculate expected amount with interest
function calculateExpectedAmount(principal, rate, startDate, endDate, interestType) {
    const p = Number(principal) || 0
    const r = Number(rate) / 100 || 0
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365)

    if (interestType === 'COMPOUND') {
        return p * Math.pow(1 + r, years)
    }
    return p + (p * r * years) // Simple interest
}

// Status config
const statusConfig = {
    ACTIVE: {
        label: 'Active',
        icon: CheckCircle2,
        color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
    },
    DELAYED: {
        label: 'Delayed',
        icon: Clock,
        color: 'bg-amber-500/20 text-amber-500 border-amber-500/30'
    },
    CLOSED: {
        label: 'Closed',
        icon: CheckCircle2,
        color: 'bg-muted text-muted-foreground border-muted'
    },
    DEFAULTED: {
        label: 'Defaulted',
        icon: XCircle,
        color: 'bg-red-500/20 text-red-500 border-red-500/30'
    }
}

// Loan Card Component
function LoanCard({ loan, onEdit, onDelete }) {
    const status = statusConfig[loan.status] || statusConfig.ACTIVE
    const StatusIcon = status.icon
    const daysOverdue = getDaysOverdue(loan.end_date)
    const expectedAmount = calculateExpectedAmount(
        loan.principal,
        loan.interest_rate,
        loan.start_date,
        loan.end_date,
        loan.interest_type
    )
    const expectedInterest = expectedAmount - Number(loan.principal)

    return (
        <motion.div
            variants={itemVariants}
            layout
            whileHover={{ y: -4 }}
            className="group"
        >
            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-0 floating-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity" />

                <CardContent className="p-5 relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <User className="w-6 h-6 text-amber-500" />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-lg">{loan.party_name}</h3>
                                <Badge variant="outline" className={`${status.color} text-xs`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status.label}
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
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Expected</p>
                            <p className="text-xl font-bold text-emerald-500">{formatCurrency(expectedAmount)}</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Percent className="w-4 h-4" />
                                Interest
                            </span>
                            <span className="font-medium">{loan.interest_rate}% ({loan.interest_type})</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Due Date
                            </span>
                            <span className="font-medium">{formatDate(loan.end_date)}</span>
                        </div>
                        {daysOverdue > 0 && loan.status !== 'CLOSED' && (
                            <div className="flex items-center justify-between text-amber-500">
                                <span className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Overdue
                                </span>
                                <span className="font-medium">{daysOverdue} days</span>
                            </div>
                        )}
                    </div>

                    {loan.notes && (
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
        interest_rate: loan?.interest_rate || '12',
        interest_type: loan?.interest_type || 'SIMPLE',
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
                type: 'GIVEN',
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
                <Label htmlFor="party_name">Borrower Name</Label>
                <Input
                    id="party_name"
                    placeholder="e.g., Ravi, Suresh"
                    value={formData.party_name}
                    onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="principal">Amount (₹)</Label>
                    <Input
                        id="principal"
                        type="number"
                        placeholder="100000"
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
                        placeholder="20"
                        value={formData.interest_rate}
                        onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="interest_type">Interest Type</Label>
                <Select
                    value={formData.interest_type}
                    onValueChange={(value) => setFormData({ ...formData, interest_type: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="SIMPLE">Simple Interest</SelectItem>
                        <SelectItem value="COMPOUND">Compound Interest</SelectItem>
                        <SelectItem value="FLAT">Flat Rate</SelectItem>
                    </SelectContent>
                </Select>
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
                    <Label htmlFor="end_date">Due Date</Label>
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
                        <SelectItem value="DELAYED">Delayed</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                    id="notes"
                    placeholder="Any additional details..."
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
                className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <HandCoins className="w-8 h-8 text-amber-500" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No Loans Given Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-xs">
                Track money you've lent to others and expected returns.
            </p>
            <Button onClick={onAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Loan
            </Button>
        </motion.div>
    )
}

export default function LoansGivenPage() {
    const [loans, setLoans] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingLoan, setEditingLoan] = useState(null)

    useEffect(() => {
        fetchLoans()
    }, [])

    const fetchLoans = async () => {
        try {
            const data = await getLoans('GIVEN')
            setLoans(data || [])
        } catch (error) {
            console.error('Error fetching loans:', error)
        } finally {
            setLoading(false)
        }
    }

    // Calculate totals
    const totalPrincipal = loans.reduce((sum, l) => sum + Number(l.principal), 0)
    const activeLoans = loans.filter(l => l.status === 'ACTIVE')
    const delayedLoans = loans.filter(l => l.status === 'DELAYED')
    const totalExpected = loans.reduce((sum, l) => {
        return sum + calculateExpectedAmount(l.principal, l.interest_rate, l.start_date, l.end_date, l.interest_type)
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
                    <h1 className="text-2xl font-bold">Loans Given</h1>
                    <p className="text-muted-foreground">Track money you've lent to others</p>
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
                            <DialogTitle>{editingLoan ? 'Edit Loan' : 'Add New Loan'}</DialogTitle>
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
                <Card className="glass-card border-0">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Lent</p>
                                <p className="text-2xl font-bold gradient-text">{formatCurrency(totalPrincipal)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Expected</p>
                                <p className="text-xl font-semibold text-emerald-500">{formatCurrency(totalExpected)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active</p>
                                <p className="text-xl font-semibold">{activeLoans.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Delayed</p>
                                <p className={`text-xl font-semibold ${delayedLoans.length > 0 ? 'text-amber-500' : ''}`}>
                                    {delayedLoans.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Loans List */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-52 rounded-xl bg-card animate-pulse" />
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
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
