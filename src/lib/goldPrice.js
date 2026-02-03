/**
 * Metal Price Helper
 * 
 * Helper functions for gold and silver price calculations using stored database prices
 */

import { supabase } from './supabase'

/**
 * Get stored gold price for a specific date
 * @param {string} date - Date in YYYY-MM-DD format (defaults to today)
 * @returns {Promise<Object|null>} Gold price data or null
 */
export async function getStoredGoldPrice(date) {
    try {
        const targetDate = date || new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('metals_price_history')
            .select('*')
            .eq('metal', 'GOLD')
            .eq('date', targetDate)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            throw error
        }

        return {
            date: data.date,
            '24K': data.price_24k_per_gram,
            '22K': data.price_22k_per_gram,
            '18K': data.price_18k_per_gram,
            pricePerGram: data.price_24k_per_gram, // Default to 24K
            source: data.source
        }
    } catch (error) {
        console.error('Error fetching stored gold price:', error)
        return null
    }
}

/**
 * Get the latest stored gold price (most recent in database)
 * @returns {Promise<Object|null>} Latest gold price or null
 */
export async function getLatestStoredGoldPrice() {
    try {
        const { data, error } = await supabase
            .from('metals_price_history')
            .select('*')
            .eq('metal', 'GOLD')
            .order('date', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }

        return {
            date: data.date,
            '24K': data.price_24k_per_gram,
            '22K': data.price_22k_per_gram,
            '18K': data.price_18k_per_gram,
            pricePerGram: data.price_24k_per_gram, // Default to 24K
            source: data.source
        }
    } catch (error) {
        console.error('Error fetching latest stored gold price:', error)
        return null
    }
}

/**
 * Get current gold price for form "Today's Price" button
 * Uses stored database price
 * @returns {Promise<Object>} Price data with pricePerGram for each purity
 */
export async function getCurrentGoldPrice() {
    const storedPrice = await getLatestStoredGoldPrice()

    if (!storedPrice) {
        throw new Error('No gold prices stored. Store today\'s prices first.')
    }

    return storedPrice
}

/**
 * Get stored silver price for a specific date
 * @param {string} date - Date in YYYY-MM-DD format (defaults to today)
 * @returns {Promise<Object|null>} Silver price data or null
 */
export async function getStoredSilverPrice(date) {
    try {
        const targetDate = date || new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('metals_price_history')
            .select('*')
            .eq('metal', 'SILVER')
            .eq('date', targetDate)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            throw error
        }

        return {
            date: data.date,
            pricePerGram: data.price_24k_per_gram, // Silver uses price_24k_per_gram field
            pricePer10g: data.price_24k_per_gram * 10,
            pricePer100g: data.price_24k_per_gram * 100,
            pricePer1kg: data.price_24k_per_gram * 1000,
            source: data.source
        }
    } catch (error) {
        console.error('Error fetching stored silver price:', error)
        return null
    }
}

/**
 * Get the latest stored silver price (most recent in database)
 * @returns {Promise<Object|null>} Latest silver price or null
 */
export async function getLatestStoredSilverPrice() {
    try {
        const { data, error } = await supabase
            .from('metals_price_history')
            .select('*')
            .eq('metal', 'SILVER')
            .order('date', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }

        return {
            date: data.date,
            pricePerGram: data.price_24k_per_gram,
            pricePer10g: data.price_24k_per_gram * 10,
            pricePer100g: data.price_24k_per_gram * 100,
            pricePer1kg: data.price_24k_per_gram * 1000,
            source: data.source
        }
    } catch (error) {
        console.error('Error fetching latest stored silver price:', error)
        return null
    }
}

/**
 * Get current silver price for form "Today's Price" button
 * Uses stored database price
 * @returns {Promise<Object>} Price data
 */
export async function getCurrentSilverPrice() {
    const storedPrice = await getLatestStoredSilverPrice()

    if (!storedPrice) {
        throw new Error('No silver prices stored. Store today\'s prices first.')
    }

    return storedPrice
}

/**
 * Calculate gold value - simple formula
 * @param {number} grams - Weight in grams
 * @param {number} purityKarat - Purity (24, 22, or 18)
 * @param {number} ratePerGram - Rate per gram
 * @returns {number} Calculated value
 */
export function calculateGoldValue(grams, purityKarat = 22, ratePerGram = 0) {
    // Simple calculation: grams * rate
    return Math.round(grams * ratePerGram)
}

/**
 * Calculate gold asset value based on stored price
 * @param {number} grams - Weight in grams
 * @param {string} purity - '24K', '22K', or '18K'
 * @returns {Promise<Object>} { value, priceUsed, date }
 */
export async function calculateGoldAssetValue(grams, purity = '24K') {
    try {
        const storedPrice = await getLatestStoredGoldPrice()

        if (!storedPrice) {
            return {
                value: null,
                error: 'No stored price available',
                hint: 'Store today\'s prices first using the Price Tracker page'
            }
        }

        const pricePerGram = storedPrice[purity]

        if (!pricePerGram) {
            return {
                value: null,
                error: `No ${purity} price available for ${storedPrice.date}`
            }
        }

        const value = Math.round(grams * pricePerGram)

        return {
            value,
            priceUsed: pricePerGram,
            purity,
            grams,
            date: storedPrice.date,
            source: storedPrice.source
        }
    } catch (error) {
        console.error('Error calculating gold value:', error)
        return {
            value: null,
            error: error.message
        }
    }
}

/**
 * Calculate silver asset value based on stored price
 * @param {number} grams - Weight in grams
 * @returns {Promise<Object>} { value, priceUsed, date }
 */
export async function calculateSilverAssetValue(grams) {
    try {
        const storedPrice = await getLatestStoredSilverPrice()

        if (!storedPrice) {
            return {
                value: null,
                error: 'No stored price available',
                hint: 'Store today\'s prices first using the Price Tracker page'
            }
        }

        const value = Math.round(grams * storedPrice.pricePerGram)

        return {
            value,
            priceUsed: storedPrice.pricePerGram,
            grams,
            date: storedPrice.date,
            source: storedPrice.source
        }
    } catch (error) {
        console.error('Error calculating silver value:', error)
        return {
            value: null,
            error: error.message
        }
    }
}

/**
 * Calculate profit/loss for gold asset
 * @param {number} grams - Weight in grams
 * @param {string} purity - '24K', '22K', or '18K'
 * @param {number} purchasePrice - Original purchase price
 * @returns {Promise<Object>} { currentValue, purchaseValue, profit, profitPercent }
 */
export async function calculateGoldProfitLoss(grams, purity, purchasePrice) {
    try {
        const currentCalc = await calculateGoldAssetValue(grams, purity)

        if (currentCalc.error) {
            return currentCalc
        }

        const profit = currentCalc.value - purchasePrice
        const profitPercent = purchasePrice > 0
            ? ((profit / purchasePrice) * 100).toFixed(2)
            : 0

        return {
            currentValue: currentCalc.value,
            currentPricePerGram: currentCalc.priceUsed,
            purchaseValue: purchasePrice,
            profit,
            profitPercent: parseFloat(profitPercent),
            priceDate: currentCalc.date,
            grams,
            purity
        }
    } catch (error) {
        console.error('Error calculating gold profit/loss:', error)
        return { error: error.message }
    }
}

/**
 * Calculate profit/loss for silver asset
 * @param {number} grams - Weight in grams
 * @param {number} purchasePrice - Original purchase price
 * @returns {Promise<Object>} { currentValue, purchaseValue, profit, profitPercent }
 */
export async function calculateSilverProfitLoss(grams, purchasePrice) {
    try {
        const currentCalc = await calculateSilverAssetValue(grams)

        if (currentCalc.error) {
            return currentCalc
        }

        const profit = currentCalc.value - purchasePrice
        const profitPercent = purchasePrice > 0
            ? ((profit / purchasePrice) * 100).toFixed(2)
            : 0

        return {
            currentValue: currentCalc.value,
            currentPricePerGram: currentCalc.priceUsed,
            purchaseValue: purchasePrice,
            profit,
            profitPercent: parseFloat(profitPercent),
            priceDate: currentCalc.date,
            grams
        }
    } catch (error) {
        console.error('Error calculating silver profit/loss:', error)
        return { error: error.message }
    }
}
