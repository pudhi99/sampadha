import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import webPush from 'web-push'

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@sampadha.app'

// Initialize web-push with VAPID details
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    )
}

/**
 * POST /api/push/send
 * Send push notifications to all subscribers
 * Called by cron job after creating notifications
 */
export async function POST(request) {
    try {
        // Verify this is an internal call
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        // Allow internal calls or authenticated requests
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            // Check if it's a same-origin request
            const origin = request.headers.get('origin')
            const host = request.headers.get('host')
            if (origin && !origin.includes(host)) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            return NextResponse.json({
                success: false,
                error: 'VAPID keys not configured',
                sent: 0,
                failed: 0
            })
        }

        const body = await request.json()
        const { notifications = [] } = body

        if (notifications.length === 0) {
            return NextResponse.json({
                success: true,
                sent: 0,
                failed: 0,
                message: 'No notifications to send'
            })
        }

        // Get all push subscriptions
        const { data: subscriptions, error } = await supabaseAdmin
            .from('push_subscriptions')
            .select('*')

        if (error) {
            console.error('[Push Send] DB error:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                sent: 0,
                failed: 0
            })
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                success: true,
                sent: 0,
                failed: 0,
                subscribers: 0,
                message: 'No subscribers'
            })
        }

        console.log(`[Push Send] Sending to ${subscriptions.length} subscribers`)

        // Build notification payload
        const payload = notifications.length === 1
            ? {
                title: notifications[0].title,
                body: notifications[0].message,
                icon: '/logo-192.png',
                badge: '/logo-192.png',
                url: '/',
                tag: 'sampadha-notification'
            }
            : {
                title: '📬 New Notifications',
                body: `You have ${notifications.length} new updates`,
                icon: '/logo-192.png',
                badge: '/logo-192.png',
                url: '/',
                tag: 'sampadha-batch'
            }

        const payloadStr = JSON.stringify(payload)

        // Send to all subscribers
        const results = {
            sent: 0,
            failed: 0,
            expired: []
        }

        const promises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }

            try {
                await webPush.sendNotification(pushSubscription, payloadStr)
                results.sent++
            } catch (err) {
                console.error('[Push Send] Error:', err.statusCode, err.message)
                results.failed++

                // Track expired subscriptions for cleanup
                if (err.statusCode === 410 || err.statusCode === 404) {
                    results.expired.push(sub.endpoint)
                }
            }
        })

        await Promise.all(promises)

        // Clean up expired subscriptions
        if (results.expired.length > 0) {
            console.log(`[Push Send] Cleaning ${results.expired.length} expired subscriptions`)
            for (const endpoint of results.expired) {
                await supabaseAdmin
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', endpoint)
            }
        }

        return NextResponse.json({
            success: true,
            sent: results.sent,
            failed: results.failed,
            subscribers: subscriptions.length,
            expiredCleaned: results.expired.length
        })

    } catch (error) {
        console.error('[Push Send] Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            sent: 0,
            failed: 0
        }, { status: 500 })
    }
}
