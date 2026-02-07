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
 * Export data to PDF format (Financial Summary Report)
 * @returns {Promise<void>} Downloads PDF file
 */
export async function exportToPDF() {
    try {
        // Dynamic import to avoid SSR issues
        const { jsPDF } = await import('jspdf')

        const [assets, loansGiven, loansTaken, schemes] = await Promise.all([
            getAssets(),
            getLoans('GIVEN'),
            getLoans('TAKEN'),
            getFinanceSchemes()
        ])

        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        let y = 20

        // Helper to format currency
        const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`

        // Helper to add section title
        const addSectionTitle = (title) => {
            if (y > 250) {
                doc.addPage()
                y = 20
            }
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(30, 64, 175) // Blue
            doc.text(title, 14, y)
            y += 8
            doc.setDrawColor(200, 200, 200)
            doc.line(14, y, pageWidth - 14, y)
            y += 6
        }

        // Helper to add row
        const addRow = (label, value, indent = 0) => {
            if (y > 270) {
                doc.addPage()
                y = 20
            }
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(60, 60, 60)
            doc.text(label, 14 + indent, y)
            doc.setFont('helvetica', 'bold')
            doc.text(value, pageWidth - 14, y, { align: 'right' })
            y += 6
        }

        // Title
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Financial Summary Report', pageWidth / 2, y, { align: 'center' })
        y += 8

        // Date
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`, pageWidth / 2, y, { align: 'center' })
        y += 15

        // Calculate totals
        const totalAssets = (assets || []).reduce((sum, a) => sum + Number(a.current_value || 0), 0)
        const totalLoansGiven = (loansGiven || []).reduce((sum, l) => sum + Number(l.principal || 0), 0)
        const totalLoansTaken = (loansTaken || []).reduce((sum, l) => sum + Number(l.principal || 0), 0)
        const totalSchemes = (schemes || []).reduce((sum, s) => sum + Number(s.principal || 0), 0)
        const netWorth = totalAssets + totalLoansGiven + totalSchemes - totalLoansTaken

        // Summary Box
        doc.setFillColor(245, 247, 250)
        doc.roundedRect(14, y, pageWidth - 28, 40, 3, 3, 'F')
        y += 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Net Worth', 20, y)
        doc.setFontSize(18)
        doc.setTextColor(16, 185, 129) // Green
        doc.text(formatCurrency(netWorth), pageWidth - 20, y, { align: 'right' })
        y += 12
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        doc.text('Total Assets', 20, y)
        doc.text(formatCurrency(totalAssets), 70, y)
        doc.text('Loans Given', 100, y)
        doc.text(formatCurrency(totalLoansGiven), 140, y)
        y += 8
        doc.text('Finance Schemes', 20, y)
        doc.text(formatCurrency(totalSchemes), 70, y)
        doc.text('Loans Taken', 100, y)
        doc.setTextColor(239, 68, 68) // Red
        doc.text(`-${formatCurrency(totalLoansTaken)}`, 140, y)
        y += 20

        // Helper to add table header
        const addTableHeader = (columns, widths) => {
            if (y > 250) {
                doc.addPage()
                y = 20
            }
            doc.setFillColor(240, 242, 245)
            doc.rect(14, y - 4, pageWidth - 28, 8, 'F')
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(80, 80, 80)
            let x = 18
            columns.forEach((col, i) => {
                doc.text(col, x, y)
                x += widths[i]
            })
            y += 8
        }

        // Helper to add table row
        const addTableRow = (values, widths, isAlt = false) => {
            if (y > 270) {
                doc.addPage()
                y = 20
            }
            if (isAlt) {
                doc.setFillColor(250, 250, 250)
                doc.rect(14, y - 4, pageWidth - 28, 7, 'F')
            }
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(50, 50, 50)
            let x = 18
            values.forEach((val, i) => {
                if (i === values.length - 1) {
                    // Right-align last column (usually amount)
                    doc.setFont('helvetica', 'bold')
                    doc.text(String(val), pageWidth - 18, y, { align: 'right' })
                } else {
                    doc.text(String(val).substring(0, 40), x, y) // Truncate long names
                }
                x += widths[i]
            })
            y += 7
        }

        // Assets Section
        if ((assets || []).length > 0) {
            addSectionTitle('Assets')
            addTableHeader(['Name', 'Type', 'Value'], [80, 50, 50])
            assets.forEach((asset, i) => {
                addTableRow([
                    asset.name || 'N/A',
                    asset.type || 'N/A',
                    formatCurrency(asset.current_value)
                ], [80, 50, 50], i % 2 === 1)
            })
            y += 6
        }

        // Loans Given Section  
        if ((loansGiven || []).length > 0) {
            addSectionTitle('Loans Given (You Owe)')
            addTableHeader(['Borrower', 'Status', 'Interest', 'Amount'], [60, 35, 35, 50])
            loansGiven.forEach((loan, i) => {
                addTableRow([
                    loan.borrower_name || 'N/A',
                    loan.status || 'N/A',
                    `${loan.interest_rate || 0}%`,
                    formatCurrency(loan.principal)
                ], [60, 35, 35, 50], i % 2 === 1)
            })
            y += 6
        }

        // Loans Taken Section
        if ((loansTaken || []).length > 0) {
            addSectionTitle('Loans Taken (You Borrowed)')
            addTableHeader(['Lender', 'Status', 'Interest', 'Amount'], [60, 35, 35, 50])
            loansTaken.forEach((loan, i) => {
                addTableRow([
                    loan.borrower_name || 'N/A',
                    loan.status || 'N/A',
                    `${loan.interest_rate || 0}%`,
                    formatCurrency(loan.principal)
                ], [60, 35, 35, 50], i % 2 === 1)
            })
            y += 6
        }

        // Finance Schemes Section
        if ((schemes || []).length > 0) {
            addSectionTitle('Finance Schemes')
            addTableHeader(['Scheme Name', 'Type', 'Principal'], [70, 50, 60])
            schemes.forEach((scheme, i) => {
                addTableRow([
                    scheme.name || 'N/A',
                    scheme.scheme_type || 'N/A',
                    formatCurrency(scheme.principal)
                ], [70, 50, 60], i % 2 === 1)
            })
            y += 6
        }

        // Footer
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text('Generated by Sampadha - Personal Finance Manager', pageWidth / 2, 285, { align: 'center' })

        // Save
        const filename = `sampadha-report-${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(filename)

    } catch (error) {
        console.error('Error exporting to PDF:', error)
        throw new Error('Failed to export PDF: ' + error.message)
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
