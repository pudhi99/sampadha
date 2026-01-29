import { supabase } from './supabase'

// ============ ASSETS ============

export async function getAssets(type = null) {
    let query = supabase.from('assets').select('*').order('created_at', { ascending: false })

    if (type) {
        query = query.eq('type', type)
    }

    const { data, error } = await query
    if (error) throw error
    return data
}

export async function getAssetById(id) {
    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function createAsset(asset) {
    const { data, error } = await supabase
        .from('assets')
        .insert([asset])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateAsset(id, updates) {
    const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteAsset(id) {
    const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}

// ============ LOANS ============

export async function getLoans(type = null) {
    let query = supabase.from('loans').select('*').order('created_at', { ascending: false })

    if (type) {
        query = query.eq('type', type)
    }

    const { data, error } = await query
    if (error) throw error
    return data
}

export async function getLoanById(id) {
    const { data, error } = await supabase
        .from('loans')
        .select('*, loan_payments(*)')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function createLoan(loan) {
    const { data, error } = await supabase
        .from('loans')
        .insert([loan])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateLoan(id, updates) {
    const { data, error } = await supabase
        .from('loans')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteLoan(id) {
    const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}

// ============ LOAN PAYMENTS ============

export async function getPaymentsByLoanId(loanId) {
    const { data, error } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false })

    if (error) throw error
    return data
}

export async function createPayment(payment) {
    const { data, error } = await supabase
        .from('loan_payments')
        .insert([payment])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deletePayment(id) {
    const { error } = await supabase
        .from('loan_payments')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}

// Alias for consistency
export const createLoanPayment = createPayment

// ============ FINANCE SCHEMES ============

export async function getFinanceSchemes() {
    const { data, error } = await supabase
        .from('finance_schemes')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getFinanceSchemeById(id) {
    const { data, error } = await supabase
        .from('finance_schemes')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function createFinanceScheme(scheme) {
    const { data, error } = await supabase
        .from('finance_schemes')
        .insert([scheme])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateFinanceScheme(id, updates) {
    const { data, error } = await supabase
        .from('finance_schemes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteFinanceScheme(id) {
    const { error } = await supabase
        .from('finance_schemes')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}

// ============ DASHBOARD / SUMMARY ============

export async function getDashboardSummary() {
    // Get all assets
    const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('current_value, type')

    if (assetsError) throw assetsError

    // Get all loans
    const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('principal, type, status, interest_rate')

    if (loansError) throw loansError

    // Get all finance schemes
    const { data: schemes, error: schemesError } = await supabase
        .from('finance_schemes')
        .select('principal, status')

    if (schemesError) throw schemesError

    // Calculate totals
    const totalAssets = assets?.reduce((sum, a) => sum + Number(a.current_value), 0) || 0

    const loansGiven = loans?.filter(l => l.type === 'GIVEN') || []
    const loansTaken = loans?.filter(l => l.type === 'TAKEN') || []

    const totalLoansGiven = loansGiven.reduce((sum, l) => sum + Number(l.principal), 0)
    const totalLoansTaken = loansTaken.reduce((sum, l) => sum + Number(l.principal), 0)
    const activeLoansGiven = loansGiven.filter(l => l.status === 'ACTIVE').length
    const activeLoansTaken = loansTaken.filter(l => l.status === 'ACTIVE').length

    const totalFinanceSchemes = schemes?.reduce((sum, s) => sum + Number(s.principal), 0) || 0

    // Net worth = Assets + Loans Given + Finance Schemes - Loans Taken
    const netWorth = totalAssets + totalLoansGiven + totalFinanceSchemes - totalLoansTaken

    return {
        netWorth,
        totalAssets,
        totalLiabilities: totalLoansTaken,
        loansGiven: {
            total: totalLoansGiven,
            activeCount: activeLoansGiven
        },
        loansTaken: {
            total: totalLoansTaken,
            activeCount: activeLoansTaken
        },
        financeSchemes: {
            total: totalFinanceSchemes,
            activeCount: schemes?.filter(s => s.status === 'ACTIVE').length || 0
        }
    }
}

// ============ NET WORTH HISTORY ============

export async function saveNetWorthSnapshot() {
    const summary = await getDashboardSummary()

    const { data, error } = await supabase
        .from('net_worth_history')
        .insert([{
            net_worth: summary.netWorth,
            total_assets: summary.totalAssets + summary.loansGiven.total + summary.financeSchemes.total,
            total_liabilities: summary.totalLiabilities
        }])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getNetWorthHistory(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
        .from('net_worth_history')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

    if (error) throw error
    return data
}
