import { NextResponse } from 'next/server'

/**
 * GET /api/push/vapid-key
 * Get the public VAPID key for client-side subscription
 */
export async function GET() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

    if (!publicKey) {
        return NextResponse.json(
            {
                success: false,
                error: 'VAPID key not configured',
                configured: false
            },
            { status: 503 }
        )
    }

    return NextResponse.json({
        success: true,
        publicKey,
        configured: true
    })
}
