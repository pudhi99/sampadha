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
    Zap
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
import { getFinanceSchemes, createFinanceScheme, updateFinanceScheme, deleteFinanceScheme } from '@/lib/db'

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
    DEFAULTED: { label: 'Defaulted', icon: XCircle, color: 'text-red-500' }
}

// Calculate expected returns
function calculateExpectedReturns(principal, rate, startDate, cycle) {
    const p = Number(principal) || 0
    const r = Number(rate) / 100 || 0
    const start = new Date(startDate)
    const today = new Date()
    const years = (today - start) / (1000 * 60 * 60 * 24 * 365)

    return p * r * years
}

// Scheme Card Component
function SchemeCard({ scheme, onEdit, onDelete }) {
    const risk = riskConfig[scheme.risk_level] || riskConfig.MEDIUM
    const status = statusConfig[scheme.status] || statusConfig.ACTIVE
    const StatusIcon = status.icon
    const expectedReturns = calculateExpectedReturns(
        scheme.principal,
        scheme.interest_rate,
        scheme.start_date,
        scheme.payment_cycle
    )

    return (
        <motion.div
            variants={itemVariants}
            layout
            whileHover={{ y: -4 }}
            className="group"
        >
            <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-0 floating-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity" />

                <CardContent className="p-5 relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <Zap className="w-6 h-6 text-violet-500" />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-lg">{scheme.name}</h3>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant="outline" className={`${risk.color} text-xs`}>
                                        {risk.label}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invested</p>
                            <p className="text-xl font-bold">{formatCurrency(scheme.principal)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Returns</p>
                            <p className="text-xl font-bold text-emerald-500">+{formatCurrency(expectedReturns)}</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
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
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-medium flex items-center gap-1 ${status.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {status.label}
                            </span>
                        </div>
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

// Scheme Form Component
function SchemeForm({ scheme, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        name: scheme?.name || '',
        principal: scheme?.principal || '',
        interest_rate: scheme?.interest_rate || '18',
        payment_cycle: scheme?.payment_cycle || 'MONTHLY',
        risk_level: scheme?.risk_level || 'MEDIUM',
        status: scheme?.status || 'ACTIVE',
        start_date: scheme?.start_date || new Date().toISOString().split('T')[0],
        notes: scheme?.notes || ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit({
                ...formData,
                principal: Number(formData.principal) || 0,
                interest_rate: Number(formData.interest_rate) || 0
            })
            onClose()
        } catch (error) {
            console.error('Error saving scheme:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Scheme / Person Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., Ravi Finance, Gold Scheme"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="principal">Amount (₹)</Label>
                    <Input
                        id="principal"
                        type="number"
                        placeholder="200000"
                        value={formData.principal}
                        onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="interest_rate">Interest Rate (%/year)</Label>
                    <Input
                        id="interest_rate"
                        type="number"
                        step="0.1"
                        placeholder="18"
                        value={formData.interest_rate}
                        onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="payment_cycle">Payout Cycle</Label>
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
                    <Label htmlFor="risk_level">Risk Level</Label>
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
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                    id="notes"
                    placeholder="Payment schedule, contact info, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : (scheme ? 'Update' : 'Add Scheme')}
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
                className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <TrendingUp className="w-8 h-8 text-violet-500" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No Finance Schemes Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-xs">
                Track your private finance investments and expected returns.
            </p>
            <Button onClick={onAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Scheme
            </Button>
        </motion.div>
    )
}

export default function FinancePage() {
    const [schemes, setSchemes] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingScheme, setEditingScheme] = useState(null)

    useEffect(() => {
        fetchSchemes()
    }, [])

    const fetchSchemes = async () => {
        try {
            const data = await getFinanceSchemes()
            setSchemes(data || [])
        } catch (error) {
            console.error('Error fetching schemes:', error)
        } finally {
            setLoading(false)
        }
    }

    // Calculate totals
    const totalInvested = schemes.reduce((sum, s) => sum + Number(s.principal), 0)
    const activeSchemes = schemes.filter(s => s.status === 'ACTIVE')
    const totalExpectedReturns = schemes.reduce((sum, s) => {
        return sum + calculateExpectedReturns(s.principal, s.interest_rate, s.start_date, s.payment_cycle)
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Private Finance</h1>
                    <p className="text-muted-foreground">Track your high-yield investments</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={handleAdd}>
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Scheme</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingScheme ? 'Edit Scheme' : 'Add Finance Scheme'}</DialogTitle>
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
                ) : schemes.length === 0 ? (
                    <EmptyState onAdd={handleAdd} />
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {schemes.map((scheme) => (
                            <SchemeCard
                                key={scheme.id}
                                scheme={scheme}
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
