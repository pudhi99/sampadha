'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Book,
    ChevronDown,
    ChevronRight,
    Wallet,
    HandCoins,
    CreditCard,
    TrendingUp,
    Settings,
    Bell,
    Search,
    Home,
    Coins,
    PieChart,
    Download,
    Upload,
    Camera,
    Clock,
    Sparkles,
    CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// All features organized by category
const featureCategories = [
    {
        id: 'assets',
        title: 'Asset Management',
        icon: Wallet,
        color: 'text-emerald-500 bg-emerald-500/10',
        features: [
            {
                name: 'Cash & Bank Tracking',
                description: 'Track all your bank accounts, FDs, and cash holdings',
                route: '/assets',
                status: 'active'
            },
            {
                name: 'Gold Investment',
                description: 'Track gold with weight, purity, and live price updates',
                route: '/assets',
                status: 'active'
            },
            {
                name: 'Investments',
                description: 'Stocks, mutual funds, crypto and other investments',
                route: '/assets',
                status: 'active'
            },
            {
                name: 'Physical Assets',
                description: 'Property, vehicles, electronics with photos and categories',
                route: '/assets',
                status: 'new'
            },
            {
                name: 'Liability Tracking',
                description: 'Mark items as liabilities to deduct from net worth',
                route: '/assets',
                status: 'new'
            },
            {
                name: 'Image Upload',
                description: 'Add photos to physical assets with drag & drop',
                route: '/assets',
                status: 'new'
            }
        ]
    },
    {
        id: 'loans',
        title: 'Loan Management',
        icon: HandCoins,
        color: 'text-amber-500 bg-amber-500/10',
        features: [
            {
                name: 'Loans Given',
                description: 'Track money lent to others with interest',
                route: '/loans/given',
                status: 'active'
            },
            {
                name: 'Loans Taken',
                description: 'Track your borrowed money and EMIs',
                route: '/loans/taken',
                status: 'active'
            },
            {
                name: 'Payment Tracking',
                description: 'Record payments and auto-calculate remaining',
                route: '/loans/given',
                status: 'active'
            },
            {
                name: 'Interest Calculation',
                description: 'Simple & compound interest auto-calculation',
                route: '/loans/given',
                status: 'active'
            },
            {
                name: 'Status Tracking',
                description: 'Active, Delayed, and Closed loan statuses',
                route: '/loans/given',
                status: 'active'
            }
        ]
    },
    {
        id: 'finance',
        title: 'Finance Schemes',
        icon: TrendingUp,
        color: 'text-violet-500 bg-violet-500/10',
        features: [
            {
                name: 'Chit Fund Tracking',
                description: 'Track monthly chit contributions and returns',
                route: '/finance',
                status: 'active'
            },
            {
                name: 'RD & SIP',
                description: 'Recurring deposits and systematic investments',
                route: '/finance',
                status: 'active'
            },
            {
                name: 'Fixed Deposits',
                description: 'FD tracking with maturity dates',
                route: '/finance',
                status: 'active'
            },
            {
                name: 'Returns Calculator',
                description: 'Auto-calculate expected returns and maturity',
                route: '/finance',
                status: 'active'
            }
        ]
    },
    {
        id: 'prices',
        title: 'Price Tracking',
        icon: Coins,
        color: 'text-yellow-500 bg-yellow-500/10',
        features: [
            {
                name: 'Gold Prices',
                description: 'Live gold price per gram in INR',
                route: '/prices',
                status: 'new'
            },
            {
                name: 'Silver Prices',
                description: 'Live silver price tracking',
                route: '/prices',
                status: 'new'
            },
            {
                name: 'Copper Prices',
                description: 'Copper price monitoring',
                route: '/prices',
                status: 'new'
            },
            {
                name: 'Historical Comparison',
                description: 'Compare day, month, year price changes',
                route: '/prices',
                status: 'new'
            },
            {
                name: 'Daily Notifications',
                description: 'Get price alerts at 8 AM and 9 AM',
                route: '/prices',
                status: 'new'
            }
        ]
    },
    {
        id: 'reports',
        title: 'Reports & Analytics',
        icon: PieChart,
        color: 'text-blue-500 bg-blue-500/10',
        features: [
            {
                name: 'Net Worth Chart',
                description: 'Visual graph of your wealth over time',
                route: '/reports',
                status: 'active'
            },
            {
                name: 'Asset Allocation',
                description: 'Pie chart showing asset distribution',
                route: '/reports',
                status: 'active'
            },
            {
                name: 'Loan Overview',
                description: 'Summary of given vs taken loans',
                route: '/reports',
                status: 'active'
            },
            {
                name: 'Date Range Filter',
                description: 'View 7, 30, 90, or 365 day trends',
                route: '/reports',
                status: 'new'
            },
            {
                name: 'Snapshot Capture',
                description: 'Save current net worth for history',
                route: '/reports',
                status: 'new'
            }
        ]
    },
    {
        id: 'tools',
        title: 'Tools & Settings',
        icon: Settings,
        color: 'text-gray-500 bg-gray-500/10',
        features: [
            {
                name: 'Global Search',
                description: 'Press ⌘K to search everything instantly',
                route: '/',
                status: 'new'
            },
            {
                name: 'Data Export',
                description: 'Export all data as JSON or CSV',
                route: '/settings',
                status: 'active'
            },
            {
                name: 'Data Import',
                description: 'Restore from JSON backup',
                route: '/settings',
                status: 'active'
            },
            {
                name: 'Notifications',
                description: 'Bell icon shows unread alerts',
                route: '/',
                status: 'new'
            },
            {
                name: 'Dark Theme',
                description: 'Beautiful dark mode interface',
                route: '/',
                status: 'active'
            },
            {
                name: 'Mobile Responsive',
                description: 'Works on all devices',
                route: '/',
                status: 'active'
            }
        ]
    }
]

// Collapsible category component
function FeatureCategory({ category }) {
    const [isOpen, setIsOpen] = useState(true)
    const Icon = category.icon

    return (
        <Card className="border-0 overflow-hidden">
            <CardHeader
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {category.features.length} features
                            </p>
                        </div>
                    </div>
                    {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
            </CardHeader>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {category.features.map((feature, idx) => (
                                    <Link
                                        key={idx}
                                        href={feature.route}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium group-hover:text-primary transition-colors">
                                                    {feature.name}
                                                </p>
                                                {feature.status === 'new' && (
                                                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary">
                                                        NEW
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}

// Quick start guide
function QuickStartGuide() {
    const steps = [
        { icon: Wallet, title: 'Add Assets', desc: 'Start by adding your bank balances and investments' },
        { icon: Coins, title: 'Track Gold', desc: 'Add gold with weight & purity for auto-valuation' },
        { icon: HandCoins, title: 'Record Loans', desc: 'Track money given or taken with interest' },
        { icon: TrendingUp, title: 'Add Schemes', desc: 'Track chit funds, RDs, and other schemes' },
        { icon: PieChart, title: 'View Reports', desc: 'Check your net worth and analytics' },
        { icon: Bell, title: 'Get Alerts', desc: 'Enable notifications for price updates' }
    ]

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Quick Start Guide
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {steps.map((step, idx) => {
                        const StepIcon = step.icon
                        return (
                            <div key={idx} className="text-center p-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                    <StepIcon className="w-6 h-6 text-primary" />
                                </div>
                                <p className="font-medium text-sm">{step.title}</p>
                                <p className="text-xs text-muted-foreground">{step.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

// Keyboard shortcuts
function KeyboardShortcuts() {
    const shortcuts = [
        { key: '⌘K', desc: 'Global search' },
        { key: 'ESC', desc: 'Close dialogs' }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="w-4 h-4" />
                    Keyboard Shortcuts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    {shortcuts.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <kbd className="px-2 py-1 text-xs rounded bg-muted border">
                                {s.key}
                            </kbd>
                            <span className="text-sm text-muted-foreground">{s.desc}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default function GuidePage() {
    const totalFeatures = featureCategories.reduce((sum, cat) => sum + cat.features.length, 0)
    const newFeatures = featureCategories.reduce(
        (sum, cat) => sum + cat.features.filter(f => f.status === 'new').length, 0
    )

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Book className="w-7 h-7 text-primary" />
                        Features Guide
                    </h1>
                    <p className="text-muted-foreground">
                        Everything you can do with Sampadha
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold gradient-text">{totalFeatures}</p>
                    <p className="text-xs text-muted-foreground">
                        features ({newFeatures} new)
                    </p>
                </div>
            </div>

            {/* Quick Start */}
            <QuickStartGuide />

            {/* Shortcuts */}
            <KeyboardShortcuts />

            {/* Feature Categories */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">All Features</h2>
                {featureCategories.map((category) => (
                    <FeatureCategory key={category.id} category={category} />
                ))}
            </div>

            {/* Version Info */}
            <Card className="border-0 bg-muted/30">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                    <p>Sampadha v1.0 • Built with Next.js + Supabase</p>
                    <p className="text-xs mt-1">All 6 development phases complete ✓</p>
                </CardContent>
            </Card>
        </motion.div>
    )
}
