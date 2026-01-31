import { captureDailyPrices } from '@/lib/priceTracking'
import { createDailyPriceAlerts } from '@/lib/notifications'

/**
 * Cron Job API Route - Daily Precious Metals Price Alerts
 * Runs at 8 AM and 9 AM IST
 * 
 * Setup in Vercel:
 * 1. Add CRON_SECRET to environment variables
 * 2. Configure cron: '0 2,3 * * *' (8 AM and 9 AM IST = 2:30 AM and 3:30 AM UTC)
 */
export async function GET(request) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Capture current prices for all metals
        console.log('[Cron] Capturing daily prices...')
        const pricesResult = await captureDailyPrices()

        // Create price alert notifications
        console.log('[Cron] Creating price alerts...')
        const notifications = await createDailyPriceAlerts()

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            pricesCaptured: {
                gold: !!pricesResult?.gold,
                silver: !!pricesResult?.silver,
                copper: !!pricesResult?.copper
            },
            notificationsCreated: notifications?.length || 0
        }

        console.log('[Cron] Success:', response)

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('[Cron] Error:', error)

        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

/**
 * Manual trigger for testing
 * POST to this endpoint to manually run the job
 */
export async function POST(request) {
    return GET(request)
}
