/**
 * Interest Calculation Engine for Sampadha
 * Handles simple, compound, and flat interest calculations
 */

/**
 * Calculate simple interest
 * Formula: SI = P × R × T / 100
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate (percentage)
 * @param {number} timeInDays - Time period in days
 * @returns {number} Simple interest amount
 */
export function calculateSimpleInterest(principal, rate, timeInDays) {
    const timeInYears = timeInDays / 365
    return (principal * rate * timeInYears) / 100
}

/**
 * Calculate compound interest
 * Formula: CI = P × (1 + R/100)^T - P
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate (percentage)
 * @param {number} timeInDays - Time period in days
 * @param {number} compoundingFrequency - Times per year (12 for monthly, 4 for quarterly, 1 for yearly)
 * @returns {number} Compound interest amount
 */
export function calculateCompoundInterest(principal, rate, timeInDays, compoundingFrequency = 12) {
    const timeInYears = timeInDays / 365
    const n = compoundingFrequency
    const r = rate / 100
    const amount = principal * Math.pow(1 + r / n, n * timeInYears)
    return amount - principal
}

/**
 * Calculate flat interest (fixed amount regardless of reducing balance)
 * Formula: FI = (P × R × T) / 100 (calculated on full principal, not reducing)
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate (percentage)
 * @param {number} totalMonths - Total loan tenure in months
 * @returns {number} Flat interest amount
 */
export function calculateFlatInterest(principal, rate, totalMonths) {
    const totalYears = totalMonths / 12
    return (principal * rate * totalYears) / 100
}

/**
 * Calculate EMI (Equated Monthly Installment)
 * Formula: EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
 * @param {number} principal - Loan principal
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {number} Monthly EMI amount
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
    if (annualRate === 0) {
        return principal / tenureMonths
    }
    const monthlyRate = annualRate / 12 / 100
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    return emi
}

/**
 * Calculate accrued interest for a loan from start date to today
 * @param {Object} loan - Loan object with principal, interest_rate, interest_type, start_date
 * @returns {number} Accrued interest amount
 */
export function calculateAccruedInterest(loan) {
    const startDate = new Date(loan.start_date)
    const today = new Date()
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))

    if (daysDiff <= 0) return 0

    const principal = Number(loan.principal) || 0
    const rate = Number(loan.interest_rate) || 0

    switch (loan.interest_type) {
        case 'COMPOUND':
            return calculateCompoundInterest(principal, rate, daysDiff)
        case 'FLAT':
            // For flat, estimate based on expected tenure
            const endDate = loan.end_date ? new Date(loan.end_date) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate())
            const totalMonths = Math.max(1, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24 * 30)))
            const totalFlatInterest = calculateFlatInterest(principal, rate, totalMonths)
            const proportion = daysDiff / (totalMonths * 30)
            return totalFlatInterest * Math.min(proportion, 1)
        case 'SIMPLE':
        default:
            return calculateSimpleInterest(principal, rate, daysDiff)
    }
}

/**
 * Calculate total amount due (principal + accrued interest - payments)
 * @param {Object} loan - Loan object
 * @param {Array} payments - Array of payment objects
 * @returns {Object} { totalDue, interestAccrued, principalRemaining, paid }
 */
export function calculateLoanBalance(loan, payments = []) {
    const principal = Number(loan.principal) || 0
    const interestAccrued = calculateAccruedInterest(loan)

    let principalPaid = 0
    let interestPaid = 0

    payments.forEach(payment => {
        const amount = Number(payment.amount) || 0
        if (payment.payment_type === 'PRINCIPAL') {
            principalPaid += amount
        } else if (payment.payment_type === 'INTEREST') {
            interestPaid += amount
        } else {
            // MIXED - split proportionally
            const totalWithInterest = principal + interestAccrued
            if (totalWithInterest > 0) {
                principalPaid += (amount * principal) / totalWithInterest
                interestPaid += (amount * interestAccrued) / totalWithInterest
            }
        }
    })

    const principalRemaining = Math.max(0, principal - principalPaid)
    const interestRemaining = Math.max(0, interestAccrued - interestPaid)
    const totalDue = principalRemaining + interestRemaining
    const totalPaid = principalPaid + interestPaid

    return {
        totalDue,
        interestAccrued,
        interestRemaining,
        principalRemaining,
        totalPaid,
        principalPaid,
        interestPaid
    }
}

/**
 * Determine loan status based on payments and due date
 * @param {Object} loan - Loan object
 * @param {Array} payments - Array of payments
 * @returns {string} Status: 'ACTIVE', 'DELAYED', 'CLOSED', 'DEFAULTED'
 */
export function determineLoanStatus(loan, payments = []) {
    const balance = calculateLoanBalance(loan, payments)

    // If fully paid, status is CLOSED
    if (balance.totalDue <= 0 || balance.principalRemaining <= 0) {
        return 'CLOSED'
    }

    // Check if past due date
    if (loan.end_date) {
        const endDate = new Date(loan.end_date)
        const today = new Date()
        const daysPastDue = Math.floor((today - endDate) / (1000 * 60 * 60 * 24))

        if (daysPastDue > 180) {
            return 'DEFAULTED' // More than 6 months overdue
        }
        if (daysPastDue > 0) {
            return 'DELAYED'
        }
    }

    return 'ACTIVE'
}

/**
 * Calculate expected returns for finance scheme
 * @param {Object} scheme - Finance scheme object
 * @returns {Object} { monthlyReturn, yearlyReturn, totalExpected }
 */
export function calculateSchemeReturns(scheme) {
    const principal = Number(scheme.principal) || 0
    const annualRate = Number(scheme.interest_rate) || 0

    const yearlyReturn = (principal * annualRate) / 100
    const monthlyReturn = yearlyReturn / 12
    const quarterlyReturn = yearlyReturn / 4

    // Calculate total expected based on cycle
    let expectedPerCycle = monthlyReturn
    switch (scheme.payment_cycle) {
        case 'MONTHLY':
            expectedPerCycle = monthlyReturn
            break
        case 'QUARTERLY':
            expectedPerCycle = quarterlyReturn
            break
        case 'YEARLY':
            expectedPerCycle = yearlyReturn
            break
        case 'LUMPSUM':
            expectedPerCycle = yearlyReturn
            break
    }

    return {
        monthlyReturn,
        quarterlyReturn,
        yearlyReturn,
        expectedPerCycle
    }
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {boolean} showSign - Whether to show + or - sign
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, showSign = false) {
    const absAmount = Math.abs(amount)
    let formatted

    if (absAmount >= 10000000) {
        formatted = `₹${(absAmount / 10000000).toFixed(2)} Cr`
    } else if (absAmount >= 100000) {
        formatted = `₹${(absAmount / 100000).toFixed(2)} L`
    } else if (absAmount >= 1000) {
        formatted = `₹${(absAmount / 1000).toFixed(1)}K`
    } else {
        formatted = `₹${absAmount.toFixed(0)}`
    }

    if (showSign && amount !== 0) {
        return amount > 0 ? `+${formatted}` : `-${formatted}`
    }

    return amount < 0 ? `-${formatted}` : formatted
}

/**
 * Format full currency (with commas, Indian numbering)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatFullCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount)
}

/**
 * Calculate days between two dates
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @returns {number} Number of days
 */
export function daysBetween(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.floor((end - start) / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date is overdue
 * @param {Date|string} dueDate 
 * @returns {boolean}
 */
export function isOverdue(dueDate) {
    if (!dueDate) return false
    return new Date() > new Date(dueDate)
}

/**
 * Get days until or past due date
 * @param {Date|string} dueDate 
 * @returns {Object} { days, isPast }
 */
export function getDaysUntilDue(dueDate) {
    if (!dueDate) return { days: null, isPast: false }
    const today = new Date()
    const due = new Date(dueDate)
    const days = Math.floor((due - today) / (1000 * 60 * 60 * 24))
    return {
        days: Math.abs(days),
        isPast: days < 0
    }
}
