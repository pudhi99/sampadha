import { captureDailyPrices } from '@/lib/priceTracking'
import { runDailyNotificationJobs } from '@/lib/notifications'

/**
 * Cron Job API Route - Daily Price Capture & Notifications
 * Runs at 9 AM IST daily
 * 
 * Setup in Vercel:
 * 1. Add CRON_SECRET to environment variables
 * 2. Configure cron: '30 3 * * *' (9 AM IST = 3:30 AM UTC)
 */
export async function GET(request) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Step 1: Capture current prices for all metals
        console.log('[Cron] Capturing daily prices...')
        const pricesResult = await captureDailyPrices()

        // Step 2: Run all notification jobs (price alerts, loan reminders, asset updates)
        console.log('[Cron] Running notification jobs...')
        const notificationSummary = await runDailyNotificationJobs()

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            pricesCaptured: {
                gold: !!pricesResult?.gold,
                silver: !!pricesResult?.silver
            },
            notifications: notificationSummary
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
