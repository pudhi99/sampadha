'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bell, X, Check, Trash2, TrendingUp, TrendingDown,
    Coins, Calendar, AlertTriangle, Package, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { demoNotifications } from '@/lib/demoData'
import {
    getAllNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '@/lib/notifications'

export function NotificationBell() {
    const { isDemo } = useAuth()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            if (isDemo) {
                // Use demo data
                setNotifications(demoNotifications)
                setUnreadCount(demoNotifications.filter(n => !n.is_read).length)
            } else {
                const [notifs, count] = await Promise.all([
                    getAllNotifications(20),
                    getUnreadCount()
                ])
                setNotifications(notifs || [])
                setUnreadCount(count || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            setNotifications([])
            setUnreadCount(0)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchNotifications()
        // Refresh every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [isDemo])

    const handleMarkAsRead = async (id) => {
        if (isDemo) {
            // Update local state for demo
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
            return
        }
        await markAsRead(id)
        fetchNotifications()
    }

    const handleMarkAllAsRead = async () => {
        if (isDemo) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
            return
        }
        await markAllAsRead()
        fetchNotifications()
    }

    const handleDelete = async (id) => {
        if (isDemo) {
            setNotifications(prev => prev.filter(n => n.id !== id))
            return
        }
        await deleteNotification(id)
        fetchNotifications()
    }

    const getNotificationConfig = (type, metal, priceChange) => {
        switch (type) {
            case 'PRICE_ALERT':
                return {
                    icon: priceChange && priceChange > 0
                        ? <TrendingUp className="w-5 h-5 text-green-500" />
                        : priceChange && priceChange < 0
                            ? <TrendingDown className="w-5 h-5 text-red-500" />
                            : <Coins className="w-5 h-5 text-amber-500" />,
                    bgColor: metal === 'GOLD'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : metal === 'SILVER'
                            ? 'bg-gray-500/10 border-gray-500/30'
                            : 'bg-primary/10 border-primary/30',
                    badge: metal || 'Price'
                }
            case 'LOAN_REMINDER':
                return {
                    icon: <Calendar className="w-5 h-5 text-blue-500" />,
                    bgColor: 'bg-blue-500/10 border-blue-500/30',
                    badge: 'Loan'
                }
            case 'ASSET_UPDATE':
                return {
                    icon: <Package className="w-5 h-5 text-purple-500" />,
                    bgColor: metal === 'GOLD'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-gray-500/10 border-gray-500/30',
                    badge: 'Asset'
                }
            default:
                return {
                    icon: <Info className="w-5 h-5 text-muted-foreground" />,
                    bgColor: 'bg-muted/50 border-muted',
                    badge: 'System'
                }
        }
    }

    const getMetalColor = (metal) => {
        const colors = {
            GOLD: 'text-amber-500',
            SILVER: 'text-gray-400',
            COPPER: 'text-orange-600'
        }
        return colors[metal] || 'text-foreground'
    }

    const getTypeColor = (type) => {
        const colors = {
            PRICE_ALERT: 'bg-green-500/20 text-green-400',
            LOAN_REMINDER: 'bg-blue-500/20 text-blue-400',
            ASSET_UPDATE: 'bg-purple-500/20 text-purple-400',
            SYSTEM: 'bg-muted text-muted-foreground'
        }
        return colors[type] || colors.SYSTEM
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>
                            Notifications
                            {isDemo && <span className="text-xs text-muted-foreground ml-2">(Demo)</span>}
                        </SheetTitle>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="text-xs"
                            >
                                Mark all read
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {notifications.map((notification) => {
                                const config = getNotificationConfig(
                                    notification.type,
                                    notification.metal,
                                    notification.price_change
                                )
                                return (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={`
                                            p-4 rounded-xl border transition-all group
                                            ${notification.is_read
                                                ? 'bg-card/50 border-border hover:bg-card'
                                                : `${config.bgColor} hover:shadow-lg`
                                            }
                                        `}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
                                                {config.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className={`font-medium text-sm ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-[10px] px-1.5 py-0 ${getTypeColor(notification.type)}`}
                                                        >
                                                            {config.badge}
                                                        </Badge>
                                                        {!notification.is_read && (
                                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(notification.created_at).toLocaleString('en-IN', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.is_read && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                            >
                                                                <Check className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-red-500 hover:text-red-500"
                                                            onClick={() => handleDelete(notification.id)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
