/**
 * Notifications System
 * Create and manage price alerts, loan reminders, and asset updates
 */

import { supabase, supabaseAdmin } from './supabase'
import { getPriceChange, getLatestStoredPrice } from './priceTracking'

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
    PRICE_ALERT: 'PRICE_ALERT',
    LOAN_REMINDER: 'LOAN_REMINDER',
    ASSET_UPDATE: 'ASSET_UPDATE',
    FINANCE_REMINDER: 'FINANCE_REMINDER',
    INVESTMENT_MATURITY: 'INVESTMENT_MATURITY',
    SYSTEM: 'SYSTEM'
}

/**
 * Create a notification
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification({ title, message, type, metal = null, priceChange = null, metadata = null }) {
    try {
        // Merge metal and priceChange into metadata if provided
        const fullMetadata = {
            ...(metadata || {}),
            ...(metal && { metal }),
            ...(priceChange !== undefined && priceChange !== null && { priceChange })
        }

        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert([{
                title,
                message,
                type,
                metadata: Object.keys(fullMetadata).length > 0 ? fullMetadata : null,
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
 * Called by cron job
 * @returns {Promise<Array>} Created notifications
 */
export async function createDailyPriceAlerts() {
    try {
        const metals = ['GOLD', 'SILVER']
        const notifications = []

        for (const metal of metals) {
            // Get price change from stored prices
            const change = await getPriceChange(metal, 'day')

            // Skip if no valid data
            if (change.error || !change.current || change.change === null) {
                console.log(`[Notifications] Skipping ${metal}: ${change.error || change.note || 'No valid data'}`)
                continue
            }

            const isUp = change.change > 0
            const emoji = isUp ? '📈' : (change.change < 0 ? '📉' : '➡️')
            const direction = isUp ? 'increased' : (change.change < 0 ? 'decreased' : 'unchanged')

            // Format the change percent safely
            const changePercent = typeof change.changePercent === 'number'
                ? Math.abs(change.changePercent).toFixed(2)
                : '0.00'

            const title = `${emoji} ${metal} Price Update`
            const message = `${metal} price ${direction} by ₹${Math.abs(change.change).toFixed(0)}/g (${changePercent}%) to ₹${change.current.toLocaleString('en-IN')}/g`

            const notification = await createNotification({
                title,
                message,
                type: NOTIFICATION_TYPES.PRICE_ALERT,
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
 * Create loan reminder notifications
 * Checks for loans with upcoming due dates
 * @returns {Promise<Array>} Created notifications
 */
export async function createLoanReminders() {
    try {
        const notifications = []
        const today = new Date()

        // Fetch active loans (both given and taken) - don't filter by next_due_date as column may not exist
        const { data: loans, error } = await supabaseAdmin
            .from('loans')
            .select('*')
            .eq('status', 'ACTIVE')

        if (error) throw error
        if (!loans || loans.length === 0) return []

        for (const loan of loans) {
            // Calculate next due date: Use next_due_date if available, else calculate from start_date
            let dueDate

            if (loan.next_due_date) {
                dueDate = new Date(loan.next_due_date)
            } else if (loan.payment_day) {
                // Use payment_day of this month or next
                dueDate = new Date(today.getFullYear(), today.getMonth(), loan.payment_day)
                if (dueDate < today) {
                    dueDate.setMonth(dueDate.getMonth() + 1)
                }
            } else if (loan.start_date) {
                // Calculate based on start_date - assume monthly payments on same day
                const startDay = new Date(loan.start_date).getDate()
                dueDate = new Date(today.getFullYear(), today.getMonth(), startDay)
                if (dueDate < today) {
                    dueDate.setMonth(dueDate.getMonth() + 1)
                }
            } else {
                // No date info available, skip
                continue
            }

            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

            // Skip if already past or more than 7 days away
            if (daysUntilDue < 0 || daysUntilDue > 7) continue

            let emoji, urgency
            if (daysUntilDue === 0) {
                emoji = '🚨'
                urgency = 'Due Today!'
            } else if (daysUntilDue <= 3) {
                emoji = '⚠️'
                urgency = `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`
            } else {
                emoji = '📅'
                urgency = `Due in ${daysUntilDue} days`
            }

            const loanType = loan.type === 'GIVEN' ? 'Loan to' : 'Loan from'
            const title = `${emoji} ${urgency}`
            const message = `${loanType} ${loan.borrower_name}: ₹${loan.emi_amount?.toLocaleString('en-IN') || loan.remaining_amount?.toLocaleString('en-IN') || loan.principal?.toLocaleString('en-IN')} payment ${daysUntilDue === 0 ? 'is due today' : 'is coming up'}`

            const notification = await createNotification({
                title,
                message,
                type: NOTIFICATION_TYPES.LOAN_REMINDER,
                metadata: { loanId: loan.id, loanType: loan.type, dueDate: dueDate.toISOString() }
            })

            if (notification) {
                notifications.push(notification)
            }
        }

        return notifications
    } catch (error) {
        console.error('Error creating loan reminders:', error)
        return []
    }
}

/**
 * Create asset update notifications for gold/silver price changes
 * Notifies if asset value changed significantly (>2%)
 * @returns {Promise<Array>} Created notifications
 */
export async function createAssetUpdateNotifications() {
    try {
        const notifications = []

        // Fetch gold and silver assets
        const { data: assets, error } = await supabaseAdmin
            .from('assets')
            .select('*')
            .in('type', ['GOLD', 'SILVER'])

        if (error) throw error
        if (!assets || assets.length === 0) return []

        // Get latest stored prices
        const goldPrice = await getLatestStoredPrice('GOLD')
        const silverPrice = await getLatestStoredPrice('SILVER')

        for (const asset of assets) {
            if (!asset.metadata?.grams) continue

            let currentRate, newValue
            if (asset.type === 'GOLD') {
                if (!goldPrice) continue
                const purity = asset.metadata.purity || '22K'
                currentRate = goldPrice[purity]?.pricePerGram || goldPrice['22K']?.pricePerGram
            } else if (asset.type === 'SILVER') {
                if (!silverPrice) continue
                currentRate = silverPrice.pricePerGram
            }

            if (!currentRate) continue

            newValue = Math.round(asset.metadata.grams * currentRate)
            const oldValue = Number(asset.current_value)
            const change = newValue - oldValue
            const changePercent = oldValue > 0 ? (change / oldValue) * 100 : 0

            // Only notify if change is significant (>2%) and value changed
            if (Math.abs(changePercent) >= 2 && change !== 0) {
                const emoji = change > 0 ? '📈' : '📉'
                const direction = change > 0 ? 'increased' : 'decreased'

                const title = `${emoji} ${asset.name} Value Update`
                const message = `Your ${asset.type.toLowerCase()} asset ${direction} by ${Math.abs(changePercent).toFixed(1)}% (₹${Math.abs(change).toLocaleString('en-IN')}) to ₹${newValue.toLocaleString('en-IN')}`

                const notification = await createNotification({
                    title,
                    message,
                    type: NOTIFICATION_TYPES.ASSET_UPDATE,
                    metal: asset.type,
                    metadata: { assetId: asset.id, oldValue, newValue, changePercent }
                })

                if (notification) {
                    notifications.push(notification)

                    // Update the asset's current value in db
                    await supabase
                        .from('assets')
                        .update({ current_value: newValue })
                        .eq('id', asset.id)
                }
            }
        }

        return notifications
    } catch (error) {
        console.error('Error creating asset update notifications:', error)
        return []
    }
}

/**
 * Create finance/investment reminders
 * Checks for chit fund installment dues and investment maturities
 * @returns {Promise<Array>} Created notifications
 */
export async function createFinanceReminders() {
    try {
        const notifications = []
        const today = new Date()
        const in7Days = new Date(today)
        in7Days.setDate(in7Days.getDate() + 7)
        const in30Days = new Date(today)
        in30Days.setDate(in30Days.getDate() + 30)

        // Fetch all active finance schemes
        const { data: schemes, error } = await supabaseAdmin
            .from('finance_schemes')
            .select('*')
            .eq('status', 'ACTIVE')

        if (error) throw error
        if (!schemes || schemes.length === 0) return []

        for (const scheme of schemes) {
            // CHIT FUND REMINDERS
            if (scheme.scheme_type === 'CHIT_FUND') {
                const startDate = new Date(scheme.start_date)
                const durationMonths = scheme.duration_months || 20
                const currentMonth = scheme.current_month || 1

                // Determine due date
                const now = new Date()
                let dueDate = new Date(now.getFullYear(), now.getMonth(), scheme.payment_due_day || 1) // Default to 1st if no day set

                // If due date for this month has passed, look at next month
                // BUT user wants reminders for *this* payment cycle. 
                // Assuming current_month tracks what needs to be paid.
                // Simpler logic: Recurring monthly reminder on the specific day

                const dayOfMonth = now.getDate()
                const dueDay = scheme.payment_due_day || 1

                // 1 Day Before Warning
                const oneDayBefore = dueDay - 1 === 0 ? new Date(now.getFullYear(), now.getMonth(), 0).getDate() : dueDay - 1
                const isOneDayBefore = dayOfMonth === oneDayBefore

                // On Due Date
                const isDueDate = dayOfMonth === dueDay

                // Also standard logic for general due date calculation to show "Due in X days"
                if (dayOfMonth > dueDay) {
                    dueDate.setMonth(dueDate.getMonth() + 1)
                }
                const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))

                // Calculate this month's installment amount (variable)
                const chitValue = Number(scheme.chit_value) || 0
                const baseInstallment = chitValue / durationMonths
                const firstBonus = Math.round(baseInstallment * 0.27)
                const bonusDecrement = firstBonus / durationMonths
                const thisMonthBonus = Math.max(0, Math.round(firstBonus - (bonusDecrement * (currentMonth - 1))))
                const thisMonthInstallment = Math.round(baseInstallment - thisMonthBonus)

                // Trigger Notifications
                if (isOneDayBefore || isDueDate || (daysUntilDue >= 0 && daysUntilDue <= 3 && !scheme.payment_due_day)) {
                    // Logic: If payment_due_day is set, be strict (1 day before, and on day)
                    // If NOT set, default to generic "upcoming" logic (3 days window)

                    let shouldNotify = false
                    let urgency = ''
                    let emoji = '📅'

                    if (scheme.payment_due_day) {
                        if (isOneDayBefore) {
                            shouldNotify = true
                            emoji = '⏰'
                            urgency = 'Due Tomorrow'
                        } else if (isDueDate) {
                            shouldNotify = true
                            emoji = '🚨'
                            urgency = 'Due TODAY'
                        }
                    } else {
                        // Default logic if no specific day set
                        if (daysUntilDue >= 0 && daysUntilDue <= 3) {
                            shouldNotify = true
                            urgency = `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                            if (daysUntilDue === 0) urgency = 'Due TODAY'
                        }
                    }

                    if (shouldNotify) {
                        const title = `${emoji} Chit Installment ${urgency}`
                        const message = `${scheme.name}: Month ${currentMonth}/${durationMonths} installment of ₹${thisMonthInstallment.toLocaleString('en-IN')} is ${urgency}`

                        const notification = await createNotification({
                            title,
                            message,
                            type: NOTIFICATION_TYPES.FINANCE_REMINDER,
                            metadata: { schemeId: scheme.id, schemeType: 'CHIT_FUND', amount: thisMonthInstallment, month: currentMonth }
                        })

                        if (notification) notifications.push(notification)
                    }
                }
            }

            // INVESTMENT MATURITY ALERTS
            if (['POST_OFFICE_FD', 'POST_OFFICE_RD', 'NSC', 'KVP', 'PPF', 'SCSS'].includes(scheme.scheme_type)) {
                let maturityDate
                const startDate = new Date(scheme.start_date)

                switch (scheme.scheme_type) {
                    case 'POST_OFFICE_FD':
                        const years = parseInt(scheme.tenure) || 1
                        maturityDate = new Date(startDate.setFullYear(startDate.getFullYear() + years))
                        break
                    case 'POST_OFFICE_RD':
                    case 'NSC':
                    case 'SCSS':
                        maturityDate = new Date(startDate.setFullYear(startDate.getFullYear() + 5))
                        break
                    case 'KVP':
                        maturityDate = new Date(startDate.setMonth(startDate.getMonth() + 115))
                        break
                    case 'PPF':
                        maturityDate = new Date(startDate.setFullYear(startDate.getFullYear() + 15))
                        break
                }

                if (maturityDate) {
                    const daysUntilMaturity = Math.ceil((maturityDate - today) / (1000 * 60 * 60 * 24))

                    // Alert if maturing within 30 days
                    if (daysUntilMaturity >= 0 && daysUntilMaturity <= 30) {
                        let emoji, urgency
                        if (daysUntilMaturity === 0) {
                            emoji = '🎉'
                            urgency = 'Matures Today!'
                        } else if (daysUntilMaturity <= 7) {
                            emoji = '🔔'
                            urgency = `Matures in ${daysUntilMaturity} day${daysUntilMaturity > 1 ? 's' : ''}`
                        } else {
                            emoji = '📆'
                            urgency = `Matures in ${daysUntilMaturity} days`
                        }

                        const title = `${emoji} ${scheme.scheme_type.replace('_', ' ')} ${urgency}`
                        const message = `${scheme.name}: Principal ₹${Number(scheme.principal).toLocaleString('en-IN')} at ${scheme.interest_rate}% is ${daysUntilMaturity === 0 ? 'maturing today' : 'maturing soon'}!`

                        const notification = await createNotification({
                            title,
                            message,
                            type: NOTIFICATION_TYPES.INVESTMENT_MATURITY,
                            metadata: { schemeId: scheme.id, schemeType: scheme.scheme_type, maturityDate: maturityDate.toISOString() }
                        })

                        if (notification) notifications.push(notification)
                    }
                }
            }

            // PRIVATE FINANCE MONTHLY INTEREST REMINDER
            if (scheme.scheme_type === 'PRIVATE_FINANCE' && scheme.payment_cycle === 'MONTHLY') {
                const now = new Date()
                const dayOfMonth = now.getDate()

                // Determine due day: Explicitly set day OR start date day
                const dueDay = scheme.payment_due_day || new Date(scheme.start_date).getDate()

                // Calculate due date (handle end of month edge cases if needed, but keeping simple for now)
                let thisMonthDue = new Date(now.getFullYear(), now.getMonth(), dueDay)

                // 1 Day Before Warning
                const oneDayBefore = dueDay - 1 === 0 ? new Date(now.getFullYear(), now.getMonth(), 0).getDate() : dueDay - 1
                const isOneDayBefore = dayOfMonth === oneDayBefore

                // On Due Date
                const isDueDate = dayOfMonth === dueDay

                if (dayOfMonth > dueDay) {
                    thisMonthDue.setMonth(thisMonthDue.getMonth() + 1)
                }
                const daysUntilDue = Math.ceil((thisMonthDue - now) / (1000 * 60 * 60 * 24))

                // Determine urgency/emoji
                let shouldNotify = false
                let emoji = '📅'
                let urgency = ''

                if (scheme.payment_due_day) {
                    // Strict mode if user set a specific day
                    if (isOneDayBefore) {
                        shouldNotify = true
                        emoji = '⏰'
                        urgency = 'Due Tomorrow'
                    } else if (isDueDate) {
                        shouldNotify = true
                        emoji = '🚨'
                        urgency = 'Due TODAY'
                    }
                } else {
                    // Default logic
                    if (daysUntilDue >= 0 && daysUntilDue <= 3) {
                        shouldNotify = true
                        urgency = `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                        if (daysUntilDue === 0) {
                            emoji = '🚨'
                            urgency = 'Due TODAY'
                        } else {
                            emoji = '⚠️'
                        }
                    }
                }

                if (shouldNotify) {
                    const monthlyInterest = Math.round((Number(scheme.principal) * Number(scheme.interest_rate)) / 100 / 12)

                    const title = `${emoji} Finance Interest ${urgency}`
                    const message = `${scheme.name}: Monthly interest of ₹${monthlyInterest.toLocaleString('en-IN')} is ${urgency}`

                    const notification = await createNotification({
                        title,
                        message,
                        type: NOTIFICATION_TYPES.FINANCE_REMINDER,
                        metadata: { schemeId: scheme.id, schemeType: 'PRIVATE_FINANCE', amount: monthlyInterest }
                    })

                    if (notification) notifications.push(notification)
                }
            }
        }

        return notifications
    } catch (error) {
        console.error('Error creating finance reminders:', error)
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

/**
 * Send push notifications to all subscribers via API route
 * @param {Array} notifications - Array of notification objects  
 * @returns {Promise<Object>} Push result summary
 */
async function sendPushNotificationsToSubscribers(notifications) {
    if (notifications.length === 0) {
        return { sent: 0, failed: 0 }
    }

    try {
        // Determine base URL for API call - fix operator precedence bug
        let baseUrl = 'http://localhost:3000'
        if (process.env.NEXT_PUBLIC_APP_URL) {
            baseUrl = process.env.NEXT_PUBLIC_APP_URL
        } else if (process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`
        }

        console.log(`[Push] Calling API at: ${baseUrl}/api/push/send`)

        const response = await fetch(`${baseUrl}/api/push/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`
            },
            body: JSON.stringify({
                notifications: notifications.map(n => ({
                    title: n.title,
                    message: n.message
                }))
            })
        })

        // Check if response is OK before parsing JSON
        if (!response.ok) {
            const text = await response.text()
            console.error('[Push] API error:', response.status, text.substring(0, 200))
            return { sent: 0, failed: 0, error: `API returned ${response.status}` }
        }

        const result = await response.json()
        console.log('[Push] API response:', result)

        return {
            sent: result.sent || 0,
            failed: result.failed || 0,
            subscribers: result.subscribers || 0
        }
    } catch (error) {
        console.error('[Push] Error calling push API:', error)
        return { sent: 0, failed: 0, error: error.message }
    }
}

/**
 * Run all daily notification jobs
 * Called by cron job after price capture
 * @returns {Promise<Object>} Summary of created notifications
 */
export async function runDailyNotificationJobs() {
    console.log('[Notifications] Running daily notification jobs...')

    const [priceAlerts, loanReminders, assetUpdates, financeReminders] = await Promise.all([
        createDailyPriceAlerts(),
        createLoanReminders(),
        createAssetUpdateNotifications(),
        createFinanceReminders()
    ])

    const allNotifications = [...priceAlerts, ...loanReminders, ...assetUpdates, ...financeReminders]

    // Send push notifications to all subscribers
    let pushResult = { sent: 0, failed: 0 }
    if (allNotifications.length > 0) {
        console.log('[Notifications] Sending push notifications...')
        pushResult = await sendPushNotificationsToSubscribers(allNotifications)
    }

    const summary = {
        priceAlerts: priceAlerts.length,
        loanReminders: loanReminders.length,
        assetUpdates: assetUpdates.length,
        financeReminders: financeReminders.length,
        total: allNotifications.length,
        push: pushResult
    }

    console.log('[Notifications] Daily jobs complete:', summary)
    return summary
}
