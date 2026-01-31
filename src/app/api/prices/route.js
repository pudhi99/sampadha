/**
 * API Route for fetching metal prices using MetalPriceAPI
 * Uses exclusive API key: 540019848ac44a7cb51bfb5e039a492d
 * No fallbacks implemented as requested
 */

import { NextResponse } from 'next/server'

// Constants
const API_KEY = process.env.METAL_PRICE_API_KEY || '540019848ac44a7cb51bfb5e039a492d'
const BASE_URL = 'https://api.metalpriceapi.com/v1/latest'
const GRAMS_PER_OUNCE = 31.1035

export async function GET() {
    try {
        // Fetch Gold and Silver with INR base
        // Note: Copper (XCU) requires paid plan, so omitting
        const url = `${BASE_URL}?api_key=${API_KEY}&base=INR&currencies=XAU,XAG`

        console.log('Fetching prices from:', url.replace(API_KEY, '***'))

        const response = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            throw new Error(`API Timeout or Error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error?.info || data.error?.type || 'API Error')
        }

        // Parse rates
        // Format: { "rates": { "INRXAU": 490351.68, "INRXAG": 10555.40 } }
        // Rates are usually Price per Troy Ounce in Base Currency (INR)

        const goldRate = data.rates.INRXAU
        const silverRate = data.rates.INRXAG

        if (!goldRate || !silverRate) {
            throw new Error('Invalid rate data received')
        }

        // Convert Ounce to Gram
        // Note: The API seems to return high values (~2x market). 
        // Standard conversion: Rate / 31.1035
        const goldPerGram = goldRate / GRAMS_PER_OUNCE
        const silverPerGram = silverRate / GRAMS_PER_OUNCE

        return NextResponse.json({
            success: true,
            prices: {
                gold: {
                    pricePerGram: Math.round(goldPerGram * 100) / 100,
                    pricePer10g: Math.round(goldPerGram * 10 * 100) / 100,
                    source: 'metalpriceapi'
                },
                silver: {
                    pricePerGram: Math.round(silverPerGram * 100) / 100,
                    pricePer10g: Math.round(silverPerGram * 10 * 100) / 100,
                    source: 'metalpriceapi'
                },
                copper: null // Not supported on free plan
            },
            timestamp: new Date(data.timestamp * 1000).toISOString()
        })

    } catch (error) {
        console.error('MetalPriceAPI Error:', error.message)

        // Return 500 error instead of fallback data as requested
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
