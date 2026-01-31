'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
    demoAssets,
    demoLoans,
    demoFinanceSchemes,
    demoNetWorthHistory,
    demoNotifications,
    demoPayments,
    getDemoTotals,
    getDemoAssetById,
    getDemoLoanById,
    getDemoSchemeById,
    getDemoPaymentsByLoanId,
    getDemoPriceHistory
} from '@/lib/demoData'
import * as db from '@/lib/db'
import * as notifications from '@/lib/notifications'

/**
 * Hook for fetching data that returns demo data when not authenticated
 */
export function useData() {
    const { isDemo, loading: authLoading } = useAuth()

    // ============ ASSETS ============

    const getAssets = useCallback(async (type = null) => {
        if (isDemo) {
            if (type) {
                return demoAssets.filter(a => a.type === type)
            }
            return demoAssets
        }
        return db.getAssets(type)
    }, [isDemo])

    const getAssetById = useCallback(async (id) => {
        if (isDemo) {
            return getDemoAssetById(id)
        }
        return db.getAssetById(id)
    }, [isDemo])

    // ============ LOANS ============

    const getLoans = useCallback(async (type = null) => {
        if (isDemo) {
            if (type) {
                return demoLoans.filter(l => l.type === type)
            }
            return demoLoans
        }
        return db.getLoans(type)
    }, [isDemo])

    const getLoanById = useCallback(async (id) => {
        if (isDemo) {
            return getDemoLoanById(id)
        }
        return db.getLoanById(id)
    }, [isDemo])

    const getPaymentsByLoanId = useCallback(async (loanId) => {
        if (isDemo) {
            return getDemoPaymentsByLoanId(loanId)
        }
        return db.getPaymentsByLoanId(loanId)
    }, [isDemo])

    // ============ FINANCE SCHEMES ============

    const getFinanceSchemes = useCallback(async () => {
        if (isDemo) {
            return demoFinanceSchemes
        }
        return db.getFinanceSchemes()
    }, [isDemo])

    const getFinanceSchemeById = useCallback(async (id) => {
        if (isDemo) {
            return getDemoSchemeById(id)
        }
        return db.getFinanceSchemeById(id)
    }, [isDemo])

    // ============ DASHBOARD ============

    const getDashboardSummary = useCallback(async () => {
        if (isDemo) {
            const totals = getDemoTotals()
            const loansGiven = demoLoans.filter(l => l.type === 'GIVEN')
            const loansTaken = demoLoans.filter(l => l.type === 'TAKEN')
            const schemes = demoFinanceSchemes

            return {
                netWorth: totals.netWorth,
                totalAssets: totals.totalAssets,
                totalLiabilities: totals.totalLiabilities,
                loansGiven: {
                    total: loansGiven.reduce((s, l) => s + Number(l.principal), 0),
                    activeCount: loansGiven.filter(l => l.status === 'ACTIVE').length
                },
                loansTaken: {
                    total: loansTaken.reduce((s, l) => s + Number(l.principal), 0),
                    activeCount: loansTaken.filter(l => l.status === 'ACTIVE').length
                },
                financeSchemes: {
                    total: schemes.reduce((s, f) => s + Number(f.principal), 0),
                    activeCount: schemes.filter(s => s.status === 'ACTIVE').length
                }
            }
        }
        return db.getDashboardSummary()
    }, [isDemo])

    // ============ NET WORTH HISTORY ============

    const getNetWorthHistory = useCallback(async (days = 30) => {
        if (isDemo) {
            // Filter demo history based on days
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - days)
            return demoNetWorthHistory.filter(h => new Date(h.date) >= cutoff)
        }
        return db.getNetWorthHistory(days)
    }, [isDemo])

    // ============ NOTIFICATIONS ============

    const getAllNotifications = useCallback(async (limit = 50) => {
        if (isDemo) {
            return demoNotifications.slice(0, limit)
        }
        return notifications.getAllNotifications(limit)
    }, [isDemo])

    const getUnreadNotifications = useCallback(async () => {
        if (isDemo) {
            return demoNotifications.filter(n => !n.is_read)
        }
        return notifications.getUnreadNotifications()
    }, [isDemo])

    const getUnreadCount = useCallback(async () => {
        if (isDemo) {
            return demoNotifications.filter(n => !n.is_read).length
        }
        return notifications.getUnreadCount()
    }, [isDemo])

    // ============ PRICE TRACKING ============

    const getPriceHistory = useCallback(async (metal) => {
        if (isDemo) {
            return getDemoPriceHistory(metal)
        }
        // Import dynamically to avoid circular deps
        const { getPriceHistory } = await import('@/lib/priceTracking')
        return getPriceHistory(metal)
    }, [isDemo])

    // ============ WRITE OPERATIONS (disabled in demo mode) ============

    const demoWriteNoOp = async () => {
        console.log('Demo mode: Write operations are disabled. Sign in to save data.')
        return null
    }

    return {
        isDemo,
        authLoading,

        // Read functions (work in demo mode)
        getAssets,
        getAssetById,
        getLoans,
        getLoanById,
        getPaymentsByLoanId,
        getFinanceSchemes,
        getFinanceSchemeById,
        getDashboardSummary,
        getNetWorthHistory,
        getAllNotifications,
        getUnreadNotifications,
        getUnreadCount,
        getPriceHistory,

        // Write functions (disabled in demo mode)
        createAsset: isDemo ? demoWriteNoOp : db.createAsset,
        updateAsset: isDemo ? demoWriteNoOp : db.updateAsset,
        deleteAsset: isDemo ? demoWriteNoOp : db.deleteAsset,
        createLoan: isDemo ? demoWriteNoOp : db.createLoan,
        updateLoan: isDemo ? demoWriteNoOp : db.updateLoan,
        deleteLoan: isDemo ? demoWriteNoOp : db.deleteLoan,
        createPayment: isDemo ? demoWriteNoOp : db.createPayment,
        createFinanceScheme: isDemo ? demoWriteNoOp : db.createFinanceScheme,
        updateFinanceScheme: isDemo ? demoWriteNoOp : db.updateFinanceScheme,
        deleteFinanceScheme: isDemo ? demoWriteNoOp : db.deleteFinanceScheme,
        saveNetWorthSnapshot: isDemo ? demoWriteNoOp : db.saveNetWorthSnapshot,
    }
}
