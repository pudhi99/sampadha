/**
 * GoodReturns Price API
 * 
 * Fetches prices from GoodReturns widget and parses HTML
 * Server-side fetch to avoid CORS issues
 */

import { NextResponse } from 'next/server'

const WIDGET_API = 'https://www.goodreturns.in/dynamic_html_includes/web/widget/v2_home_page_top_widget.html'

// Parse HTML widget to extract all prices
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
        const goldMatch = html.match(/22k\s*Gold\s*<span[^>]*class="stock-price"[^>]*>[^\d]*([\d,]+)\s*\/gm<\/span>/i)
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
        const silverMatch = html.match(/Silver\s*<span[^>]*class="stock-price"[^>]*>[^\d]*([\d,]+)\/kg<\/span>/i)
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
        const petrolMatch = html.match(/Petrol\s*<span[^>]*class="stock-price"[^>]*>[^\d]*([\d\.]+)<\/span>/i)
        if (petrolMatch) {
            data.petrol = parseFloat(petrolMatch[1])
        }

        // Diesel pattern
        const dieselMatch = html.match(/Diesel\s*<span[^>]*class="stock-price"[^>]*>[^\d]*([\d\.]+)<\/span>/i)
        if (dieselMatch) {
            data.diesel = parseFloat(dieselMatch[1])
        }

        // Crude Oil pattern
        const crudeMatch = html.match(/Crude\s*Oil\s*<span[^>]*class="stock-price"[^>]*>\$([\d\.]+)<\/span>/i)
        if (crudeMatch) {
            data.crudeOil = parseFloat(crudeMatch[1])
        }

        // USD pattern
        const usdMatch = html.match(/USD\s*<span[^>]*class="stock-price"[^>]*>[^\d]*([\d\.]+)<\/span>/i)
        if (usdMatch) {
            data.usd = parseFloat(usdMatch[1])
        }

    } catch (e) {
        console.error('[API] Parse error:', e)
    }

    return data
}

export async function GET(request) {
    try {
        const timestamp = Date.now()
        const url = `${WIDGET_API}?q=${timestamp}`

        console.log('[GoodReturns API] Fetching:', url)

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.goodreturns.in/',
            },
            cache: 'no-store'
        })

        console.log('[GoodReturns API] Response status:', response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[GoodReturns API] Error response:', errorText.substring(0, 500))
            return NextResponse.json({
                success: false,
                error: `GoodReturns returned ${response.status}`,
                status: response.status
            }, { status: response.status })
        }

        const html = await response.text()
        console.log('[GoodReturns API] HTML length:', html.length)
        console.log('[GoodReturns API] HTML preview:', html.substring(0, 500))

        // Parse the HTML
        const data = parseWidgetHTML(html)

        console.log('[GoodReturns API] Parsed data:', JSON.stringify(data, null, 2))

        return NextResponse.json({
            success: true,
            data: data,
            timestamp: new Date().toISOString(),
            source: 'goodreturns.in',
            htmlLength: html.length
        })

    } catch (error) {
        console.error('[GoodReturns API] Error:', error)

        return NextResponse.json({
            success: false,
            error: `Technical Issue: ${error.message}`
        }, { status: 500 })
    }
}
