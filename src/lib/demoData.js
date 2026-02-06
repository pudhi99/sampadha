/**
 * Demo Data for unauthenticated users
 * Shows comprehensive sample data to demonstrate all app features
 */

// ============ ASSETS ============
export const demoAssets = [
    // Cash & Bank
    {
        id: 'demo-asset-1',
        name: 'HDFC Savings Account',
        type: 'CASH',
        current_value: 185000,
        purchase_value: 185000,
        description: 'Primary savings account with 3.5% interest',
        created_at: '2024-01-15T10:00:00Z'
    },
    {
        id: 'demo-asset-2',
        name: 'SBI Fixed Deposit',
        type: 'CASH',
        current_value: 500000,
        purchase_value: 450000,
        description: '1 year FD at 7.1% interest',
        created_at: '2024-03-01T10:00:00Z'
    },
    {
        id: 'demo-asset-3',
        name: 'Emergency Fund - ICICI',
        type: 'CASH',
        current_value: 250000,
        purchase_value: 250000,
        description: '6 months expenses reserve',
        created_at: '2024-02-10T10:00:00Z'
    },

    // Gold
    {
        id: 'demo-asset-4',
        name: 'Gold Chain 22K - 25g',
        type: 'GOLD',
        current_value: 187500,
        purchase_value: 150000,
        weight_grams: 25,
        purity: 22,
        description: "Wife's wedding chain",
        created_at: '2022-05-20T10:00:00Z'
    },
    {
        id: 'demo-asset-5',
        name: 'Gold Ring 22K - 8g',
        type: 'GOLD',
        current_value: 60000,
        purchase_value: 48000,
        weight_grams: 8,
        purity: 22,
        description: 'Anniversary gift',
        created_at: '2023-11-15T10:00:00Z'
    },
    {
        id: 'demo-asset-6',
        name: 'Gold Coins 24K - 50g',
        type: 'GOLD',
        current_value: 385000,
        purchase_value: 320000,
        weight_grams: 50,
        purity: 24,
        description: 'Investment gold - 5 x 10g coins',
        created_at: '2023-06-01T10:00:00Z'
    },
    {
        id: 'demo-asset-7',
        name: 'Gold Bangles 22K - 40g',
        type: 'GOLD',
        current_value: 300000,
        purchase_value: 260000,
        weight_grams: 40,
        purity: 22,
        description: 'Traditional bangles set',
        created_at: '2021-10-10T10:00:00Z'
    },

    // Investments
    {
        id: 'demo-asset-8',
        name: 'NIFTY 50 Index Fund',
        type: 'INVESTMENT',
        current_value: 350000,
        purchase_value: 280000,
        description: 'Monthly SIP ₹10,000 since 2022',
        created_at: '2022-01-01T10:00:00Z'
    },
    {
        id: 'demo-asset-9',
        name: 'Axis Bluechip Fund',
        type: 'INVESTMENT',
        current_value: 225000,
        purchase_value: 200000,
        description: 'Large cap mutual fund SIP',
        created_at: '2023-03-15T10:00:00Z'
    },
    {
        id: 'demo-asset-10',
        name: 'Parag Parikh Flexi Cap',
        type: 'INVESTMENT',
        current_value: 180000,
        purchase_value: 150000,
        description: 'Flexi cap fund - lump sum',
        created_at: '2023-07-01T10:00:00Z'
    },
    {
        id: 'demo-asset-11',
        name: 'Reliance Industries Stock',
        type: 'INVESTMENT',
        current_value: 125000,
        purchase_value: 100000,
        description: '50 shares @ ₹2000 avg',
        created_at: '2023-09-01T10:00:00Z'
    },
    {
        id: 'demo-asset-12',
        name: 'TCS Stock',
        type: 'INVESTMENT',
        current_value: 95000,
        purchase_value: 85000,
        description: '25 shares @ ₹3400 avg',
        created_at: '2024-01-10T10:00:00Z'
    },

    // Physical Assets
    {
        id: 'demo-asset-13',
        name: 'Apartment - Hyderabad',
        type: 'PHYSICAL',
        category: 'PROPERTY',
        current_value: 5500000,
        purchase_value: 4200000,
        is_liability: false,
        description: '2BHK in Kondapur - 1200 sq ft',
        created_at: '2020-06-15T10:00:00Z'
    },
    {
        id: 'demo-asset-14',
        name: 'Honda City 2022',
        type: 'PHYSICAL',
        category: 'VEHICLE',
        current_value: 950000,
        purchase_value: 1200000,
        is_liability: false,
        description: 'ZX Petrol - 25000 km driven',
        created_at: '2022-03-01T10:00:00Z'
    },
    {
        id: 'demo-asset-15',
        name: 'Plot - Vizag',
        type: 'PHYSICAL',
        category: 'LAND',
        current_value: 1800000,
        purchase_value: 1200000,
        is_liability: false,
        description: '200 sq yards in Madhurawada',
        created_at: '2021-08-01T10:00:00Z'
    }
]

// ============ LOANS ============
export const demoLoans = [
    // Loans Given
    {
        id: 'demo-loan-1',
        party_name: 'Ramesh Kumar',
        type: 'GIVEN',
        principal: 75000,
        interest_rate: 12,
        interest_type: 'simple',
        start_date: '2024-06-15',
        end_date: '2025-06-15',
        status: 'ACTIVE',
        notes: 'Personal loan for medical emergency',
        created_at: '2024-06-15T10:00:00Z'
    },
    {
        id: 'demo-loan-2',
        party_name: 'Suresh Reddy',
        type: 'GIVEN',
        principal: 150000,
        interest_rate: 15,
        interest_type: 'simple',
        start_date: '2024-03-01',
        end_date: '2025-03-01',
        status: 'ACTIVE',
        notes: 'Business loan - gold ornaments as security',
        created_at: '2024-03-01T10:00:00Z'
    },
    {
        id: 'demo-loan-3',
        party_name: 'Venkat Rao',
        type: 'GIVEN',
        principal: 50000,
        interest_rate: 0,
        interest_type: 'simple',
        start_date: '2024-10-01',
        end_date: '2025-01-01',
        status: 'ACTIVE',
        notes: 'Interest-free loan to relative',
        created_at: '2024-10-01T10:00:00Z'
    },
    {
        id: 'demo-loan-4',
        party_name: 'Lakshmi Devi',
        type: 'GIVEN',
        principal: 100000,
        interest_rate: 10,
        interest_type: 'simple',
        start_date: '2023-12-01',
        end_date: '2024-12-01',
        status: 'PAID',
        notes: 'Home renovation loan - fully repaid',
        created_at: '2023-12-01T10:00:00Z'
    },

    // Loans Taken
    {
        id: 'demo-loan-5',
        party_name: 'SBI Home Loan',
        type: 'TAKEN',
        principal: 2500000,
        interest_rate: 8.5,
        interest_type: 'emi',
        emi_amount: 24500,
        start_date: '2020-06-01',
        end_date: '2040-06-01',
        status: 'ACTIVE',
        notes: 'Home loan for Kondapur apartment - 20 year tenure',
        created_at: '2020-06-01T10:00:00Z'
    },
    {
        id: 'demo-loan-6',
        party_name: 'HDFC Car Loan',
        type: 'TAKEN',
        principal: 800000,
        interest_rate: 9.25,
        interest_type: 'emi',
        emi_amount: 17200,
        start_date: '2022-03-01',
        end_date: '2027-03-01',
        status: 'ACTIVE',
        notes: 'Honda City car loan - 5 year tenure',
        created_at: '2022-03-01T10:00:00Z'
    },
    {
        id: 'demo-loan-7',
        party_name: 'Personal Loan - ICICI',
        type: 'TAKEN',
        principal: 300000,
        interest_rate: 11,
        interest_type: 'emi',
        emi_amount: 9800,
        start_date: '2024-01-01',
        end_date: '2027-01-01',
        status: 'ACTIVE',
        notes: 'Home renovation and furniture',
        created_at: '2024-01-01T10:00:00Z'
    }
]

// ============ LOAN PAYMENTS ============
export const demoPayments = [
    // Loan 1: Ramesh Kumar (Quarterly Interest)
    { id: 'demo-pay-1-1', loan_id: 'demo-loan-1', amount: 2250, payment_date: '2024-09-15', payment_type: 'INTEREST', notes: 'First Quarter Interest' },
    { id: 'demo-pay-1-2', loan_id: 'demo-loan-1', amount: 2250, payment_date: '2024-12-15', payment_type: 'INTEREST', notes: 'Second Quarter Interest' },

    // Loan 2: Suresh Reddy (Monthly Interest)
    { id: 'demo-pay-2-1', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-04-01', payment_type: 'INTEREST', notes: 'March Interest' },
    { id: 'demo-pay-2-2', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-05-01', payment_type: 'INTEREST', notes: 'April Interest' },
    { id: 'demo-pay-2-3', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-06-01', payment_type: 'INTEREST', notes: 'May Interest' },
    { id: 'demo-pay-2-4', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-07-01', payment_type: 'INTEREST', notes: 'June Interest' },
    { id: 'demo-pay-2-5', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-08-01', payment_type: 'INTEREST', notes: 'July Interest' },
    { id: 'demo-pay-2-6', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-09-01', payment_type: 'INTEREST', notes: 'August Interest' },
    { id: 'demo-pay-2-7', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-10-01', payment_type: 'INTEREST', notes: 'September Interest' },
    { id: 'demo-pay-2-8', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-11-01', payment_type: 'INTEREST', notes: 'October Interest' },
    { id: 'demo-pay-2-9', loan_id: 'demo-loan-2', amount: 1875, payment_date: '2024-12-01', payment_type: 'INTEREST', notes: 'November Interest' },
    { id: 'demo-pay-2-10', loan_id: 'demo-loan-2', amount: 15000, payment_date: '2025-01-01', payment_type: 'PRINCIPAL', notes: 'Partial Principal Repayment' },

    // Loan 4: Lakshmi Devi (Fully Paid)
    { id: 'demo-pay-4-1', loan_id: 'demo-loan-4', amount: 10000, payment_date: '2024-01-01', payment_type: 'INTEREST', notes: 'Yearly Interest Paid' },
    { id: 'demo-pay-4-2', loan_id: 'demo-loan-4', amount: 50000, payment_date: '2024-06-01', payment_type: 'PRINCIPAL', notes: 'Half Principal Returned' },
    { id: 'demo-pay-4-3', loan_id: 'demo-loan-4', amount: 50000, payment_date: '2024-12-01', payment_type: 'PRINCIPAL', notes: 'Final Settlement' },

    // Loan 5: SBI Home Loan (EMIs)
    { id: 'demo-pay-5-1', loan_id: 'demo-loan-5', amount: 24500, payment_date: '2024-08-05', payment_type: 'EMI', notes: 'August EMI' },
    { id: 'demo-pay-5-2', loan_id: 'demo-loan-5', amount: 24500, payment_date: '2024-09-05', payment_type: 'EMI', notes: 'September EMI' },
    { id: 'demo-pay-5-3', loan_id: 'demo-loan-5', amount: 24500, payment_date: '2024-10-05', payment_type: 'EMI', notes: 'October EMI' },
    { id: 'demo-pay-5-4', loan_id: 'demo-loan-5', amount: 24500, payment_date: '2024-11-05', payment_type: 'EMI', notes: 'November EMI' },
    { id: 'demo-pay-5-5', loan_id: 'demo-loan-5', amount: 24500, payment_date: '2024-12-05', payment_type: 'EMI', notes: 'December EMI' },
    { id: 'demo-pay-5-6', loan_id: 'demo-loan-5', amount: 24500, payment_date: '2025-01-05', payment_type: 'EMI', notes: 'January EMI' },

    // Loan 6: HDFC Car Loan (EMIs)
    { id: 'demo-pay-6-1', loan_id: 'demo-loan-6', amount: 17200, payment_date: '2024-10-10', payment_type: 'EMI', notes: 'October EMI' },
    { id: 'demo-pay-6-2', loan_id: 'demo-loan-6', amount: 17200, payment_date: '2024-11-10', payment_type: 'EMI', notes: 'November EMI' },
    { id: 'demo-pay-6-3', loan_id: 'demo-loan-6', amount: 17200, payment_date: '2024-12-10', payment_type: 'EMI', notes: 'December EMI' },
    { id: 'demo-pay-6-4', loan_id: 'demo-loan-6', amount: 17200, payment_date: '2025-01-10', payment_type: 'EMI', notes: 'January EMI' },

    // Loan 7: Personal Loan (EMIs)
    { id: 'demo-pay-7-1', loan_id: 'demo-loan-7', amount: 9800, payment_date: '2024-11-15', payment_type: 'EMI', notes: 'November EMI' },
    { id: 'demo-pay-7-2', loan_id: 'demo-loan-7', amount: 9800, payment_date: '2024-12-15', payment_type: 'EMI', notes: 'December EMI' },
    { id: 'demo-pay-7-3', loan_id: 'demo-loan-7', amount: 9800, payment_date: '2025-01-15', payment_type: 'EMI', notes: 'January EMI' }
]

// ============ FINANCE SCHEMES (INVESTMENTS) ============
export const demoFinanceSchemes = [
    // Chit Fund - 5L (Variable installments: Month 1: ₹18,250 → Month 20: ₹25,000)
    {
        id: 'demo-scheme-1',
        name: 'Lakshmi Mahila Chit - 5 Lakhs',
        scheme_type: 'CHIT_FUND',
        principal: 500000,
        chit_value: 500000,
        duration_months: 20,
        commission_percent: 4,
        won_at_month: 8,
        current_month: 10,
        interest_rate: 0,
        start_date: '2024-05-01',
        status: 'ACTIVE',
        risk_level: 'MEDIUM',
        notes: 'Foreman: Srinivas. Won at month 8 (got ₹3,87,000). Installments: ₹18,250→₹25,000',
        created_at: '2024-05-01T10:00:00Z'
    },
    // Chit Fund - 3L (Variable installments: Month 1: ₹10,950 → Month 20: ₹15,000)
    {
        id: 'demo-scheme-1b',
        name: 'Ganesh Chit Fund - 3 Lakhs',
        scheme_type: 'CHIT_FUND',
        principal: 300000,
        chit_value: 300000,
        duration_months: 20,
        commission_percent: 4,
        won_at_month: null,
        current_month: 6,
        interest_rate: 0,
        start_date: '2024-08-01',
        status: 'ACTIVE',
        risk_level: 'MEDIUM',
        notes: 'Foreman: Ramesh. Installments: ₹10,950→₹15,000. Planning to bid at month 10.',
        created_at: '2024-08-01T10:00:00Z'
    },
    {
        id: 'demo-scheme-2',
        name: 'Sri Venkateshwara Chit - 10 Lakhs',
        scheme_type: 'CHIT_FUND',
        principal: 1000000,
        chit_value: 1000000,
        duration_months: 20,
        commission_percent: 5,
        won_at_month: null,
        current_month: 5,
        interest_rate: 0,
        start_date: '2024-09-01',
        status: 'ACTIVE',
        risk_level: 'MEDIUM',
        notes: 'Installments: ₹36,500→₹50,000. Planning to bid at month 8.',
        created_at: '2024-09-01T10:00:00Z'
    },
    // Post Office FD
    {
        id: 'demo-scheme-3',
        name: 'Post Office FD - Education',
        scheme_type: 'POST_OFFICE_FD',
        principal: 200000,
        interest_rate: 7.5,
        tenure: '5',
        account_number: 'POFD2024001234',
        branch: 'Kondapur Head Post Office',
        start_date: '2024-01-15',
        status: 'ACTIVE',
        risk_level: 'LOW',
        payment_cycle: 'YEARLY',
        notes: '5 year FD for child education. Tax benefit u/s 80C.',
        created_at: '2024-01-15T10:00:00Z'
    },
    // Post Office RD
    {
        id: 'demo-scheme-4',
        name: 'Post Office RD - Monthly Saving',
        scheme_type: 'POST_OFFICE_RD',
        principal: 300000,
        monthly_amount: 5000,
        interest_rate: 6.7,
        account_number: 'PORD2023005678',
        branch: 'Madhapur Post Office',
        start_date: '2023-04-01',
        status: 'ACTIVE',
        risk_level: 'LOW',
        payment_cycle: 'MONTHLY',
        notes: '5 year RD. 22 months completed. Maturity: April 2028.',
        created_at: '2023-04-01T10:00:00Z'
    },
    // NSC - National Savings Certificate
    {
        id: 'demo-scheme-5',
        name: 'NSC - Tax Saving',
        scheme_type: 'NSC',
        principal: 150000,
        interest_rate: 7.7,
        account_number: 'NSC2023INV001',
        branch: 'Gachibowli Post Office',
        start_date: '2023-03-28',
        status: 'ACTIVE',
        risk_level: 'LOW',
        payment_cycle: 'LUMPSUM',
        notes: 'Invested for tax saving. 5 year lock-in. Maturity: March 2028.',
        created_at: '2023-03-28T10:00:00Z'
    },
    // KVP - Kisan Vikas Patra
    {
        id: 'demo-scheme-6',
        name: 'KVP - Doubles Investment',
        scheme_type: 'KVP',
        principal: 100000,
        interest_rate: 7.5,
        account_number: 'KVP2024DUB001',
        branch: 'Kondapur Post Office',
        start_date: '2024-06-01',
        status: 'ACTIVE',
        risk_level: 'LOW',
        payment_cycle: 'LUMPSUM',
        notes: 'Amount will double in 115 months. Good for long-term goal.',
        created_at: '2024-06-01T10:00:00Z'
    },
    // PPF - Public Provident Fund
    {
        id: 'demo-scheme-7',
        name: 'PPF Account - Retirement',
        scheme_type: 'PPF',
        principal: 450000,
        yearly_deposit: 150000,
        interest_rate: 7.1,
        account_number: 'PPF2020HYD1234',
        branch: 'SBI Madhapur Branch',
        start_date: '2020-04-01',
        status: 'ACTIVE',
        risk_level: 'LOW',
        payment_cycle: 'YEARLY',
        notes: '15 year scheme. 4 years completed. Max deposit ₹1.5L/year.',
        created_at: '2020-04-01T10:00:00Z'
    },
    // Private Finance
    {
        id: 'demo-scheme-8',
        name: 'Ravi Finance Scheme',
        scheme_type: 'PRIVATE_FINANCE',
        principal: 200000,
        interest_rate: 18,
        payment_cycle: 'MONTHLY',
        start_date: '2024-03-01',
        status: 'ACTIVE',
        risk_level: 'HIGH',
        notes: 'High yield investment. Monthly interest payout. 1.5% per month.',
        created_at: '2024-03-01T10:00:00Z'
    },
    {
        id: 'demo-scheme-9',
        name: 'Srinivas Gold Finance',
        scheme_type: 'PRIVATE_FINANCE',
        principal: 150000,
        interest_rate: 15,
        payment_cycle: 'QUARTERLY',
        start_date: '2024-06-15',
        status: 'ACTIVE',
        risk_level: 'MEDIUM',
        notes: 'Secured with gold ornaments. Quarterly interest payment.',
        created_at: '2024-06-15T10:00:00Z'
    },
    // Another Post Office FD with different tenure
    {
        id: 'demo-scheme-10',
        name: 'Post Office FD - Short Term',
        scheme_type: 'POST_OFFICE_FD',
        principal: 100000,
        interest_rate: 6.9,
        tenure: '1',
        account_number: 'POFD2024002345',
        branch: 'Kukatpally Post Office',
        start_date: '2024-09-01',
        status: 'ACTIVE',
        risk_level: 'LOW',
        payment_cycle: 'YEARLY',
        notes: '1 year FD for emergency fund rotation.',
        created_at: '2024-09-01T10:00:00Z'
    }
]

// ============ NET WORTH HISTORY ============
export const demoNetWorthHistory = [
    { date: '2024-02-01', net_worth: 6500000, total_assets: 8500000, total_liabilities: 2000000 },
    { date: '2024-03-01', net_worth: 6650000, total_assets: 8700000, total_liabilities: 2050000 },
    { date: '2024-04-01', net_worth: 6800000, total_assets: 8900000, total_liabilities: 2100000 },
    { date: '2024-05-01', net_worth: 6750000, total_assets: 8800000, total_liabilities: 2050000 },
    { date: '2024-06-01', net_worth: 6900000, total_assets: 9000000, total_liabilities: 2100000 },
    { date: '2024-07-01', net_worth: 7100000, total_assets: 9200000, total_liabilities: 2100000 },
    { date: '2024-08-01', net_worth: 7250000, total_assets: 9400000, total_liabilities: 2150000 },
    { date: '2024-09-01', net_worth: 7400000, total_assets: 9600000, total_liabilities: 2200000 },
    { date: '2024-10-01', net_worth: 7600000, total_assets: 9850000, total_liabilities: 2250000 },
    { date: '2024-11-01', net_worth: 7800000, total_assets: 10100000, total_liabilities: 2300000 },
    { date: '2024-12-01', net_worth: 8000000, total_assets: 10350000, total_liabilities: 2350000 },
    { date: '2025-01-01', net_worth: 8200000, total_assets: 10600000, total_liabilities: 2400000 },
    { date: '2025-01-15', net_worth: 8350000, total_assets: 10800000, total_liabilities: 2450000 },
    { date: '2025-01-31', net_worth: 8500000, total_assets: 11000000, total_liabilities: 2500000 }
]

// ============ NOTIFICATIONS ============
export const demoNotifications = [
    {
        id: 'demo-notif-1',
        title: '📈 Gold Price Update',
        message: 'Gold price increased by ₹180/g (2.4%) to ₹7,680/g',
        type: 'PRICE_ALERT',
        metal: 'GOLD',
        is_read: false,
        created_at: new Date().toISOString()
    },
    {
        id: 'demo-notif-2',
        title: '💰 EMI Payment Due',
        message: 'SBI Home Loan EMI of ₹24,500 due on 5th',
        type: 'REMINDER',
        is_read: false,
        created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'demo-notif-3',
        title: '📉 Silver Price Alert',
        message: 'Silver dropped by ₹2/g (-2.1%) to ₹93/g',
        type: 'PRICE_ALERT',
        metal: 'SILVER',
        is_read: false,
        created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 'demo-notif-4',
        title: '🎉 Net Worth Milestone',
        message: 'Congratulations! Your net worth crossed ₹85 Lakhs',
        type: 'INFO',
        is_read: true,
        created_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
        id: 'demo-notif-5',
        title: '⏰ Chit Payment Reminder',
        message: 'Lakshmi Mahila Chit payment of ₹20,000 due tomorrow',
        type: 'REMINDER',
        is_read: true,
        created_at: new Date(Date.now() - 345600000).toISOString()
    }
]

// ============ PRICE HISTORY ============
export const demoPriceHistory = {
    GOLD: [
        { metal: 'GOLD', price_per_gram: 7500, timestamp: '2025-01-01' },
        { metal: 'GOLD', price_per_gram: 7520, timestamp: '2025-01-08' },
        { metal: 'GOLD', price_per_gram: 7480, timestamp: '2025-01-15' },
        { metal: 'GOLD', price_per_gram: 7550, timestamp: '2025-01-22' },
        { metal: 'GOLD', price_per_gram: 7680, timestamp: '2025-01-31' }
    ],
    SILVER: [
        { metal: 'SILVER', price_per_gram: 92, timestamp: '2025-01-01' },
        { metal: 'SILVER', price_per_gram: 94, timestamp: '2025-01-08' },
        { metal: 'SILVER', price_per_gram: 95, timestamp: '2025-01-15' },
        { metal: 'SILVER', price_per_gram: 93, timestamp: '2025-01-22' },
        { metal: 'SILVER', price_per_gram: 95, timestamp: '2025-01-31' }
    ]
}

// ============ HELPER FUNCTIONS ============

// Calculate demo totals
export function getDemoTotals() {
    const totalAssets = demoAssets.reduce((sum, a) => sum + (a.is_liability ? 0 : Number(a.current_value)), 0)
    const totalLiabilities = demoAssets.reduce((sum, a) => sum + (a.is_liability ? Number(a.current_value) : 0), 0)
    const loansGiven = demoLoans.filter(l => l.type === 'GIVEN' && l.status === 'ACTIVE').reduce((sum, l) => sum + Number(l.principal), 0)
    const loansTaken = demoLoans.filter(l => l.type === 'TAKEN' && l.status === 'ACTIVE').reduce((sum, l) => sum + Number(l.principal), 0)
    const financeTotal = demoFinanceSchemes.filter(s => s.status === 'ACTIVE').reduce((sum, s) => sum + Number(s.principal), 0)

    return {
        totalAssets: totalAssets + loansGiven + financeTotal,
        totalLiabilities: totalLiabilities + loansTaken,
        netWorth: totalAssets + loansGiven + financeTotal - loansTaken
    }
}

// Get demo asset by ID
export function getDemoAssetById(id) {
    return demoAssets.find(a => a.id === id) || null
}

// Get demo loan by ID
export function getDemoLoanById(id) {
    const loan = demoLoans.find(l => l.id === id)
    if (loan) {
        loan.loan_payments = demoPayments.filter(p => p.loan_id === id)
    }
    return loan || null
}

// Get demo finance scheme by ID
export function getDemoSchemeById(id) {
    return demoFinanceSchemes.find(s => s.id === id) || null
}

// Get demo payments by loan ID
export function getDemoPaymentsByLoanId(loanId) {
    return demoPayments.filter(p => p.loan_id === loanId)
}

// Get demo price history
export function getDemoPriceHistory(metal) {
    return demoPriceHistory[metal] || []
}
