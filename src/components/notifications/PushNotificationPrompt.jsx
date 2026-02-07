'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, X, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

/**
 * Convert base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function PushNotificationPrompt() {
    const { user, isDemo } = useAuth()
    const [permission, setPermission] = useState('default')
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const [vapidKey, setVapidKey] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        // Check if already dismissed
        const wasDismissed = localStorage.getItem('push-prompt-dismissed')
        if (wasDismissed) {
            setDismissed(true)
            return
        }

        // Check notification permission
        if ('Notification' in window) {
            setPermission(Notification.permission)
        }

        // Check if already subscribed
        checkSubscription()

        // Fetch VAPID key
        fetchVapidKey()

        // Show prompt after 3 seconds if not granted
        const timer = setTimeout(() => {
            if (Notification.permission !== 'granted' && !isDemo) {
                setShowPrompt(true)
            }
        }, 3000)

        return () => clearTimeout(timer)
    }, [isDemo])

    const fetchVapidKey = async () => {
        try {
            const res = await fetch('/api/push/vapid-key')
            const data = await res.json()
            if (data.success) {
                setVapidKey(data.publicKey)
            }
        } catch (error) {
            console.error('Error fetching VAPID key:', error)
        }
    }

    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return
        }

        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        } catch (error) {
            console.error('Error checking subscription:', error)
        }
    }

    const handleSubscribe = async () => {
        if (!vapidKey) {
            console.error('VAPID key not available')
            return
        }

        setLoading(true)

        try {
            // Request notification permission
            const result = await Notification.requestPermission()
            setPermission(result)

            if (result !== 'granted') {
                console.log('Notification permission denied')
                setLoading(false)
                return
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            })

            // Send subscription to server
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userId: user?.id || null,
                    userAgent: navigator.userAgent
                })
            })

            const data = await response.json()

            // Close popup regardless of API success - browser permission is already granted
            setIsSubscribed(true)
            setShowPrompt(false)

            if (data.success) {
                // Show success notification
                new Notification('🔔 Notifications Enabled!', {
                    body: 'You will now receive price alerts, loan reminders, and asset updates.',
                    icon: '/logo-192.png'
                })
            } else {
                console.warn('Push subscription API error:', data.error)
                // Still show a notification since browser permission is granted
                new Notification('🔔 Notifications Enabled!', {
                    body: 'Browser notifications are on. Server sync may be delayed.',
                    icon: '/logo-192.png'
                })
            }
        } catch (error) {
            console.error('Error subscribing to push:', error)
            // Still close the prompt since permission was likely granted
            setShowPrompt(false)
        }

        setLoading(false)
    }

    const handleDismiss = () => {
        setDismissed(true)
        setShowPrompt(false)
        localStorage.setItem('push-prompt-dismissed', 'true')
    }

    // Don't show in demo mode or if already subscribed/dismissed
    if (isDemo || isSubscribed || dismissed || !showPrompt) {
        return null
    }

    // Don't show if notifications not supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return null
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
            >
                <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <Bell className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-sm">Enable Notifications?</h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 -mt-1 -mr-1"
                                        onClick={handleDismiss}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 mb-3">
                                    Get instant alerts for gold/silver price changes, loan due dates, and asset value updates.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleSubscribe}
                                        disabled={loading || !vapidKey}
                                        className="flex-1"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                        )}
                                        Enable
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleDismiss}
                                        className="text-muted-foreground"
                                    >
                                        Not now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * Notification Toggle for Settings page
 */
export function NotificationToggle() {
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [permission, setPermission] = useState('default')

    useEffect(() => {
        checkStatus()
    }, [])

    const checkStatus = async () => {
        if ('Notification' in window) {
            setPermission(Notification.permission)
        }

        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return
        }

        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        } catch (error) {
            console.error('Error checking subscription:', error)
        }
    }

    const handleToggle = async () => {
        setLoading(true)

        if (isSubscribed) {
            // Unsubscribe
            try {
                const registration = await navigator.serviceWorker.ready
                const subscription = await registration.pushManager.getSubscription()

                if (subscription) {
                    await subscription.unsubscribe()

                    // Remove from server
                    await fetch('/api/push/subscribe', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ endpoint: subscription.endpoint })
                    })
                }

                setIsSubscribed(false)
            } catch (error) {
                console.error('Error unsubscribing:', error)
            }
        } else {
            // Subscribe (reuse PushNotificationPrompt logic would be complex, so just update status)
            // For now, inform user to reload
            alert('Please reload the page to re-enable notifications.')
        }

        setLoading(false)
    }

    if (!('Notification' in window)) {
        return (
            <div className="text-sm text-muted-foreground">
                Notifications not supported in this browser
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
                {isSubscribed ? (
                    <Bell className="w-5 h-5 text-primary" />
                ) : (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                    <p className="font-medium text-sm">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">
                        {permission === 'denied'
                            ? 'Blocked in browser settings'
                            : isSubscribed
                                ? 'Enabled - receiving alerts'
                                : 'Disabled'
                        }
                    </p>
                </div>
            </div>
            <Button
                variant={isSubscribed ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggle}
                disabled={loading || permission === 'denied'}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubscribed ? (
                    'Disable'
                ) : (
                    'Enable'
                )}
            </Button>
        </div>
    )
}
