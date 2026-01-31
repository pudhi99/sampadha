'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Wallet, HandCoins, CreditCard, TrendingUp, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { getAssets, getLoans, getFinanceSchemes } from '@/lib/db'

const typeIcons = {
    ASSET: Wallet,
    LOAN_GIVEN: HandCoins,
    LOAN_TAKEN: CreditCard,
    FINANCE: TrendingUp,
    PHYSICAL: Building2
}

const typeColors = {
    ASSET: 'text-emerald-500 bg-emerald-500/10',
    LOAN_GIVEN: 'text-amber-500 bg-amber-500/10',
    LOAN_TAKEN: 'text-red-500 bg-red-500/10',
    FINANCE: 'text-violet-500 bg-violet-500/10',
    PHYSICAL: 'text-blue-500 bg-blue-500/10'
}

const typeRoutes = {
    ASSET: '/assets',
    LOAN_GIVEN: '/loans/given',
    LOAN_TAKEN: '/loans/taken',
    FINANCE: '/finance',
    PHYSICAL: '/assets'
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [allData, setAllData] = useState([])
    const router = useRouter()

    // Load all data on mount
    useEffect(() => {
        async function loadData() {
            try {
                const [assets, loans, schemes] = await Promise.all([
                    getAssets(),
                    getLoans(),
                    getFinanceSchemes()
                ])

                const combined = [
                    ...(assets || []).map(a => ({
                        id: a.id,
                        name: a.name,
                        type: a.type === 'PHYSICAL' ? 'PHYSICAL' : 'ASSET',
                        subtype: a.type,
                        value: a.current_value,
                        route: '/assets'
                    })),
                    ...(loans || []).filter(l => l.type === 'GIVEN').map(l => ({
                        id: l.id,
                        name: l.party_name,
                        type: 'LOAN_GIVEN',
                        subtype: 'GIVEN',
                        value: l.principal,
                        route: '/loans/given'
                    })),
                    ...(loans || []).filter(l => l.type === 'TAKEN').map(l => ({
                        id: l.id,
                        name: l.party_name,
                        type: 'LOAN_TAKEN',
                        subtype: 'TAKEN',
                        value: l.principal,
                        route: '/loans/taken'
                    })),
                    ...(schemes || []).map(s => ({
                        id: s.id,
                        name: s.name,
                        type: 'FINANCE',
                        subtype: s.scheme_type,
                        value: s.principal,
                        route: '/finance'
                    }))
                ]

                setAllData(combined)
            } catch (error) {
                console.error('Error loading search data:', error)
            }
        }
        loadData()
    }, [])

    // Search function
    const searchData = useCallback((searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }

        setLoading(true)
        const lowerQuery = searchQuery.toLowerCase()

        const filtered = allData.filter(item =>
            item.name?.toLowerCase().includes(lowerQuery) ||
            item.subtype?.toLowerCase().includes(lowerQuery)
        ).slice(0, 8)

        setResults(filtered)
        setLoading(false)
    }, [allData])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            searchData(query)
        }, 200)
        return () => clearTimeout(timer)
    }, [query, searchData])

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setOpen(prev => !prev)
            }
            if (e.key === 'Escape') {
                setOpen(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleSelect = (result) => {
        router.push(result.route)
        setOpen(false)
        setQuery('')
    }

    const formatCurrency = (amount) => {
        const num = Number(amount) || 0
        if (num < 100000) return `₹${num.toLocaleString('en-IN')}`
        if (num < 10000000) return `₹${(num / 100000).toFixed(2)}L`
        return `₹${(num / 10000000).toFixed(2)}Cr`
    }

    return (
        <>
            {/* Trigger Button */}
            <Button
                variant="outline"
                className="w-full max-w-sm gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(true)}
            >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground ml-auto">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            {/* Search Modal */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                            onClick={() => setOpen(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg z-50"
                        >
                            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 p-4 border-b border-border">
                                    <Search className="w-5 h-5 text-muted-foreground" />
                                    <Input
                                        autoFocus
                                        placeholder="Search assets, loans, schemes..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="border-0 focus-visible:ring-0 text-lg"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setOpen(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Results */}
                                <div className="max-h-[300px] overflow-y-auto">
                                    {loading ? (
                                        <div className="p-4 text-center text-muted-foreground">
                                            Searching...
                                        </div>
                                    ) : results.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            {query ? 'No results found' : 'Start typing to search...'}
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            {results.map((result) => {
                                                const Icon = typeIcons[result.type]
                                                const colorClass = typeColors[result.type]

                                                return (
                                                    <motion.button
                                                        key={`${result.type}-${result.id}`}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                                                        onClick={() => handleSelect(result)}
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{result.name}</p>
                                                            <p className="text-sm text-muted-foreground capitalize">
                                                                {result.subtype?.toLowerCase().replace('_', ' ')}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">{formatCurrency(result.value)}</p>
                                                        </div>
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-2 border-t border-border text-xs text-muted-foreground flex justify-between">
                                    <span>Press ESC to close</span>
                                    <span>⌘K to toggle</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
