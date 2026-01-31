/**
 * Metals Price Tracking System
 * Tracks gold, silver, and copper prices with historical data
 */

import { supabase } from './supabase'

// Realistic fallback prices (Indian market)
const FALLBACK_PRICES = {
    gold: { pricePerGram: 7250, pricePer10g: 72500 },
    silver: { pricePerGram: 92, pricePer10g: 920 },
    copper: { pricePerGram: 0.85, pricePer10g: 8.5 }
}

/**
 * Fetch current prices for all metals
 * Uses API route with fallback
 * @returns {Promise<Object>} { gold, silver, copper }
 */
export async function fetchAllMetalsPrices() {
    try {
        // Try our own API route first (handles fallback internally)
        const response = await fetch('/api/prices')

        if (response.ok) {
            const data = await response.json()
            if (data.success && data.prices) {
                return data.prices
            }
        }

        // Direct fallback if API route fails
        return {
            gold: { ...FALLBACK_PRICES.gold, timestamp: new Date().toISOString() },
            silver: { ...FALLBACK_PRICES.silver, timestamp: new Date().toISOString() },
            copper: { ...FALLBACK_PRICES.copper, timestamp: new Date().toISOString() }
        }
    } catch (error) {
        console.error('Error fetching metals prices:', error)
        // Return fallback prices
        return {
            gold: { ...FALLBACK_PRICES.gold, timestamp: new Date().toISOString() },
            silver: { ...FALLBACK_PRICES.silver, timestamp: new Date().toISOString() },
            copper: { ...FALLBACK_PRICES.copper, timestamp: new Date().toISOString() }
        }
    }
}

/**
 * Save price snapshot to database
 * @param {string} metal - 'GOLD', 'SILVER', or 'COPPER'
 * @param {number} pricePerGram - Price per gram
 * @param {number} pricePer10g - Price per 10 grams
 * @returns {Promise<Object>} Saved record
 */
export async function savePriceSnapshot(metal, pricePerGram, pricePer10g) {
    try {
        const today = new Date().toISOString().split('T')[0]

        // Check if snapshot exists for today
        const { data: existing } = await supabase
            .from('metals_price_history')
            .select('*')
            .eq('metal', metal)
            .eq('date', today)
            .single()

        const snapshot = {
            metal,
            date: today,
            price_per_gram: pricePerGram,
            price_per_10g: pricePer10g,
            currency: 'INR'
        }

        if (existing) {
            // Update existing
            const { data, error } = await supabase
                .from('metals_price_history')
                .update(snapshot)
                .eq('metal', metal)
                .eq('date', today)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            // Insert new
            const { data, error } = await supabase
                .from('metals_price_history')
                .insert([snapshot])
                .select()
                .single()

            if (error) throw error
            return data
        }
    } catch (error) {
        console.error(`Error saving ${metal} price:`, error)
        return null
    }
}

/**
 * Get price history for a metal
 * @param {string} metal - 'GOLD', 'SILVER', 'COPPER'
 * @param {number} days - Number of days to retrieve
 * @returns {Promise<Array>} Price history
 */
export async function getPriceHistory(metal, days = 30) {
    try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const startDateStr = startDate.toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('metals_price_history')
            .select('*')
            .eq('metal', metal)
            .gte('date', startDateStr)
            .order('date', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error(`Error fetching ${metal} price history:`, error)
        return []
    }
}

/**
 * Calculate price change comparison
 * @param {string} metal - Metal type
 * @param {string} period - 'day', 'month', 'year'
 * @returns {Promise<Object>} { current, previous, change, changePercent }
 */
export async function getPriceChange(metal, period = 'day') {
    try {
        const daysMap = {
            day: 1,
            month: 30,
            year: 365
        }
        const days = daysMap[period] || 1

        const history = await getPriceHistory(metal, days + 1)

        if (history.length < 2) {
            // Get current price for display
            const currentPrice = await getLatestPrice(metal)
            return {
                current: currentPrice?.pricePerGram || FALLBACK_PRICES[metal.toLowerCase()]?.pricePerGram || 0,
                previous: 0,
                change: 0,
                changePercent: 0
            }
        }

        const current = Number(history[history.length - 1]?.price_per_gram || 0)
        const previous = Number(history[0]?.price_per_gram || 0)
        const change = current - previous
        const changePercent = previous !== 0 ? ((change / previous) * 100) : 0

        return {
            current,
            previous,
            change,
            changePercent: parseFloat(changePercent.toFixed(2)),
            period
        }
    } catch (error) {
        console.error(`Error calculating ${metal} price change:`, error)
        return {
            current: 0,
            previous: 0,
            change: 0,
            changePercent: 0
        }
    }
}

/**
 * Capture daily price snapshots for all metals
 * @returns {Promise<Object>} Results
 */
export async function captureDailyPrices() {
    try {
        const prices = await fetchAllMetalsPrices()
        const results = {
            gold: null,
            silver: null,
            copper: null
        }

        if (prices.gold) {
            results.gold = await savePriceSnapshot('GOLD', prices.gold.pricePerGram, prices.gold.pricePer10g)
        }
        if (prices.silver) {
            results.silver = await savePriceSnapshot('SILVER', prices.silver.pricePerGram, prices.silver.pricePer10g)
        }
        if (prices.copper) {
            results.copper = await savePriceSnapshot('COPPER', prices.copper.pricePerGram, prices.copper.pricePer10g)
        }

        return results
    } catch (error) {
        console.error('Error capturing daily prices:', error)
        return null
    }
}

/**
 * Get latest price for a metal (from history or live)
 * @param {string} metal - Metal type
 * @returns {Promise<Object>} Latest price data
 */
export async function getLatestPrice(metal) {
    try {
        const { data, error } = await supabase
            .from('metals_price_history')
            .select('*')
            .eq('metal', metal)
            .order('date', { ascending: false })
            .limit(1)
            .single()

        if (error || !data) {
            // Fetch live price if no history
            const prices = await fetchAllMetalsPrices()
            const metalLower = metal.toLowerCase()
            return prices[metalLower] || FALLBACK_PRICES[metalLower] || null
        }

        return {
            pricePerGram: Number(data.price_per_gram),
            pricePer10g: Number(data.price_per_10g),
            date: data.date
        }
    } catch (error) {
        console.error(`Error getting latest ${metal} price:`, error)
        // Return fallback
        const metalLower = metal.toLowerCase()
        return FALLBACK_PRICES[metalLower] || null
    }
}
