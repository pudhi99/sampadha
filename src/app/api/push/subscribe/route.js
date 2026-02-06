import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/push/subscribe
 * Register a push subscription
 */
export async function POST(request) {
    try {
        const body = await request.json()
        const { subscription, userId } = body

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { success: false, error: 'Invalid subscription' },
                { status: 400 }
            )
        }

        // Extract keys from subscription
        const keys = subscription.keys || {}

        // Upsert subscription (update if endpoint exists, insert if not)
        const { data, error } = await supabase
            .from('push_subscriptions')
            .upsert({
                endpoint: subscription.endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                user_id: userId || null,
                user_agent: body.userAgent || null,
                last_used_at: new Date().toISOString()
            }, {
                onConflict: 'endpoint'
            })
            .select()
            .single()

        if (error) {
            console.error('[Push Subscribe] Error:', error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            subscription: data
        })

    } catch (error) {
        console.error('[Push Subscribe] Error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/push/subscribe
 * Unregister a push subscription
 */
export async function DELETE(request) {
    try {
        const body = await request.json()
        const { endpoint } = body

        if (!endpoint) {
            return NextResponse.json(
                { success: false, error: 'Endpoint required' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint)

        if (error) {
            console.error('[Push Unsubscribe] Error:', error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[Push Unsubscribe] Error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
