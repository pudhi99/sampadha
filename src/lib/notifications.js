/**
 * Notifications System
 * Create and manage price alerts and notifications
 */

import { supabase } from './supabase'
import { getPriceChange } from './priceTracking'

/**
 * Create a notification
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification({ title, message, type, metal = null, priceChange = null }) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                title,
                message,
                type,
                metal,
                price_change: priceChange,
                is_read: false
            }])
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error creating notification:', error)
        return null
    }
}

/**
 * Get unread notifications
 * @returns {Promise<Array>} Unread notifications
 */
export async function getUnreadNotifications() {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('is_read', false)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return []
    }
}

/**
 * Get all notifications
 * @param {number} limit - Max number to retrieve
 * @returns {Promise<Array>} All notifications
 */
export async function getAllNotifications(limit = 50) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching all notifications:', error)
        return []
    }
}

/**
 * Mark notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<boolean>} Success status
 */
export async function markAsRead(id) {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return false
    }
}

/**
 * Mark all notifications as read
 * @returns {Promise<boolean>} Success status
 */
export async function markAllAsRead() {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error marking all as read:', error)
        return false
    }
}

/**
 * Delete notification
 * @param {string} id - Notification ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteNotification(id) {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error deleting notification:', error)
        return false
    }
}

/**
 * Create daily price alert notifications for all metals
 * Called by cron job at 8 AM and 9 AM
 * @returns {Promise<Array>} Created notifications
 */
export async function createDailyPriceAlerts() {
    try {
        const metals = ['GOLD', 'SILVER']
        const notifications = []

        for (const metal of metals) {
            // Get daily price change
            const change = await getPriceChange(metal, 'day')

            if (!change || change.current === 0) continue

            const isUp = change.change > 0
            const emoji = isUp ? '📈' : '📉'
            const direction = isUp ? 'increased' : 'decreased'

            const title = `${emoji} ${metal} Price Update`
            const message = `${metal} price ${direction} by ₹${Math.abs(change.change).toFixed(2)}/g (${Math.abs(change.changePercent)}%) to ₹${change.current.toFixed(2)}/g`

            const notification = await createNotification({
                title,
                message,
                type: 'PRICE_ALERT',
                metal,
                priceChange: change.change
            })

            if (notification) {
                notifications.push(notification)
            }
        }

        return notifications
    } catch (error) {
        console.error('Error creating daily price alerts:', error)
        return []
    }
}

/**
 * Get notification count (unread)
 * @returns {Promise<number>} Count of unread notifications
 */
export async function getUnreadCount() {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)

        if (error) throw error
        return count || 0
    } catch (error) {
        console.error('Error getting unread count:', error)
        return 0
    }
}
