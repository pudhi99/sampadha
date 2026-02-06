/**
 * Chit Fund Calculator Utility
 * 
 * Based on Indian Chit Fund structure:
 * - Chit Value is divided into N monthly installments
 * - Each month, one member wins the pool through auction (bidding)
 * - The discount (bid amount) is distributed as bonus to all members
 * - Early months have higher bonus, so lower actual payment
 * - Last month pays full installment (no bonus)
 */

/**
 * Calculate the complete installment schedule for a chit fund
 * 
 * @param {number} chitValue - Total chit value (e.g., 500000 for 5L)
 * @param {number} durationMonths - Duration in months (e.g., 20)
 * @param {number} commissionPercent - Foreman commission percentage (e.g., 4)
 * @returns {Object} Complete chit schedule with monthly breakdown
 */
export function calculateChitSchedule(chitValue, durationMonths, commissionPercent = 5) {
    const baseInstallment = chitValue / durationMonths
    const totalCommission = chitValue * (commissionPercent / 100)

    // Total dividend pool (what gets distributed as bonus)
    // This is the sum of all bid discounts minus commission
    // Typically, the first bidder gets max discount, last bidder gets minimum
    const maxDiscount = chitValue * 0.30 // ~30% max discount typical
    const minDiscount = chitValue * 0.05 // ~5% min discount at end

    // Calculate the dividend distribution
    // Using arithmetic progression for bonus distribution
    // First month gets highest bonus, last month gets lowest
    const totalBonusPool = chitValue - (baseInstallment * durationMonths) + (chitValue * 0.135)
    // Actually, let's calculate based on the image pattern

    // From the image: 5L chit, 20 months
    // Month 1: Installment 18250, Bonus 6750 (Base 25000 - 6750 = 18250)
    // Month 20: Installment 25000, Bonus 0
    // Total bonus distributed: 67750

    // The bonus decreases linearly from first to last month
    // Sum of bonuses = (first + last) * n / 2 = (6750 + 350) * 20 / 2 = 71000
    // But image shows 67750, so there's a formula

    // Pattern from image:
    // Bonus: 6750, 6400, 6050, 5700, 5350, 5000, 4650, 4300, 3950, 3600,
    //        3250, 2900, 2500, 2100, 1750, 1400, 1050, 700, 350, 0
    // Difference is roughly 350 per month (6750/20 ≈ 337.5)

    const firstBonus = Math.round(baseInstallment * 0.27) // ~27% of base as first bonus
    const bonusDecrement = Math.round(firstBonus / durationMonths)

    const schedule = []
    let totalPayments = 0
    let totalBonus = 0

    for (let month = 1; month <= durationMonths; month++) {
        // Bonus decreases each month
        const bonus = Math.max(0, Math.round(firstBonus - (bonusDecrement * (month - 1))))

        // Bid loss (discount winner gets) - decreases each month
        // First month: max bid loss, last month: min bid loss
        const bidLossPercent = ((durationMonths - month + 1) / durationMonths) * 0.30
        const bidLoss = Math.round(chitValue * bidLossPercent)

        // Amount after loss (what winner receives)
        const amountAfterLoss = chitValue - bidLoss

        // Actual installment = Base - Bonus
        const installment = Math.round(baseInstallment - bonus)

        totalPayments += installment
        totalBonus += bonus

        schedule.push({
            month,
            bidLoss,
            amountAfterLoss,
            bonus,
            installment,
            cumulativePayment: totalPayments
        })
    }

    return {
        chitValue,
        durationMonths,
        commissionPercent,
        baseInstallment,
        schedule,
        summary: {
            totalPayments,
            totalBonus,
            effectiveCost: totalPayments,
            savings: (baseInstallment * durationMonths) - totalPayments
        }
    }
}

/**
 * Calculate a specific chit (like 3L or 5L)
 * Based on actual patterns observed in chit funds
 */
export function getChitPreset(chitValueLakhs, durationMonths = 20) {
    const chitValue = chitValueLakhs * 100000
    const baseInstallment = chitValue / durationMonths

    // Preset patterns based on common chit values
    const presets = {
        '3L': {
            chitValue: 300000,
            durationMonths: 20,
            baseInstallment: 15000,
            commissionPercent: 4,
            // First month bonus is about 27% of base installment
            firstBonus: 4050, // 27% of 15000
            lastBonus: 175
        },
        '5L': {
            chitValue: 500000,
            durationMonths: 20,
            baseInstallment: 25000,
            commissionPercent: 4,
            // From the image
            firstBonus: 6750,
            lastBonus: 350
        },
        '10L': {
            chitValue: 1000000,
            durationMonths: 20,
            baseInstallment: 50000,
            commissionPercent: 5,
            firstBonus: 13500,
            lastBonus: 700
        }
    }

    const key = `${chitValueLakhs}L`
    if (presets[key]) {
        return generateScheduleFromPreset(presets[key])
    }

    // Calculate for custom amounts
    return calculateChitSchedule(chitValue, durationMonths, 5)
}

/**
 * Generate schedule from preset values
 */
function generateScheduleFromPreset(preset) {
    const {
        chitValue,
        durationMonths,
        baseInstallment,
        commissionPercent,
        firstBonus,
        lastBonus
    } = preset

    const bonusDecrement = (firstBonus - lastBonus) / (durationMonths - 1)
    const schedule = []
    let totalPayments = 0
    let totalBonus = 0

    for (let month = 1; month <= durationMonths; month++) {
        // Bonus decreases linearly
        const bonus = month === durationMonths
            ? 0
            : Math.round(firstBonus - (bonusDecrement * (month - 1)))

        // Bid loss calculation (what winner sacrifices)
        const bidLossPercent = ((durationMonths - month + 1) / durationMonths) * 0.31
        const bidLoss = Math.round(chitValue * bidLossPercent)

        // Amount winner receives
        const amountAfterLoss = chitValue - bidLoss

        // Actual payment = Base - Bonus
        const installment = Math.round(baseInstallment - bonus)

        totalPayments += installment
        totalBonus += bonus

        schedule.push({
            month,
            bidLoss,
            amountAfterLoss,
            bonus,
            installment,
            cumulativePayment: totalPayments
        })
    }

    return {
        chitValue,
        durationMonths,
        commissionPercent,
        baseInstallment,
        schedule,
        summary: {
            totalPayments,
            totalBonus,
            effectiveCost: totalPayments,
            savingsOverBase: (baseInstallment * durationMonths) - totalPayments
        }
    }
}

/**
 * Calculate actual payments and returns for a chit fund member
 * @param {Object} chitData - Chit fund data from database
 * @returns {Object} Calculated values
 */
export function calculateChitMemberValue(chitData) {
    const {
        chit_value,
        duration_months,
        commission_percent = 5,
        won_at_month,
        current_month,
        start_date
    } = chitData

    const schedule = calculateChitSchedule(chit_value, duration_months, commission_percent)

    // Calculate how much paid so far
    const monthsPaid = Math.min(
        current_month || Math.floor((new Date() - new Date(start_date)) / (1000 * 60 * 60 * 24 * 30)),
        duration_months
    )

    let totalPaid = 0
    let totalBonusReceived = 0

    for (let i = 0; i < monthsPaid && i < schedule.schedule.length; i++) {
        totalPaid += schedule.schedule[i].installment
        totalBonusReceived += schedule.schedule[i].bonus
    }

    // If won, calculate the return
    let wonAmount = 0
    let netGain = 0

    if (won_at_month && won_at_month <= duration_months) {
        // Amount received when won (after bid discount)
        const wonSchedule = schedule.schedule[won_at_month - 1]
        wonAmount = wonSchedule.amountAfterLoss

        // Calculate net gain/loss at winning point
        const paidTillWin = schedule.schedule
            .slice(0, won_at_month)
            .reduce((sum, s) => sum + s.installment, 0)

        // After winning, still have to pay remaining installments
        const remainingPayments = schedule.schedule
            .slice(won_at_month)
            .reduce((sum, s) => sum + s.installment, 0)

        netGain = wonAmount - paidTillWin - remainingPayments
    }

    return {
        schedule: schedule.schedule,
        monthsPaid,
        totalPaid,
        totalBonusReceived,
        pendingMonths: duration_months - monthsPaid,
        pendingAmount: schedule.summary.totalPayments - totalPaid,
        wonAmount,
        netGain,
        summary: schedule.summary
    }
}

export default {
    calculateChitSchedule,
    getChitPreset,
    calculateChitMemberValue
}
