'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Receipt, Calendar, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createLoanPayment } from '@/lib/db'
import { formatCurrency, formatFullCurrency } from '@/lib/calculations'

export function PaymentDialog({ loan, onPaymentAdded, children }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: '',
        payment_type: 'MIXED',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.amount) return

        setLoading(true)
        try {
            await createLoanPayment({
                loan_id: loan.id,
                amount: Number(formData.amount),
                payment_type: formData.payment_type,
                payment_date: formData.payment_date,
                notes: formData.notes
            })

            setOpen(false)
            setFormData({
                amount: '',
                payment_type: 'MIXED',
                payment_date: new Date().toISOString().split('T')[0],
                notes: ''
            })

            if (onPaymentAdded) {
                onPaymentAdded()
            }
        } catch (error) {
            console.error('Error adding payment:', error)
            alert('Failed to add payment')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Payment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="glass-card sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        Record Payment
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Loan Summary */}
                    <div className="bg-background/50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-muted-foreground mb-1">Loan to {loan.party_name}</p>
                        <p className="text-xl font-bold">{formatFullCurrency(loan.principal)}</p>
                        <p className="text-sm text-muted-foreground">@ {loan.interest_rate}% p.a.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Payment Amount (₹)</Label>
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payment Type</Label>
                                <Select
                                    value={formData.payment_type}
                                    onValueChange={(v) => setFormData({ ...formData, payment_type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MIXED">Mixed</SelectItem>
                                        <SelectItem value="PRINCIPAL">Principal Only</SelectItem>
                                        <SelectItem value="INTEREST">Interest Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Date</Label>
                                <Input
                                    type="date"
                                    value={formData.payment_date}
                                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Input
                                placeholder="e.g., Partial payment via UPI"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={loading || !formData.amount}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Record Payment'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Payment History List
export function PaymentHistory({ payments, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    if (!payments || payments.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No payments recorded yet</p>
            </div>
        )
    }

    const sortedPayments = [...payments].sort(
        (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
    )

    return (
        <div className="space-y-3">
            {sortedPayments.map((payment, index) => (
                <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="font-medium text-emerald-500">
                                +{formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {payment.payment_type.toLowerCase()} payment
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: '2-digit'
                            })}
                        </div>
                        {payment.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{payment.notes}</p>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
