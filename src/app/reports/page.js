'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    Download,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Coins,
    HandCoins,
    CreditCard,
    Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
    LineChart,
    Line
} from 'recharts'
import { getAssets, getLoans, getFinanceSchemes } from '@/lib/db'
import { formatCurrency, calculateAccruedInterest, calculateSchemeReturns } from '@/lib/calculations'
import { getNetWorthHistory, getNetWorthTrend, captureNetWorthSnapshot } from '@/lib/netWorthHistory'
import { useAuth } from '@/context/AuthContext'
import { demoAssets, demoLoans, demoFinanceSchemes, demoNetWorthHistory, getDemoTotals } from '@/lib/demoData'


// Color palette for charts
const COLORS = {
    primary: '#10b981',
    assets: '#22c55e',
    liabilities: '#ef4444',
    gold: '#eab308',
    cash: '#3b82f6',
    investment: '#8b5cf6',
    loansGiven: '#f59e0b',
    loansTaken: '#ef4444',
    finance: '#a855f7'
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#eab308', '#8b5cf6', '#f59e0b', '#ef4444']

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 backdrop-blur border border-border rounded-lg p-3 shadow-xl">
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

// Net Worth Trend Chart
function NetWorthTrendChart({ data }) {
    return (
        <Card className="glass-card border-0">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Net Worth Trend
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                                dataKey="month"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                name="Net Worth"
                                stroke={COLORS.primary}
                                strokeWidth={2}
                                fill="url(#netWorthGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

// Asset Allocation Pie Chart
function AssetAllocationChart({ data }) {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className="glass-card border-0">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-blue-500" />
                    Asset Allocation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="ml-auto font-medium">{((item.value / total) * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Monthly Summary Bar Chart
function MonthlySummaryChart({ data }) {
    return (
        <Card className="glass-card border-0">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-violet-500" />
                    Monthly Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                                dataKey="month"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill={COLORS.assets} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" fill={COLORS.liabilities} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

// Stat Card Component
function StatCard({ title, value, change, changeType, icon: Icon, color }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="glass-card border-0">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">{title}</p>
                            <p className="text-2xl font-bold mt-1">{value}</p>
                            {change && (
                                <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'up' ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    {changeType === 'up' ? (
                                        <ArrowUpRight className="w-4 h-4" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4" />
                                    )}
                                    <span>{change}</span>
                                </div>
                            )}
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Loan Status Overview
function LoanStatusOverview({ loansGiven, loansTaken }) {
    const givenStats = {
        active: loansGiven.filter(l => l.status === 'ACTIVE').length,
        delayed: loansGiven.filter(l => l.status === 'DELAYED').length,
        closed: loansGiven.filter(l => l.status === 'CLOSED').length,
        totalPrincipal: loansGiven.reduce((sum, l) => sum + (Number(l.principal) || 0), 0)
    }

    const takenStats = {
        active: loansTaken.filter(l => l.status === 'ACTIVE').length,
        closed: loansTaken.filter(l => l.status === 'CLOSED').length,
        totalPrincipal: loansTaken.reduce((sum, l) => sum + (Number(l.principal) || 0), 0)
    }

    return (
        <Card className="glass-card border-0">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    Loan Status Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-6">
                    {/* Loans Given */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <HandCoins className="w-5 h-5 text-amber-500" />
                            <h4 className="font-semibold">Given</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Principal</span>
                                <span className="font-medium">{formatCurrency(givenStats.totalPrincipal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-500">Active</span>
                                <span>{givenStats.active}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-amber-500">Delayed</span>
                                <span>{givenStats.delayed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Closed</span>
                                <span>{givenStats.closed}</span>
                            </div>
                        </div>
                    </div>

                    {/* Loans Taken */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-red-500" />
                            <h4 className="font-semibold">Taken</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Principal</span>
                                <span className="font-medium">{formatCurrency(takenStats.totalPrincipal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-500">Active</span>
                                <span>{takenStats.active}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Closed</span>
                                <span>{takenStats.closed}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ReportsPage() {
    const { isDemo } = useAuth()
    const [loading, setLoading] = useState(true)
    const [assets, setAssets] = useState([])
    const [loansGiven, setLoansGiven] = useState([])
    const [loansTaken, setLoansTaken] = useState([])
    const [schemes, setSchemes] = useState([])
    const [netWorthHistory, setNetWorthHistory] = useState([])
    const [trend, setTrend] = useState({ changePercent: 0 })
    const [dateRange, setDateRange] = useState('30') // days
    const [capturingSnapshot, setCapturingSnapshot] = useState(false)

    useEffect(() => {
        loadData()
    }, [dateRange, isDemo])

    const loadData = async () => {
        setLoading(true)
        try {
            if (isDemo) {
                // Use demo data
                setAssets(demoAssets)
                setLoansGiven(demoLoans.filter(l => l.type === 'GIVEN'))
                setLoansTaken(demoLoans.filter(l => l.type === 'TAKEN'))
                setSchemes(demoFinanceSchemes)
                setNetWorthHistory(demoNetWorthHistory)

                // Calculate demo trend
                const current = demoNetWorthHistory[demoNetWorthHistory.length - 1]?.net_worth || 0
                const previous = demoNetWorthHistory[0]?.net_worth || 0
                const change = current - previous
                const changePercent = previous !== 0 ? ((change / previous) * 100) : 0
                setTrend({ current, previous, change, changePercent: parseFloat(changePercent.toFixed(2)) })
            } else {
                const [assetsData, loansData, schemesData, historyData, trendData] = await Promise.all([
                    getAssets(),
                    getLoans(),
                    getFinanceSchemes(),
                    getNetWorthHistory(parseInt(dateRange)),
                    getNetWorthTrend(parseInt(dateRange))
                ])

                setAssets(assetsData || [])
                setLoansGiven((loansData || []).filter(l => l.type === 'GIVEN'))
                setLoansTaken((loansData || []).filter(l => l.type === 'TAKEN'))
                setSchemes(schemesData || [])
                setNetWorthHistory(historyData || [])
                setTrend(trendData || { changePercent: 0 })
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCaptureSnapshot = async () => {
        setCapturingSnapshot(true)
        try {
            await captureNetWorthSnapshot()
            await loadData()
        } catch (error) {
            console.error('Error capturing snapshot:', error)
        } finally {
            setCapturingSnapshot(false)
        }
    }

    // Calculate totals
    const totalAssets = assets.reduce((sum, a) => sum + (Number(a.current_value) || 0), 0)
    const totalLoansGiven = loansGiven.reduce((sum, l) => sum + (Number(l.principal) || 0), 0)
    const totalLoansTaken = loansTaken.reduce((sum, l) => sum + (Number(l.principal) || 0), 0)
    const totalFinance = schemes.reduce((sum, s) => sum + (Number(s.principal) || 0), 0)
    const netWorth = totalAssets + totalLoansGiven + totalFinance - totalLoansTaken

    // Calculate expected monthly income
    const monthlyInterestIncome = schemes.reduce((sum, s) => {
        const returns = calculateSchemeReturns(s)
        return sum + returns.monthlyReturn
    }, 0) + loansGiven.reduce((sum, l) => {
        return sum + ((Number(l.principal) * Number(l.interest_rate)) / 100 / 12)
    }, 0)

    // Prepare chart data
    const assetAllocationData = [
        { name: 'Cash', value: assets.filter(a => a.type === 'CASH').reduce((sum, a) => sum + Number(a.current_value), 0) },
        { name: 'Gold', value: assets.filter(a => a.type === 'GOLD').reduce((sum, a) => sum + Number(a.current_value), 0) },
        { name: 'Investment', value: assets.filter(a => a.type === 'INVESTMENT').reduce((sum, a) => sum + Number(a.current_value), 0) },
        { name: 'Loans Given', value: totalLoansGiven },
        { name: 'Finance', value: totalFinance },
    ].filter(item => item.value > 0)

    // Net worth trend data from database
    const netWorthTrendData = netWorthHistory.length > 0
        ? netWorthHistory.map(h => ({
            month: new Date(h.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            value: Number(h.net_worth),
            assets: Number(h.total_assets),
            liabilities: Number(h.total_liabilities)
        }))
        : [
            { month: 'Current', value: netWorth, assets: totalAssets + totalLoansGiven + totalFinance, liabilities: totalLoansTaken }
        ]

    // Mock monthly summary (future: track actual income/expense)
    const monthlySummaryData = [
        { month: 'Aug', income: 45000, expense: 35000 },
        { month: 'Sep', income: 52000, expense: 38000 },
        { month: 'Oct', income: 48000, expense: 40000 },
        { month: 'Nov', income: 55000, expense: 42000 },
        { month: 'Dec', income: 60000, expense: 45000 },
        { month: 'Jan', income: monthlyInterestIncome, expense: 0 },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-muted-foreground">Financial analytics & insights</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[130px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Date range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={handleCaptureSnapshot}
                        disabled={capturingSnapshot}
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {capturingSnapshot ? 'Saving...' : 'Capture'}
                    </Button>
                    <Button variant="outline" onClick={loadData}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Net Worth"
                    value={formatCurrency(netWorth)}
                    change={trend.changePercent !== 0 ? `${trend.changePercent > 0 ? '+' : ''}${trend.changePercent.toFixed(1)}% (${dateRange}d)` : undefined}
                    changeType={trend.changePercent >= 0 ? 'up' : 'down'}
                    icon={Wallet}
                    color="bg-emerald-500/20 text-emerald-500"
                />
                <StatCard
                    title="Total Assets"
                    value={formatCurrency(totalAssets)}
                    icon={Coins}
                    color="bg-blue-500/20 text-blue-500"
                />
                <StatCard
                    title="Expected Income"
                    value={formatCurrency(monthlyInterestIncome)}
                    change="per month"
                    changeType="up"
                    icon={TrendingUp}
                    color="bg-amber-500/20 text-amber-500"
                />
                <StatCard
                    title="Liabilities"
                    value={formatCurrency(totalLoansTaken)}
                    icon={CreditCard}
                    color="bg-red-500/20 text-red-500"
                />
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="glass-card">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                    <TabsTrigger value="loans">Loans</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <NetWorthTrendChart data={netWorthTrendData} />
                        <AssetAllocationChart data={assetAllocationData} />
                    </div>
                    <MonthlySummaryChart data={monthlySummaryData} />
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                    <AssetAllocationChart data={assetAllocationData} />

                    {/* Asset Breakdown Table */}
                    <Card className="glass-card border-0">
                        <CardHeader>
                            <CardTitle className="text-lg">Asset Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {assets.map((asset, index) => (
                                    <motion.div
                                        key={asset.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${asset.type === 'GOLD' ? 'bg-yellow-500/20' :
                                                asset.type === 'CASH' ? 'bg-blue-500/20' : 'bg-violet-500/20'
                                                }`}>
                                                {asset.type === 'GOLD' ? <Coins className="w-5 h-5 text-yellow-500" /> :
                                                    asset.type === 'CASH' ? <Wallet className="w-5 h-5 text-blue-500" /> :
                                                        <TrendingUp className="w-5 h-5 text-violet-500" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{asset.name}</p>
                                                <p className="text-sm text-muted-foreground capitalize">{asset.type.toLowerCase()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(asset.current_value)}</p>
                                            {asset.purchase_value && (
                                                <p className={`text-sm ${Number(asset.current_value) >= Number(asset.purchase_value)
                                                    ? 'text-emerald-500' : 'text-red-500'
                                                    }`}>
                                                    {Number(asset.current_value) >= Number(asset.purchase_value) ? '+' : ''}
                                                    {formatCurrency(Number(asset.current_value) - Number(asset.purchase_value))}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="loans" className="space-y-4">
                    <LoanStatusOverview loansGiven={loansGiven} loansTaken={loansTaken} />

                    {/* Loans List */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Loans Given */}
                        <Card className="glass-card border-0">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <HandCoins className="w-5 h-5 text-amber-500" />
                                    Loans Given
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {loansGiven.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">No loans given</p>
                                    ) : loansGiven.map((loan) => (
                                        <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                                            <div>
                                                <p className="font-medium">{loan.party_name}</p>
                                                <p className="text-sm text-muted-foreground">{loan.interest_rate}% p.a.</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(loan.principal)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${loan.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' :
                                                    loan.status === 'DELAYED' ? 'bg-amber-500/20 text-amber-500' :
                                                        'bg-gray-500/20 text-gray-500'
                                                    }`}>
                                                    {loan.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loans Taken */}
                        <Card className="glass-card border-0">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-red-500" />
                                    Loans Taken
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {loansTaken.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">No loans taken</p>
                                    ) : loansTaken.map((loan) => (
                                        <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                                            <div>
                                                <p className="font-medium">{loan.party_name}</p>
                                                <p className="text-sm text-muted-foreground">{loan.interest_rate}% p.a.</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(loan.principal)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${loan.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' :
                                                    'bg-gray-500/20 text-gray-500'
                                                    }`}>
                                                    {loan.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    )
}
