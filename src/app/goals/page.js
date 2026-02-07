'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Target,
    Plus,
    Edit2,
    Trash2,
    TrendingUp,
    PiggyBank,
    CreditCard,
    Shield,
    Sparkles,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    Pause
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getGoals, createGoal, updateGoal, deleteGoal, addGoalContribution } from '@/lib/db'

const GOAL_TYPES = {
    SAVINGS: { label: 'Savings', icon: PiggyBank, color: 'blue' },
    INVESTMENT: { label: 'Investment', icon: TrendingUp, color: 'green' },
    DEBT_PAYOFF: { label: 'Debt Payoff', icon: CreditCard, color: 'red' },
    EMERGENCY_FUND: { label: 'Emergency Fund', icon: Shield, color: 'purple' },
    CUSTOM: { label: 'Custom', icon: Target, color: 'orange' }
}

const PRIORITIES = {
    LOW: { label: 'Low', color: 'slate' },
    MEDIUM: { label: 'Medium', color: 'yellow' },
    HIGH: { label: 'High', color: 'red' }
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value || 0)
}

function GoalCard({ goal, onEdit, onDelete, onContribute }) {
    const typeConfig = GOAL_TYPES[goal.goal_type] || GOAL_TYPES.CUSTOM
    const Icon = typeConfig.icon
    const progress = goal.target_amount > 0
        ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
        : 0
    const remaining = Math.max(0, goal.target_amount - goal.current_amount)
    const isCompleted = goal.status === 'COMPLETED' || progress >= 100

    const daysRemaining = goal.target_date
        ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null

    return (
        <motion.div variants={itemVariants} layout>
            <Card className={`relative overflow-hidden border-0 floating-card ${isCompleted ? 'bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-emerald-600/20' :
                    `bg-gradient-to-br from-${typeConfig.color}-500/10 via-${typeConfig.color}-500/5 to-${typeConfig.color}-600/10`
                }`}>
                {/* Progress bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20">
                    <motion.div
                        className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>

                <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-emerald-500/20' : `bg-${typeConfig.color}-500/20`
                                }`}>
                                {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <Icon className={`w-5 h-5 text-${typeConfig.color}-500`} />
                                )}
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
                                <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(goal)}>
                                <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(goal.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Progress Stats */}
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-2xl font-bold">{formatCurrency(goal.current_amount)}</p>
                            <p className="text-xs text-muted-foreground">of {formatCurrency(goal.target_amount)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-semibold text-blue-500">{Math.round(progress)}%</p>
                            {!isCompleted && <p className="text-xs text-muted-foreground">{formatCurrency(remaining)} left</p>}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                        />
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            {goal.priority && (
                                <Badge variant="outline" className={`text-xs border-${PRIORITIES[goal.priority]?.color}-500/30`}>
                                    {PRIORITIES[goal.priority]?.label} Priority
                                </Badge>
                            )}
                            {daysRemaining !== null && daysRemaining > 0 && (
                                <Badge variant="outline" className="text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {daysRemaining} days left
                                </Badge>
                            )}
                            {daysRemaining !== null && daysRemaining <= 0 && !isCompleted && (
                                <Badge variant="destructive" className="text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Overdue
                                </Badge>
                            )}
                        </div>
                        {!isCompleted && (
                            <Button
                                size="sm"
                                className="h-7 gap-1 bg-blue-500 hover:bg-blue-600"
                                onClick={() => onContribute(goal)}
                            >
                                <Plus className="w-3 h-3" />
                                Add
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default function GoalsPage() {
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [contributeDialogOpen, setContributeDialogOpen] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        goal_type: 'SAVINGS',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        priority: 'MEDIUM',
        description: ''
    })
    const [contributionAmount, setContributionAmount] = useState('')

    useEffect(() => {
        fetchGoals()
    }, [])

    const fetchGoals = async () => {
        try {
            const data = await getGoals()
            setGoals(data || [])
        } catch (error) {
            console.error('Error fetching goals:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenAdd = () => {
        setSelectedGoal(null)
        setFormData({
            name: '',
            goal_type: 'SAVINGS',
            target_amount: '',
            current_amount: '0',
            target_date: '',
            priority: 'MEDIUM',
            description: ''
        })
        setDialogOpen(true)
    }

    const handleEdit = (goal) => {
        setSelectedGoal(goal)
        setFormData({
            name: goal.name,
            goal_type: goal.goal_type,
            target_amount: String(goal.target_amount),
            current_amount: String(goal.current_amount),
            target_date: goal.target_date || '',
            priority: goal.priority || 'MEDIUM',
            description: goal.description || ''
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                target_amount: Number(formData.target_amount) || 0,
                current_amount: Number(formData.current_amount) || 0,
                target_date: formData.target_date || null
            }

            if (selectedGoal) {
                await updateGoal(selectedGoal.id, payload)
            } else {
                await createGoal(payload)
            }

            setDialogOpen(false)
            fetchGoals()
        } catch (error) {
            console.error('Error saving goal:', error)
            alert('Failed to save goal: ' + error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this goal?')) return
        try {
            await deleteGoal(id)
            fetchGoals()
        } catch (error) {
            console.error('Error deleting goal:', error)
            alert('Failed to delete goal')
        }
    }

    const handleContribute = (goal) => {
        setSelectedGoal(goal)
        setContributionAmount('')
        setContributeDialogOpen(true)
    }

    const handleSaveContribution = async () => {
        try {
            await addGoalContribution({
                goal_id: selectedGoal.id,
                amount: Number(contributionAmount) || 0
            })
            setContributeDialogOpen(false)
            fetchGoals()
        } catch (error) {
            console.error('Error adding contribution:', error)
            alert('Failed to add contribution: ' + error.message)
        }
    }

    // Calculate summary stats
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'COMPLETED' || (g.current_amount >= g.target_amount)).length
    const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0)
    const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0)
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 pb-24">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Target className="w-6 h-6 text-blue-500" />
                            Financial Goals
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Track your savings and investment targets</p>
                    </div>
                    <Button onClick={handleOpenAdd} className="gap-2 bg-blue-500 hover:bg-blue-600">
                        <Plus className="w-4 h-4" />
                        Add Goal
                    </Button>
                </motion.div>

                {/* Summary Stats */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-blue-600/10">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{totalGoals}</p>
                                    <p className="text-xs text-muted-foreground">Total Goals</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-500">{completedGoals}</p>
                                    <p className="text-xs text-muted-foreground">Completed</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-500">{formatCurrency(totalSaved)}</p>
                                    <p className="text-xs text-muted-foreground">Total Saved</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                                    <p className="text-xs text-muted-foreground">Overall Progress</p>
                                </div>
                            </div>
                            <div className="mt-4 h-2 bg-muted/30 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallProgress}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Goals Grid */}
                {goals.length === 0 ? (
                    <motion.div variants={itemVariants} className="text-center py-12">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No goals yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first financial goal to get started</p>
                        <Button onClick={handleOpenAdd} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Goal
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {goals.map(goal => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onContribute={handleContribute}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

            {/* Add/Edit Goal Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                        <DialogDescription>Set a target and track your progress</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Goal Name</Label>
                            <Input
                                placeholder="e.g., Emergency Fund"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.goal_type}
                                    onValueChange={(v) => setFormData({ ...formData, goal_type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(GOAL_TYPES).map(([key, val]) => (
                                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(PRIORITIES).map(([key, val]) => (
                                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="100000"
                                    value={formData.target_amount}
                                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Current Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.current_amount}
                                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Target Date (Optional)</Label>
                            <Input
                                type="date"
                                value={formData.target_date}
                                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
                            {selectedGoal ? 'Update' : 'Create'} Goal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Contribution Dialog */}
            <Dialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Contribution</DialogTitle>
                        <DialogDescription>
                            {selectedGoal?.name} - {formatCurrency(selectedGoal?.current_amount)} / {formatCurrency(selectedGoal?.target_amount)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input
                                type="number"
                                placeholder="5000"
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setContributeDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveContribution} className="bg-emerald-500 hover:bg-emerald-600">
                            Add {contributionAmount ? formatCurrency(Number(contributionAmount)) : '₹0'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
