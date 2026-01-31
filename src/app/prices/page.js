'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    Coins,
    Clock,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getLatestPrice, getPriceChange, captureDailyPrices } from '@/lib/priceTracking'

const metals = [
    { id: 'GOLD', name: 'Gold', color: 'from-amber-500 to-yellow-600', icon: '🥇' },
    { id: 'SILVER', name: 'Silver', color: 'from-gray-400 to-gray-600', icon: '🥈' }
]

function PriceCard({ metal, price, loading }) {
    const [changes, setChanges] = useState({ day: null, month: null, year: null })
    const [loadingChanges, setLoadingChanges] = useState(true)

    useEffect(() => {
        async function fetchChanges() {
            setLoadingChanges(true)
            const [day, month, year] = await Promise.all([
                getPriceChange(metal.id, 'day'),
                getPriceChange(metal.id, 'month'),
                getPriceChange(metal.id, 'year')
            ])
            setChanges({ day, month, year })
            setLoadingChanges(false)
        }
        fetchChanges()
    }, [metal.id])

    const renderChangeChip = (change, period) => {
        if (!change || loadingChanges) {
            return <div className="h-14 w-full rounded bg-muted/50 animate-pulse" />
        }

        const isUp = change.change > 0
        const Icon = isUp ? ArrowUpRight : ArrowDownRight
        const colorClass = isUp ? 'text-emerald-500' : 'text-red-500'
        const bgClass = isUp ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'

        return (
            <div className={`p-3 rounded-lg border ${bgClass} space-y-1`}>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">{period}</span>
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                </div>
                <div className={`text-sm font-semibold ${colorClass}`}>
                    {isUp ? '+' : ''}{change.changePercent}%
                </div>
                <div className="text-xs text-muted-foreground">
                    {isUp ? '+' : ''}₹{change.change.toFixed(2)}/g
                </div>
            </div>
        )
    }

    return (
        <Card className="overflow-hidden border-0 bg-card/50">
            <CardHeader className={`bg-gradient-to-r ${metal.color} text-white pb-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{metal.icon}</span>
                        <div>
                            <CardTitle className="text-white">{metal.name}</CardTitle>
                            <p className="text-xs text-white/80">Per Gram</p>
                        </div>
                    </div>
                    <div className="text-right">
                        {loading ? (
                            <div className="h-8 w-24 rounded bg-white/20 animate-pulse" />
                        ) : (
                            <div className="text-2xl font-bold">₹{price?.pricePerGram?.toFixed(2)}</div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-3">Price Changes</div>
                <div className="grid grid-cols-3 gap-2">
                    {renderChangeChip(changes.day, 'day')}
                    {renderChangeChip(changes.month, 'month')}
                    {renderChangeChip(changes.year, 'year')}
                </div>
            </CardContent>
        </Card>
    )
}

export default function PriceTrackerPage() {
    const [prices, setPrices] = useState({ GOLD: null, SILVER: null, COPPER: null })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchPrices = async () => {
        setLoading(true)
        const priceData = {}
        for (const metal of metals) {
            const price = await getLatestPrice(metal.id)
            priceData[metal.id] = price
        }
        setPrices(priceData)
        setLoading(false)
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await captureDailyPrices()
        await fetchPrices()
        setRefreshing(false)
    }

    useEffect(() => {
        fetchPrices()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Price Tracker</h1>
                    <p className="text-muted-foreground">Track gold, silver, and copper prices</p>
                </div>
                <Button onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? 'Refreshing...' : 'Refresh Prices'}
                </Button>
            </div>

            {/* Price Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {metals.map((metal) => (
                    <PriceCard
                        key={metal.id}
                        metal={metal}
                        price={prices[metal.id]}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Info Card */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">Daily Price Updates</p>
                            <p className="text-sm text-muted-foreground">
                                Prices are automatically captured daily. You'll receive notifications at 8 AM and 9 AM
                                with price changes and trends.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
