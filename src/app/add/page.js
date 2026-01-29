'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Wallet,
    Coins,
    HandCoins,
    CreditCard,
    TrendingUp,
    ArrowLeft,
    CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { createAsset, createLoan, createFinanceScheme } from '@/lib/db'

const entryTypes = [
    {
        id: 'asset',
        label: 'Asset',
        icon: Wallet,
        color: 'from-emerald-500/20 to-emerald-600/10',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-500',
        description: 'Cash, Bank Balance, Gold, Investments'
    },
    {
        id: 'loan-given',
        label: 'Loan Given',
        icon: HandCoins,
        color: 'from-amber-500/20 to-amber-600/10',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-500',
        description: 'Money lent to others'
    },
    {
        id: 'loan-taken',
        label: 'Loan Taken',
        icon: CreditCard,
        color: 'from-red-500/20 to-red-600/10',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-500',
        description: 'EMIs and debts you owe'
    },
    {
        id: 'finance',
        label: 'Finance Scheme',
        icon: TrendingUp,
        color: 'from-violet-500/20 to-violet-600/10',
        iconBg: 'bg-violet-500/20',
        iconColor: 'text-violet-500',
        description: 'Private finance investments'
    },
]

// Type Selection Step
function TypeSelection({ onSelect, selectedType }) {
    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">What would you like to add?</h2>
                <p className="text-muted-foreground">Choose the type of entry</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {entryTypes.map((type, index) => {
                    const Icon = type.icon
                    const isSelected = selectedType === type.id

                    return (
                        <motion.div
                            key={type.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all ${isSelected
                                        ? 'ring-2 ring-primary glow-primary'
                                        : 'hover:scale-[1.02]'
                                    } bg-gradient-to-br ${type.color} border-0`}
                                onClick={() => onSelect(type.id)}
                            >
                                <CardContent className="p-4 text-center">
                                    <motion.div
                                        className={`w-12 h-12 rounded-xl ${type.iconBg} flex items-center justify-center mx-auto mb-3`}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <Icon className={`w-6 h-6 ${type.iconColor}`} />
                                    </motion.div>
                                    <h3 className="font-semibold mb-1">{type.label}</h3>
                                    <p className="text-xs text-muted-foreground">{type.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

// Asset Form
function AssetForm({ onSubmit, loading }) {
    const [data, setData] = useState({
        name: '',
        type: 'CASH',
        current_value: '',
        purchase_value: '',
        notes: '',
        metadata: {}
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(data) }} className="space-y-4">
            <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input
                    placeholder="e.g., HDFC Savings, Gold Chain"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Type</Label>
                <Select value={data.type} onValueChange={(v) => setData({ ...data, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CASH">Cash & Bank</SelectItem>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="INVESTMENT">Investment</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {data.type === 'GOLD' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Weight (grams)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="50"
                            value={data.metadata.grams || ''}
                            onChange={(e) => setData({ ...data, metadata: { ...data.metadata, grams: e.target.value } })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Purity</Label>
                        <Select
                            value={data.metadata.purity || '22K'}
                            onValueChange={(v) => setData({ ...data, metadata: { ...data.metadata, purity: v } })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24K">24K</SelectItem>
                                <SelectItem value="22K">22K</SelectItem>
                                <SelectItem value="18K">18K</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Purchase Value (₹)</Label>
                    <Input
                        type="number"
                        placeholder="100000"
                        value={data.purchase_value}
                        onChange={(e) => setData({ ...data, purchase_value: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Current Value (₹)</Label>
                    <Input
                        type="number"
                        placeholder="120000"
                        value={data.current_value}
                        onChange={(e) => setData({ ...data, current_value: e.target.value })}
                        required
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Add Asset'}
            </Button>
        </form>
    )
}

// Loan Given Form
function LoanGivenForm({ onSubmit, loading }) {
    const [data, setData] = useState({
        party_name: '',
        principal: '',
        interest_rate: '12',
        interest_type: 'SIMPLE',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...data, type: 'GIVEN' }) }} className="space-y-4">
            <div className="space-y-2">
                <Label>Borrower Name</Label>
                <Input
                    placeholder="e.g., Ravi, Suresh"
                    value={data.party_name}
                    onChange={(e) => setData({ ...data, party_name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                        type="number"
                        placeholder="100000"
                        value={data.principal}
                        onChange={(e) => setData({ ...data, principal: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Interest Rate (%)</Label>
                    <Input
                        type="number"
                        step="0.1"
                        placeholder="20"
                        value={data.interest_rate}
                        onChange={(e) => setData({ ...data, interest_rate: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        value={data.start_date}
                        onChange={(e) => setData({ ...data, start_date: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                        type="date"
                        value={data.end_date}
                        onChange={(e) => setData({ ...data, end_date: e.target.value })}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Add Loan'}
            </Button>
        </form>
    )
}

// Loan Taken Form
function LoanTakenForm({ onSubmit, loading }) {
    const [data, setData] = useState({
        party_name: '',
        principal: '',
        interest_rate: '10',
        interest_type: 'COMPOUND',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...data, type: 'TAKEN' }) }} className="space-y-4">
            <div className="space-y-2">
                <Label>Lender / Bank</Label>
                <Input
                    placeholder="e.g., HDFC Bank, Personal Loan"
                    value={data.party_name}
                    onChange={(e) => setData({ ...data, party_name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Loan Amount (₹)</Label>
                    <Input
                        type="number"
                        placeholder="500000"
                        value={data.principal}
                        onChange={(e) => setData({ ...data, principal: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Interest Rate (%)</Label>
                    <Input
                        type="number"
                        step="0.1"
                        placeholder="10.5"
                        value={data.interest_rate}
                        onChange={(e) => setData({ ...data, interest_rate: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        value={data.start_date}
                        onChange={(e) => setData({ ...data, start_date: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                        type="date"
                        value={data.end_date}
                        onChange={(e) => setData({ ...data, end_date: e.target.value })}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Add Loan'}
            </Button>
        </form>
    )
}

// Finance Scheme Form
function FinanceForm({ onSubmit, loading }) {
    const [data, setData] = useState({
        name: '',
        principal: '',
        interest_rate: '18',
        payment_cycle: 'MONTHLY',
        risk_level: 'MEDIUM',
        start_date: new Date().toISOString().split('T')[0],
        notes: ''
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(data) }} className="space-y-4">
            <div className="space-y-2">
                <Label>Scheme / Person Name</Label>
                <Input
                    placeholder="e.g., Ravi Finance, Gold Scheme"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                        type="number"
                        placeholder="200000"
                        value={data.principal}
                        onChange={(e) => setData({ ...data, principal: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Interest Rate (%/year)</Label>
                    <Input
                        type="number"
                        step="0.1"
                        placeholder="18"
                        value={data.interest_rate}
                        onChange={(e) => setData({ ...data, interest_rate: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Payout Cycle</Label>
                    <Select value={data.payment_cycle} onValueChange={(v) => setData({ ...data, payment_cycle: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Select value={data.risk_level} onValueChange={(v) => setData({ ...data, risk_level: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Add Scheme'}
            </Button>
        </form>
    )
}

// Success State
function SuccessState({ type, onAddAnother, onGoHome }) {
    const config = entryTypes.find(t => t.id === type) || entryTypes[0]
    const Icon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
            >
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Added Successfully!</h2>
            <p className="text-muted-foreground mb-8">Your {config.label.toLowerCase()} has been saved.</p>

            <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={onAddAnother}>Add Another</Button>
                <Button onClick={onGoHome}>Go to Dashboard</Button>
            </div>
        </motion.div>
    )
}

export default function AddPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialType = searchParams.get('type') || null

    const [selectedType, setSelectedType] = useState(initialType)
    const [step, setStep] = useState(initialType ? 'form' : 'select')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleTypeSelect = (type) => {
        setSelectedType(type)
        setStep('form')
    }

    const handleBack = () => {
        if (step === 'form') {
            setStep('select')
            setSelectedType(null)
        } else {
            router.back()
        }
    }

    const handleSubmit = async (data) => {
        setLoading(true)
        try {
            if (selectedType === 'asset') {
                await createAsset({
                    ...data,
                    current_value: Number(data.current_value) || 0,
                    purchase_value: Number(data.purchase_value) || 0,
                    metadata: data.type === 'GOLD' ? {
                        grams: Number(data.metadata?.grams) || 0,
                        purity: data.metadata?.purity || '22K'
                    } : {}
                })
            } else if (selectedType === 'loan-given' || selectedType === 'loan-taken') {
                await createLoan({
                    ...data,
                    principal: Number(data.principal) || 0,
                    interest_rate: Number(data.interest_rate) || 0,
                    status: 'ACTIVE'
                })
            } else if (selectedType === 'finance') {
                await createFinanceScheme({
                    ...data,
                    principal: Number(data.principal) || 0,
                    interest_rate: Number(data.interest_rate) || 0,
                    status: 'ACTIVE'
                })
            }
            setSuccess(true)
        } catch (error) {
            console.error('Error saving:', error)
            alert('Failed to save. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleAddAnother = () => {
        setSuccess(false)
        setStep('select')
        setSelectedType(null)
    }

    const handleGoHome = () => {
        router.push('/')
    }

    const selectedConfig = entryTypes.find(t => t.id === selectedType)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto"
        >
            {/* Header */}
            {!success && (
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">
                            {step === 'select' ? 'Add New Entry' : `Add ${selectedConfig?.label}`}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {step === 'select' ? 'Choose what to track' : 'Fill in the details'}
                        </p>
                    </div>
                </div>
            )}

            {/* Content */}
            <Card className="glass-card border-0">
                <CardContent className="p-6">
                    {success ? (
                        <SuccessState
                            type={selectedType}
                            onAddAnother={handleAddAnother}
                            onGoHome={handleGoHome}
                        />
                    ) : step === 'select' ? (
                        <TypeSelection onSelect={handleTypeSelect} selectedType={selectedType} />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {selectedType === 'asset' && <AssetForm onSubmit={handleSubmit} loading={loading} />}
                            {selectedType === 'loan-given' && <LoanGivenForm onSubmit={handleSubmit} loading={loading} />}
                            {selectedType === 'loan-taken' && <LoanTakenForm onSubmit={handleSubmit} loading={loading} />}
                            {selectedType === 'finance' && <FinanceForm onSubmit={handleSubmit} loading={loading} />}
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
