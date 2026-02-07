/**
 * Net Worth History Tracking
 * Captures and retrieves net worth snapshots over time
 */

import { supabase } from './supabase'
import { getAssets } from './db'
import { getLoans } from './db'
import { getFinanceSchemes } from './db'

import { getAllFinancePayments } from './db'

/**
 * Calculate current net worth from all sources
 * @returns {Promise<Object>} { netWorth, totalAssets, totalLiabilities }
 */
export async function calculateCurrentNetWorth() {
    try {
        // Fetch all data
        const [assets, loansGiven, loansTaken, schemes, payments] = await Promise.all([
            getAssets(),
            getLoans('GIVEN'),
            getLoans('TAKEN'),
            getFinanceSchemes(),
            getAllFinancePayments()
        ])

        // Calculate total assets
        const assetValue = (assets || []).reduce((sum, a) => sum + Number(a.current_value || 0), 0)
        const loansGivenValue = (loansGiven || []).reduce((sum, l) => sum + Number(l.principal || 0), 0)

        const schemesValue = (schemes || []).reduce((sum, s) => {
            // For recurring schemes, use actual payments
            if (['CHIT_FUND', 'POST_OFFICE_RD', 'PPF'].includes(s.scheme_type)) {
                const schemePayments = payments?.filter(p => p.scheme_id === s.id) || []
                const actualPaid = schemePayments.reduce((psum, p) => psum + Number(p.amount), 0)
                return sum + actualPaid
            }
            // For others (FD, Lending, Stocks), use principal
            return sum + Number(s.principal || 0)
        }, 0)

        const totalAssets = assetValue + loansGivenValue + schemesValue

        // Calculate total liabilities
        const totalLiabilities = (loansTaken || []).reduce((sum, l) => sum + Number(l.principal || 0), 0)

        // Net worth
        const netWorth = totalAssets - totalLiabilities

        return {
            netWorth,
            totalAssets,
            totalLiabilities
        }
    } catch (error) {
        console.error('Error calculating net worth:', error)
        return {
            netWorth: 0,
            totalAssets: 0,
            totalLiabilities: 0
        }
    }
}

/**
 * Capture a net worth snapshot
 * @returns {Promise<Object>} Snapshot data
 */
export async function captureNetWorthSnapshot() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.warn('User not authenticated, skipping snapshot')
            return { success: false, error: 'User not authenticated' }
        }

        const { netWorth, totalAssets, totalLiabilities } = await calculateCurrentNetWorth()

        const snapshot = {
            user_id: user.id,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            net_worth: netWorth,
            total_assets: totalAssets,
            total_liabilities: totalLiabilities
        }

        // Check if snapshot already exists for today
        const { data: existing } = await supabase
            .from('net_worth_history')
            .select('*')
            .eq('date', snapshot.date)
            .single()

        if (existing) {
            // Update existing snapshot
            const { data, error } = await supabase
                .from('net_worth_history')
                .update(snapshot)
                .eq('date', snapshot.date)
                .select()
                .single()

            if (error) throw error
            return { success: true, data, updated: true }
        } else {
            // Insert new snapshot
            const { data, error } = await supabase
                .from('net_worth_history')
                .insert([snapshot])
                .select()
                .single()

            if (error) throw error
            return { success: true, data, updated: false }
        }
    } catch (error) {
        console.error('Error capturing net worth snapshot:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get net worth history for the last N days
 * @param {number} days - Number of days to retrieve (default: 30)
 * @returns {Promise<Array>} Array of snapshots
 */
export async function getNetWorthHistory(days = 30) {
    try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const startDateStr = startDate.toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('net_worth_history')
            .select('*')
            .gte('date', startDateStr)
            .order('date', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching net worth history:', error)
        return []
    }
}

/**
 * Get all net worth history
 * @returns {Promise<Array>} Array of all snapshots
 */
export async function getAllNetWorthHistory() {
    try {
        const { data, error } = await supabase
            .from('net_worth_history')
            .select('*')
            .order('date', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching all net worth history:', error)
        return []
    }
}

/**
 * Delete a net worth snapshot
 * @param {string} date - Date of snapshot to delete (YYYY-MM-DD)
 * @returns {Promise<boolean>} Success status
 */
export async function deleteNetWorthSnapshot(date) {
    try {
        const { error } = await supabase
            .from('net_worth_history')
            .delete()
            .eq('date', date)

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error deleting net worth snapshot:', error)
        return false
    }
}

/**
 * Get net worth trend (growth percentage)
 * @param {number} days - Number of days to compare (default: 30)
 * @returns {Promise<Object>} { current, previous, change, changePercent }
 */
export async function getNetWorthTrend(days = 30) {
    try {
        const history = await getNetWorthHistory(days)

        if (history.length === 0) {
            return {
                current: 0,
                previous: 0,
                change: 0,
                changePercent: 0
            }
        }

        const current = Number(history[history.length - 1]?.net_worth || 0)
        const previous = Number(history[0]?.net_worth || 0)
        const change = current - previous
        const changePercent = previous !== 0 ? ((change / previous) * 100) : 0

        return {
            current,
            previous,
            change,
            changePercent: parseFloat(changePercent.toFixed(2))
        }
    } catch (error) {
        console.error('Error calculating net worth trend:', error)
        return {
            current: 0,
            previous: 0,
            change: 0,
            changePercent: 0
        }
    }
}
