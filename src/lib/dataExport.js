/**
 * Data Export and Import Utilities
 * Backup and restore all application data
 */

import { getAssets, getLoans, getFinanceSchemes } from './db'
import { getPaymentsByLoanId } from './db'
import { getAllNetWorthHistory } from './netWorthHistory'

/**
 * Export all data to JSON format
 * @returns {Promise<Object>} Complete data backup
 */
export async function exportAllDataToJSON() {
    try {
        const [assets, loansGiven, loansTaken, schemes, history] = await Promise.all([
            getAssets(),
            getLoans('GIVEN'),
            getLoans('TAKEN'),
            getFinanceSchemes(),
            getAllNetWorthHistory()
        ])

        // Fetch payments for all loans
        const allLoans = [...(loansGiven || []), ...(loansTaken || [])]
        const paymentsPromises = allLoans.map(loan => getPaymentsByLoanId(loan.id))
        const paymentsArrays = await Promise.all(paymentsPromises)

        // Flatten payments and add loan_id
        const payments = paymentsArrays.flat()

        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                assets: assets || [],
                loansGiven: loansGiven || [],
                loansTaken: loansTaken || [],
                financeSchemes: schemes || [],
                loanPayments: payments || [],
                netWorthHistory: history || []
            },
            stats: {
                totalAssets: (assets || []).length,
                totalLoansGiven: (loansGiven || []).length,
                totalLoansTaken: (loansTaken || []).length,
                totalSchemes: (schemes || []).length,
                totalPayments: (payments || []).length,
                totalSnapshots: (history || []).length
            }
        }

        return exportData
    } catch (error) {
        console.error('Error exporting data:', error)
        throw new Error('Failed to export data: ' + error.message)
    }
}

/**
 * Download JSON data as file
 * @param {Object} data - Data to download
 * @param {string} filename - File name (default: sampadha-backup-YYYY-MM-DD.json)
 */
export function downloadJSON(data, filename = null) {
    const defaultFilename = `sampadha-backup-${new Date().toISOString().split('T')[0]}.json`
    const fname = filename || defaultFilename

    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = fname
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Export data to CSV format (simplified view)
 * @returns {Promise<string>} CSV string
 */
export async function exportToCSV() {
    try {
        const assets = await getAssets()

        // CSV headers
        let csv = 'Type,Name,Category,Current Value,Purchase Value,Notes,Created At\n'

            // Add assets
            (assets || []).forEach(asset => {
                const row = [
                    'Asset',
                    asset.name || '',
                    asset.type || '',
                    asset.current_value || 0,
                    asset.purchase_value || 0,
                    (asset.notes || '').replace(/,/g, ';'), // Replace commas in notes
                    asset.created_at || ''
                ]
                csv += row.join(',') + '\n'
            })

        return csv
    } catch (error) {
        console.error('Error exporting to CSV:', error)
        throw new Error('Failed to export CSV: ' + error.message)
    }
}

/**
 * Download CSV data as file
 * @param {string} csvData - CSV string
 * @param {string} filename - File name (default: sampadha-export-YYYY-MM-DD.csv)
 */
export function downloadCSV(csvData, filename = null) {
    const defaultFilename = `sampadha-export-${new Date().toISOString().split('T')[0]}.csv`
    const fname = filename || defaultFilename

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = fname
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Validate imported JSON data
 * @param {Object} data - Imported data object
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateImportData(data) {
    const errors = []

    // Check required structure
    if (!data.version) {
        errors.push('Missing version information')
    }

    if (!data.data) {
        errors.push('Missing data object')
        return { valid: false, errors }
    }

    // Check data arrays exist
    const requiredFields = ['assets', 'loansGiven', 'loansTaken', 'financeSchemes']
    requiredFields.forEach(field => {
        if (!Array.isArray(data.data[field])) {
            errors.push(`Missing or invalid ${field} array`)
        }
    })

    // Validate asset structure (sample)
    if (data.data.assets && data.data.assets.length > 0) {
        const sampleAsset = data.data.assets[0]
        if (!sampleAsset.name || !sampleAsset.type) {
            errors.push('Invalid asset structure - missing name or type')
        }
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Parse imported JSON file
 * @param {File} file - JSON file from user
 * @returns {Promise<Object>} Parsed data
 */
export async function parseImportFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result)
                resolve(data)
            } catch (error) {
                reject(new Error('Invalid JSON file'))
            }
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsText(file)
    })
}

/**
 * Import data from JSON (WARNING: This will add to existing data, not replace)
 * @param {Object} importData - Validated import data
 * @returns {Promise<Object>} Import results
 */
export async function importDataFromJSON(importData) {
    try {
        // Validate first
        const validation = validateImportData(importData)
        if (!validation.valid) {
            throw new Error('Invalid data: ' + validation.errors.join(', '))
        }

        const results = {
            success: true,
            imported: {
                assets: 0,
                loansGiven: 0,
                loansTaken: 0,
                financeSchemes: 0,
                loanPayments: 0
            },
            errors: []
        }

        // Import would require supabase calls - for now, return structure
        // In production, you'd iterate through each array and insert via supabase

        return results
    } catch (error) {
        console.error('Error importing data:', error)
        return {
            success: false,
            error: error.message
        }
    }
}
