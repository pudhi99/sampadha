/**
 * Metals Price Tracking System
 * Uses GoodReturns.in for accurate Indian gold/silver prices
 * Stores only today's prices in database via cron
 */

import { supabase } from './supabase'

// GoodReturns Widget API URL
const WIDGET_API = 'https://www.goodreturns.in/dynamic_html_includes/web/widget/v2_home_page_top_widget.html'

/**
 * Parse GoodReturns widget HTML to extract prices
 */
function parseWidgetHTML(html) {
    const data = { gold: null, silver: null }

    try {
        // Gold pattern: 22k Gold <span class="stock-price">₹ 14,110/gm</span>
        const goldMatch = html.match(/22k\s*Gold\s*<span[^>]*class="stock-price"[^>]*>(?:&#8377;|₹)?\s*([\d,]+)\s*\/gm<\/span>/i)
        if (goldMatch) {
            const price22k = parseInt(goldMatch[1].replace(/,/g, ''))
            const price24k = Math.round(price22k * 24 / 22)
            const price18k = Math.round(price22k * 18 / 22)
            data.gold = {
                pricePerGram: price24k,
                '24K': { pricePerGram: price24k, pricePer8g: price24k * 8, pricePer10g: price24k * 10 },
                '22K': { pricePerGram: price22k, pricePer8g: price22k * 8, pricePer10g: price22k * 10 },
                '18K': { pricePerGram: price18k, pricePer8g: price18k * 8, pricePer10g: price18k * 10 },
                source: 'goodreturns.in'
            }
        }

        // Silver pattern: Silver <span class="stock-price">₹ 2,80,000/kg</span>
        const silverMatch = html.match(/Silver\s*<span[^>]*class="stock-price"[^>]*>(?:&#8377;|₹)?\s*([\d,]+)\/kg<\/span>/i)
        if (silverMatch) {
            const pricePerKg = parseInt(silverMatch[1].replace(/,/g, ''))
            const pricePerGram = Math.round(pricePerKg / 1000)
            data.silver = {
                pricePerGram,
                pricePer10g: pricePerGram * 10,
                pricePer100g: pricePerGram * 100,
                pricePer1kg: pricePerKg,
                source: 'goodreturns.in'
            }
        }
    } catch (e) {
        console.error('[PriceTracking] Parse error:', e)
    }

    return data
}

/**
 * Fetch current prices directly from GoodReturns widget
 * This works both client-side and server-side (cron jobs)
 * @returns {Promise<Object>} { gold, silver } with price data
 */
export async function fetchAllMetalsPrices() {
    try {
        const timestamp = Date.now()
        const response = await fetch(`${WIDGET_API}?q=${timestamp}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-IN,en;q=0.9'
            }
        })

        if (!response.ok) {
            throw new Error(`GoodReturns returned ${response.status}`)
        }

        const html = await response.text()
        const data = parseWidgetHTML(html)

        if (!data.gold && !data.silver) {
            return {
                error: 'Could not parse prices from GoodReturns',
                gold: null,
                silver: null
            }
        }

        return {
            gold: data.gold,
            silver: data.silver,
            timestamp: new Date().toISOString(),
            source: 'goodreturns.in'
        }
    } catch (error) {
        console.error('Error fetching metals prices:', error)
        return {
            error: `Technical Issue: ${error.message}`,
            gold: null,
            silver: null
        }
    }
}

/**
 * Save today's price snapshot to database
 * Only stores today's data, not historical
 * @param {Object} prices - Price data from API
 * @returns {Promise<Object>} Save result
 */
export async function saveTodaysPrices(prices) {
    try {
        const today = new Date().toISOString().split('T')[0]
        const results = { gold: null, silver: null, errors: [] }

        // Save Gold prices (24K, 22K, 18K)
        if (prices.gold && prices.gold.pricePerGram) {
            const goldRecord = {
                date: today,
                metal: 'GOLD',
                price_24k_per_gram: prices.gold['24K']?.pricePerGram || prices.gold.pricePerGram,
                price_22k_per_gram: prices.gold['22K']?.pricePerGram || null,
                price_18k_per_gram: prices.gold['18K']?.pricePerGram || null,
                spot_price_per_gram: null, // Not available from GoodReturns
                spot_price_per_ounce: null,
                indian_premium: null,
                currency: 'INR',
                source: prices.gold.source || 'goodreturns.in'
            }

            const { data: goldData, error: goldError } = await supabase
                .from('metals_price_history')
                .upsert(goldRecord, { onConflict: 'date,metal' })
                .select()
                .single()

            if (goldError) {
                console.error('Error saving gold price:', goldError)
                results.errors.push(`Gold: ${goldError.message}`)
            } else {
                results.gold = goldData
                console.log('[PriceTracking] Gold price saved:', goldRecord.price_24k_per_gram)
            }
        }

        // Save Silver price
        if (prices.silver && prices.silver.pricePerGram) {
            const silverRecord = {
                date: today,
                metal: 'SILVER',
                price_24k_per_gram: prices.silver.pricePerGram,
                price_22k_per_gram: null,
                price_18k_per_gram: null,
                spot_price_per_gram: null,
                spot_price_per_ounce: null,
                indian_premium: null,
                currency: 'INR',
                source: prices.silver.source || 'goodreturns.in'
            }

            const { data: silverData, error: silverError } = await supabase
                .from('metals_price_history')
                .upsert(silverRecord, { onConflict: 'date,metal' })
                .select()
                .single()

            if (silverError) {
                console.error('Error saving silver price:', silverError)
                results.errors.push(`Silver: ${silverError.message}`)
            } else {
                results.silver = silverData
                console.log('[PriceTracking] Silver price saved:', silverRecord.price_24k_per_gram)
            }
        }

        return {
            success: results.errors.length === 0,
            saved: {
                gold: !!results.gold,
                silver: !!results.silver
            },
            errors: results.errors
        }
    } catch (error) {
        console.error('Error saving price snapshot:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get latest price for a metal
 * @param {string} metal - 'GOLD' or 'SILVER'
 * @returns {Promise<Object>} Price data
 */
export async function getLatestPrice(metal) {
    try {
        const prices = await fetchAllMetalsPrices()

        if (prices.error) {
            return { error: prices.error }
        }

        const metalLower = metal.toLowerCase()
        const priceData = prices[metalLower]

        if (!priceData) {
            return { error: `No price data available for ${metal}` }
        }

        return {
            ...priceData,
            timestamp: prices.timestamp
        }
    } catch (error) {
        console.error(`Error getting latest ${metal} price:`, error)
        return { error: `Technical Issue: ${error.message}` }
    }
}

/**
 * Get price history from database
 * @param {string} metal - 'GOLD' or 'SILVER'
 * @param {number} days - Number of days (default: 7)
 * @returns {Promise<Array>} Price history
 */
export async function getPriceHistory(metal, days = 7) {
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

        if (error) {
            if (error.code === 'PGRST205') {
                console.warn('metals_price_history table not found')
                return []
            }
            throw error
        }

        return data || []
    } catch (error) {
        console.error(`Error fetching ${metal} price history:`, error)
        return []
    }
}

/**
 * Get today's stored price from database
 * @param {string} metal - 'GOLD' or 'SILVER'
 * @returns {Promise<Object|null>} Today's price or null
 */
export async function getTodaysPrice(metal) {
    try {
        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('metals_price_history')
            .select('*')
            .eq('metal', metal)
            .eq('date', today)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // No record for today
            }
            if (error.code === 'PGRST205') {
                return null // Table doesn't exist
            }
            throw error
        }

        return data
    } catch (error) {
        console.error(`Error getting today's ${metal} price:`, error)
        return null
    }
}

/**
 * Get latest stored price in structured format (for notifications)
 * @param {string} metal - 'GOLD' or 'SILVER'
 * @returns {Promise<Object|null>} Structured price data or null
 */
export async function getLatestStoredPrice(metal) {
    try {
        const record = await getTodaysPrice(metal)
        if (!record) return null

        if (metal === 'GOLD') {
            return {
                pricePerGram: record.price_24k_per_gram,
                '24K': { pricePerGram: record.price_24k_per_gram },
                '22K': { pricePerGram: record.price_22k_per_gram },
                '18K': { pricePerGram: record.price_18k_per_gram },
                date: record.date
            }
        } else if (metal === 'SILVER') {
            return {
                pricePerGram: record.price_24k_per_gram, // Silver uses this field
                date: record.date
            }
        }

        return null
    } catch (error) {
        console.error(`Error getting latest stored ${metal} price:`, error)
        return null
    }
}

/**
 * Calculate price change between two dates
 * @param {string} metal - 'GOLD' or 'SILVER'
 * @param {string} period - 'day', 'week', 'month'
 * @returns {Promise<Object>} Change data
 */
export async function getPriceChange(metal, period = 'day') {
    try {
        const daysMap = { day: 1, week: 7, month: 30 }
        const days = daysMap[period] || 1

        // Get current price from API
        const currentPrice = await getLatestPrice(metal)

        if (currentPrice.error) {
            return { error: currentPrice.error }
        }

        // Get historical price from database
        const history = await getPriceHistory(metal, days + 1)

        if (history.length === 0) {
            return {
                current: currentPrice.pricePerGram,
                previous: null,
                change: null,
                changePercent: null,
                period,
                note: 'No historical data available'
            }
        }

        const current = currentPrice.pricePerGram || currentPrice['24K']?.pricePerGram
        const previousRecord = history[0]
        const previous = Number(previousRecord?.price_24k_per_gram || 0)

        if (previous === 0) {
            return {
                current,
                previous: null,
                change: null,
                changePercent: null,
                period,
                note: 'Invalid previous price'
            }
        }

        const change = current - previous
        const changePercent = ((change / previous) * 100)

        return {
            current,
            previous,
            change,
            changePercent: parseFloat(changePercent.toFixed(2)),
            period
        }
    } catch (error) {
        console.error(`Error calculating ${metal} price change:`, error)
        return { error: `Technical Issue: ${error.message}` }
    }
}

/**
 * Capture and store today's prices via cron
 * Only fetches and stores if successful
 * @returns {Promise<Object>} Capture result
 */
export async function captureDailyPrices() {
    try {
        console.log('[PriceTracking] Starting daily price capture...')

        // Fetch current prices from GoodReturns
        const prices = await fetchAllMetalsPrices()

        if (prices.error) {
            console.error('[PriceTracking] API error, not storing:', prices.error)
            return {
                success: false,
                error: prices.error,
                stored: false
            }
        }

        // Validate we have actual price data
        if (!prices.gold?.pricePerGram && !prices.silver?.pricePerGram) {
            console.error('[PriceTracking] No valid prices received, not storing')
            return {
                success: false,
                error: 'No valid prices received from API',
                stored: false
            }
        }

        // Save to database
        const saveResult = await saveTodaysPrices(prices)

        console.log('[PriceTracking] Daily capture complete:', saveResult)

        return {
            success: saveResult.success,
            gold: prices.gold,
            silver: prices.silver,
            stored: saveResult.saved,
            errors: saveResult.errors
        }
    } catch (error) {
        console.error('[PriceTracking] Daily capture failed:', error)
        return {
            success: false,
            error: `Technical Issue: ${error.message}`,
            stored: false
        }
    }
}
