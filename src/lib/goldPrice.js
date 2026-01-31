/**
 * Gold Price API Service
 * Fetches current gold prices in INR per gram
 */

const GOLD_API_URL = 'https://api.metals.live/v1/spot/gold'

/**
 * Fetch current gold price in USD per ounce, then convert to INR per gram
 * @param {number} usdToInrRate - Current USD to INR exchange rate (default: 83)
 * @returns {Promise<Object>} { pricePerGram, pricePerTenGram, timestamp }
 */
export async function fetchGoldPrice(usdToInrRate = 83) {
    try {
        const response = await fetch(GOLD_API_URL, {
            headers: {
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch gold price')
        }

        const data = await response.json()

        // Gold price is in USD per ounce
        const pricePerOunce = data.price || data[0]?.price || 2000 // Fallback to ~2000

        // Convert ounce to grams (1 ounce = 31.1035 grams)
        const pricePerGramUSD = pricePerOunce / 31.1035

        // Convert to INR
        const pricePerGram = Math.round(pricePerGramUSD * usdToInrRate)
        const pricePerTenGram = Math.round(pricePerGram * 10)

        return {
            pricePerGram,
            pricePerTenGram,
            pricePerOunce,
            timestamp: new Date().toISOString(),
            source: 'metals.live'
        }
    } catch (error) {
        console.error('Error fetching gold price:', error)

        // Return fallback prices if API fails
        const fallbackPricePerGram = 6500 // Approximate INR per gram
        return {
            pricePerGram: fallbackPricePerGram,
            pricePerTenGram: fallbackPricePerGram * 10,
            pricePerOunce: 2000,
            timestamp: new Date().toISOString(),
            source: 'fallback',
            error: error.message
        }
    }
}

/**
 * Calculate gold value based on weight and current price
 * @param {number} grams - Weight in grams
 * @param {number} purity - Purity percentage (e.g., 22 for 22K, 24 for 24K)
 * @param {number} pricePerGram - Current price per gram of pure gold
 * @returns {number} Total value
 */
export function calculateGoldValue(grams, purity = 24, pricePerGram) {
    const purityFactor = purity / 24
    return Math.round(grams * pricePerGram * purityFactor)
}

/**
 * Get cached gold price from localStorage (to reduce API calls)
 * @param {number} maxAgeMinutes - Maximum age of cached price in minutes
 * @returns {Object|null} Cached price or null if expired
 */
export function getCachedGoldPrice(maxAgeMinutes = 60) {
    try {
        const cached = localStorage.getItem('gold_price_cache')
        if (!cached) return null

        const data = JSON.parse(cached)
        const age = Date.now() - new Date(data.timestamp).getTime()
        const maxAge = maxAgeMinutes * 60 * 1000

        if (age > maxAge) {
            return null // Cache expired
        }

        return data
    } catch (error) {
        console.error('Error reading cached gold price:', error)
        return null
    }
}

/**
 * Save gold price to localStorage cache
 * @param {Object} priceData - Gold price data to cache
 */
export function cacheGoldPrice(priceData) {
    try {
        localStorage.setItem('gold_price_cache', JSON.stringify(priceData))
    } catch (error) {
        console.error('Error caching gold price:', error)
    }
}

/**
 * Get current gold price with caching
 * @param {number} usdToInrRate - USD to INR exchange rate
 * @param {boolean} forceRefresh - Force fetch from API even if cached
 * @returns {Promise<Object>} Gold price data
 */
export async function getCurrentGoldPrice(usdToInrRate = 83, forceRefresh = false) {
    if (!forceRefresh) {
        const cached = getCachedGoldPrice(60) // Cache for 1 hour
        if (cached) {
            return cached
        }
    }

    const priceData = await fetchGoldPrice(usdToInrRate)
    cacheGoldPrice(priceData)
    return priceData
}
