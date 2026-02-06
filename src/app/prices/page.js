'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Clock,
    RefreshCw,
    AlertCircle,
    Database,
    TrendingUp,
    TrendingDown,
    Fuel,
    Coins,
    DollarSign,
    BarChart3,
    Droplets,
    LineChart as LineChartIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { saveTodaysPrices, getPriceHistory } from '@/lib/priceTracking'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'

// GoodReturns Widget API
const WIDGET_API = 'https://www.goodreturns.in/dynamic_html_includes/web/widget/v2_home_page_top_widget.html'

// Parse HTML widget to extract all pricess
function parseWidgetHTML(html) {
    const data = {
        sensex: null,
        nifty: null,
        gold: null,
        silver: null,
        petrol: null,
        diesel: null,
        crudeOil: null,
        usd: null
    }

    try {

        // Sensex pattern
        const sensexMatch = html.match(/Sensex\s*<span[^>]*class="stock-price"[^>]*>([\d,\.]+)<\/span>[\s\S]*?<span[^>]*class="(gain|loss)"[^>]*>([+-]?[\d\.]+%)<\/span>/i)
        if (sensexMatch) {
            data.sensex = {
                value: parseFloat(sensexMatch[1].replace(/,/g, '')),
                change: sensexMatch[3],
                isGain: sensexMatch[2] === 'gain'
            }
        }

        // Nifty pattern
        const niftyMatch = html.match(/Nifty\s*<span[^>]*class="stock-price"[^>]*>([\d,\.]+)<\/span>[\s\S]*?<span[^>]*class="(gain|loss)"[^>]*>([+-]?[\d\.]+%)<\/span>/i)
        if (niftyMatch) {
            data.nifty = {
                value: parseFloat(niftyMatch[1].replace(/,/g, '')),
                change: niftyMatch[3],
                isGain: niftyMatch[2] === 'gain'
            }
        }

        // 22k Gold pattern: 22k Gold <span class="stock-price">₹ 14,110 /gm</span>
        // Also try: &#8377; which is ₹
        const goldMatch = html.match(/22k\s*Gold\s*<span[^>]*class="stock-price"[^>]*>(?:&#8377;|₹)?\s*([\d,]+)\s*\/gm<\/span>/i)
        if (goldMatch) {
            const price22k = parseInt(goldMatch[1].replace(/,/g, ''))
            const price24k = Math.round(price22k * 24 / 22)
            const price18k = Math.round(price22k * 18 / 22)
            data.gold = {
                '24K': { pricePerGram: price24k, pricePer10g: price24k * 10, pricePer8g: price24k * 8 },
                '22K': { pricePerGram: price22k, pricePer10g: price22k * 10, pricePer8g: price22k * 8 },
                '18K': { pricePerGram: price18k, pricePer10g: price18k * 10, pricePer8g: price18k * 8 },
                pricePerGram: price24k,
                source: 'goodreturns.in'
            }
        }

        // Silver pattern: Silver <span class="stock-price">₹ 2,80,000/kg</span>
        const silverMatch = html.match(/Silver\s*<span[^>]*class="stock-price"[^>]*>(?:&#8377;|₹)?\s*([\d,]+)\/kg<\/span>/i)
        if (silverMatch) {
            const pricePerKg = parseInt(silverMatch[1].replace(/,/g, ''))
            const pricePerGram = Math.round(pricePerKg / 1000)
            data.silver = {
                pricePerGram: pricePerGram,
                pricePer10g: pricePerGram * 10,
                pricePer100g: pricePerGram * 100,
                pricePer1kg: pricePerKg,
                source: 'goodreturns.in'
            }
        }

        // Petrol pattern
        const petrolMatch = html.match(/Petrol\s*<span[^>]*class="stock-price"[^>]*>(?:&#8377;|₹)?\s*([\d\.]+)<\/span>/i)
        if (petrolMatch) {
            data.petrol = parseFloat(petrolMatch[1])
        }

        // Diesel pattern
        const dieselMatch = html.match(/Diesel\s*<span[^>]*class="stock-price"[^>]*>(?:&#8377;|₹)?\s*([\d\.]+)<\/span>/i)
        if (dieselMatch) {
            data.diesel = parseFloat(dieselMatch[1])
        }

        // Crude Oil pattern
        const crudeMatch = html.match(/Crude\s*Oil\s*<span[^>]*class="stock-price"[^>]*>\$([\d\.]+)<\/span>/i)
        if (crudeMatch) {
            data.crudeOil = parseFloat(crudeMatch[1])
        }

        // USD pattern
        const usdMatch = html.match(/USD\s*<span[^>]*class="stock-price"[^>]*>(?:&#8377;|₹)?\s*([\d\.]+)<\/span>/i)
        if (usdMatch) {
            data.usd = parseFloat(usdMatch[1])
        }

    } catch (e) {
        console.error('[Parser] Error:', e)
    }

    return data
}

// Market Index Card
function IndexCard({ title, icon: Icon, data, color, loading }) {
    if (loading) {
        return (
            <Card className={`overflow-hidden border-0 ${color}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-white/80" />
                        <span className="text-white/80 font-medium text-sm">{title}</span>
                    </div>
                    <div className="h-8 w-24 rounded bg-white/20 animate-pulse" />
                </CardContent>
            </Card>
        )
    }

    if (!data) return null

    const ChangeIcon = data.isGain ? TrendingUp : TrendingDown

    return (
        <Card className={`overflow-hidden border-0 ${color}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-white/80" />
                        <span className="text-white/80 font-medium text-sm">{title}</span>
                    </div>
                    <Badge className={`${data.isGain ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'} border-0 text-xs`}>
                        <ChangeIcon className="w-3 h-3 mr-1" />
                        {data.change}
                    </Badge>
                </div>
                <div className="text-2xl font-bold text-white">
                    {data.value?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
            </CardContent>
        </Card>
    )
}

// Fuel Price Card
function FuelCard({ title, icon: Icon, price, unit, color, loading }) {
    return (
        <Card className={`overflow-hidden border-0 ${color}`}>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-white/80" />
                    <span className="text-white/80 font-medium text-sm">{title}</span>
                </div>
                {loading ? (
                    <div className="h-8 w-20 rounded bg-white/20 animate-pulse" />
                ) : price !== null && price !== undefined ? (
                    <div className="text-2xl font-bold text-white">
                        {unit === '$' ? '$' : '₹'}{price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        {unit && unit !== '$' && <span className="text-sm font-normal text-white/60 ml-1">{unit}</span>}
                    </div>
                ) : (
                    <div className="text-white/60 text-sm">--</div>
                )}
            </CardContent>
        </Card>
    )
}

// Karat Price Row
function KaratPriceRow({ karat, price, description, highlight }) {
    if (!price || !price.pricePerGram) return null
    return (
        <div className={`flex items-center justify-between py-3 border-b last:border-0 ${highlight ? 'bg-amber-500/5 -mx-4 px-4' : ''}`}>
            <div>
                <span className={`font-semibold ${highlight ? 'text-amber-500' : 'text-amber-600'}`}>{karat}</span>
                <span className="text-xs text-muted-foreground ml-2">{description}</span>
            </div>
            <div className="text-right">
                <div className="font-bold text-lg">₹{price.pricePerGram?.toLocaleString('en-IN')}<span className="text-sm font-normal text-muted-foreground">/g</span></div>
                <div className="text-xs text-muted-foreground">
                    8g: ₹{price.pricePer8g?.toLocaleString('en-IN')} • 10g: ₹{price.pricePer10g?.toLocaleString('en-IN')}
                </div>
            </div>
        </div>
    )
}

// Price History Chart Component
function PriceHistoryChart({ goldHistory, silverHistory, loading }) {
    if (loading) {
        return (
            <Card className="border-0 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5" />
                        Price History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 rounded bg-muted/50 animate-pulse" />
                </CardContent>
            </Card>
        )
    }

    // Transform data for chart
    const chartData = []
    const allDates = new Set()

    goldHistory.forEach(g => allDates.add(g.date))
    silverHistory.forEach(s => allDates.add(s.date))

    Array.from(allDates).sort().forEach(date => {
        const goldRecord = goldHistory.find(g => g.date === date)
        const silverRecord = silverHistory.find(s => s.date === date)
        chartData.push({
            date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            gold24k: goldRecord?.price_24k_per_gram || null,
            gold22k: goldRecord?.price_22k_per_gram || null,
            silver: silverRecord?.price_24k_per_gram || null // Silver uses this field
        })
    })

    if (chartData.length === 0) {
        return (
            <Card className="border-0 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5" />
                        Price History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No historical data yet.</p>
                        <p className="text-sm">Click "Store Today" daily to build your price history.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 bg-card/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5" />
                        Price History (Last 30 Days)
                    </CardTitle>
                    <Badge variant="outline">{chartData.length} days</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Gold Chart */}
                    <div>
                        <h4 className="text-sm font-medium text-amber-500 mb-2 flex items-center gap-2">
                            <span className="text-lg">🥇</span> Gold Prices (₹/gram)
                        </h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888"
                                        tick={{ fontSize: 10 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        stroke="#888"
                                        tick={{ fontSize: 10 }}
                                        domain={['auto', 'auto']}
                                        tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        formatter={(value) => [`₹${value?.toLocaleString('en-IN')}`, '']}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="gold24k"
                                        name="24K"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', r: 3 }}
                                        activeDot={{ r: 5 }}
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="gold22k"
                                        name="22K"
                                        stroke="#d97706"
                                        strokeWidth={2}
                                        dot={{ fill: '#d97706', r: 3 }}
                                        activeDot={{ r: 5 }}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Silver Chart */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <span className="text-lg">🥈</span> Silver Price (₹/gram)
                        </h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888"
                                        tick={{ fontSize: 10 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        stroke="#888"
                                        tick={{ fontSize: 10 }}
                                        domain={['auto', 'auto']}
                                        tickFormatter={(v) => `₹${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        formatter={(value) => [`₹${value?.toLocaleString('en-IN')}`, 'Silver']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="silver"
                                        name="Silver"
                                        stroke="#9ca3af"
                                        strokeWidth={2}
                                        dot={{ fill: '#9ca3af', r: 3 }}
                                        activeDot={{ r: 5 }}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function PriceTrackerPage() {
    const [widgetData, setWidgetData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [goldHistory, setGoldHistory] = useState([])
    const [silverHistory, setSilverHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(true)

    // Fetch directly from GoodReturns (client-side)
    const fetchPrices = async () => {
        setLoading(true)
        setError(null)

        try {
            const timestamp = Date.now()
            const url = `${WIDGET_API}?q=${timestamp}`

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`GoodReturns returned ${response.status}`)
            }

            const html = await response.text()

            const data = parseWidgetHTML(html)
            setWidgetData(data)
            setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))

            if (!data.gold && !data.silver) {
                setError('Could not parse prices. Please try again.')
            }

        } catch (err) {
            console.error('[Prices Page] Fetch error:', err)
            setError(`Technical Issue: ${err.message}`)
            setWidgetData(null)
        }

        setLoading(false)
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchPrices()
        setRefreshing(false)
    }

    const handleStorePrices = async () => {
        if (!widgetData?.gold && !widgetData?.silver) {
            alert('No prices to store.')
            return
        }

        setRefreshing(true)
        try {
            const result = await saveTodaysPrices({
                gold: widgetData.gold,
                silver: widgetData.silver
            })
            if (result.success) {
                alert('✅ Prices stored successfully!')
                fetchPriceHistory() // Refresh chart
            } else {
                alert(`Failed: ${result.errors?.join(', ') || result.error}`)
            }
        } catch (err) {
            alert(`Error: ${err.message}`)
        }
        setRefreshing(false)
    }

    // Fetch price history
    const fetchPriceHistory = async () => {
        setHistoryLoading(true)
        try {
            const [goldData, silverData] = await Promise.all([
                getPriceHistory('GOLD', 30),
                getPriceHistory('SILVER', 30)
            ])
            setGoldHistory(goldData)
            setSilverHistory(silverData)
        } catch (err) {
            console.error('Error fetching price history:', err)
        }
        setHistoryLoading(false)
    }

    useEffect(() => {
        fetchPrices()
        fetchPriceHistory()
    }, [])

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Market Dashboard</h1>
                    <p className="text-muted-foreground">Live rates from GoodReturns.in</p>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lastUpdated}
                        </span>
                    )}
                    <Button variant="outline" onClick={handleStorePrices} disabled={refreshing || !widgetData?.gold}>
                        <Database className="w-4 h-4 mr-2" />Store Today
                    </Button>
                    <Button onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />Refresh
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Card className="border-red-500/30 bg-red-500/5">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-red-600">Technical Issue</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                                {rawHtml && (
                                    <details className="mt-2">
                                        <summary className="text-xs cursor-pointer text-blue-500">View Raw HTML Response</summary>
                                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                                            {rawHtml}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Market Indices */}
            <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Market Indices
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <IndexCard title="Sensex" icon={TrendingUp} data={widgetData?.sensex} color="bg-gradient-to-br from-blue-600 to-blue-800" loading={loading} />
                    <IndexCard title="Nifty 50" icon={TrendingUp} data={widgetData?.nifty} color="bg-gradient-to-br from-purple-600 to-purple-800" loading={loading} />
                    <FuelCard title="USD/INR" icon={DollarSign} price={widgetData?.usd} color="bg-gradient-to-br from-emerald-600 to-emerald-800" loading={loading} />
                    <FuelCard title="Crude Oil" icon={Droplets} price={widgetData?.crudeOil} unit="$" color="bg-gradient-to-br from-slate-600 to-slate-800" loading={loading} />
                </div>
            </div>

            {/* Fuel Prices */}
            <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-orange-500" />
                    Fuel Prices (Mumbai)
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <FuelCard title="Petrol" icon={Fuel} price={widgetData?.petrol} unit="/L" color="bg-gradient-to-br from-orange-500 to-red-600" loading={loading} />
                    <FuelCard title="Diesel" icon={Fuel} price={widgetData?.diesel} unit="/L" color="bg-gradient-to-br from-yellow-600 to-amber-700" loading={loading} />
                </div>
            </div>

            {/* Precious Metals */}
            <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    Precious Metals
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Gold Card */}
                    <Card className="overflow-hidden border-0 bg-card/50">
                        <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">🥇</span>
                                    <div>
                                        <CardTitle className="text-white">Gold Rates</CardTitle>
                                        <p className="text-sm text-white/80">Mumbai • Today</p>
                                    </div>
                                </div>
                                {!loading && widgetData?.gold && (
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">₹{widgetData.gold.pricePerGram?.toLocaleString('en-IN')}</div>
                                        <div className="text-sm text-white/80">per gram (24K)</div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {loading ? (
                                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded bg-muted/50 animate-pulse" />)}</div>
                            ) : widgetData?.gold ? (
                                <div className="divide-y">
                                    <KaratPriceRow karat="24K" price={widgetData.gold['24K']} description="Pure Gold (99.9%)" highlight />
                                    <KaratPriceRow karat="22K" price={widgetData.gold['22K']} description="Jewellery Gold (91.7%)" />
                                    <KaratPriceRow karat="18K" price={widgetData.gold['18K']} description="Fashion Gold (75%)" />
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No data available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Silver Card */}
                    <Card className="overflow-hidden border-0 bg-card/50">
                        <CardHeader className="bg-gradient-to-r from-gray-400 to-gray-600 text-white pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">🥈</span>
                                    <div>
                                        <CardTitle className="text-white">Silver Rate</CardTitle>
                                        <p className="text-sm text-white/80">Mumbai • Today</p>
                                    </div>
                                </div>
                                {!loading && widgetData?.silver && (
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">₹{widgetData.silver.pricePerGram?.toLocaleString('en-IN')}</div>
                                        <div className="text-sm text-white/80">per gram</div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {loading ? (
                                <div className="h-24 rounded bg-muted/50 animate-pulse" />
                            ) : widgetData?.silver ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 border">
                                            <div className="text-xs text-muted-foreground mb-1">10 grams</div>
                                            <div className="font-bold text-lg">₹{widgetData.silver.pricePer10g?.toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 border">
                                            <div className="text-xs text-muted-foreground mb-1">100 grams</div>
                                            <div className="font-bold text-lg">₹{widgetData.silver.pricePer100g?.toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 border">
                                        <div className="text-xs text-muted-foreground mb-1">1 Kilogram</div>
                                        <div className="font-bold text-xl">₹{widgetData.silver.pricePer1kg?.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Price History Chart */}
            <PriceHistoryChart
                goldHistory={goldHistory}
                silverHistory={silverHistory}
                loading={historyLoading}
            />



            {/* Info Footer */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Live data from GoodReturns.in</span> — Click "Store Today" to save gold & silver prices.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
