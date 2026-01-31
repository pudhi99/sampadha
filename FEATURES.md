# Sampadha - Personal Finance Tracker

## 📋 Project Overview

**Sampadha** (Sanskrit for "wealth/prosperity") is a comprehensive personal finance tracker built with Next.js and Supabase. It helps you track all your assets, loans, investments, and monitor precious metal prices.

---

## 🚀 Features Summary

### Asset Management
| Feature | Description |
|---------|-------------|
| Cash & Bank | Track bank accounts, FDs, cash |
| Gold Tracking | Weight, purity, live price calculation |
| Investments | Stocks, mutual funds, crypto |
| Physical Assets | Property, vehicles, electronics with photos |
| Liability Toggle | Mark items to deduct from net worth |

### Loan Management
| Feature | Description |
|---------|-------------|
| Loans Given | Money lent with interest tracking |
| Loans Taken | Borrowed money and EMIs |
| Payment History | Track all payments made/received |
| Interest Calc | Simple & compound interest |
| Status Tracking | Active, Delayed, Closed |

### Finance Schemes
| Feature | Description |
|---------|-------------|
| Chit Funds | Monthly contributions and returns |
| RD & SIP | Recurring deposits |
| Fixed Deposits | FD tracking with maturity |
| Returns Calculator | Auto-calculate expected returns |

### Price Tracking (NEW)
| Feature | Description |
|---------|-------------|
| Gold Prices | Live gold price per gram (INR) |
| Silver Prices | Live silver tracking |
| Copper Prices | Copper price monitoring |
| Historical Data | Day/Month/Year comparisons |
| Daily Alerts | Notifications at 8 AM & 9 AM |

### Reports & Analytics
| Feature | Description |
|---------|-------------|
| Net Worth Chart | Visual wealth tracking over time |
| Asset Allocation | Pie chart of asset distribution |
| Date Range Filter | 7, 30, 90, 365 day views |
| Snapshot Capture | Save current net worth |

### Tools & Settings
| Feature | Description |
|---------|-------------|
| Global Search | Press ⌘K to search everything |
| Data Export | JSON & CSV download |
| Data Import | Restore from backup |
| Notifications | Bell icon with unread count |
| Dark Theme | Beautiful dark mode |
| Mobile Responsive | Works on all devices |

---

## 📁 Project Structure

```
sampadha/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.js             # Dashboard
│   │   ├── assets/             # Asset management
│   │   ├── loans/given/        # Loans given
│   │   ├── loans/taken/        # Loans taken
│   │   ├── finance/            # Finance schemes
│   │   ├── prices/             # Price tracker
│   │   ├── reports/            # Reports & charts
│   │   ├── settings/           # Settings (export/import)
│   │   ├── guide/              # Features guide
│   │   ├── add/                # Universal add page
│   │   └── api/                # API routes
│   │       ├── prices/         # Metal prices API
│   │       └── cron/           # Cron jobs
│   ├── components/
│   │   ├── ui/                 # Shadcn components
│   │   ├── layout/             # Header, Sidebar, Nav
│   │   ├── assets/             # Asset components
│   │   ├── loans/              # Loan components
│   │   ├── notifications/      # NotificationBell
│   │   └── search/             # GlobalSearch
│   └── lib/
│       ├── supabase.js         # Supabase client
│       ├── db.js               # Database operations
│       ├── calculations.js     # Interest calculations
│       ├── priceTracking.js    # Metal price tracking
│       ├── notifications.js    # Notification system
│       ├── dataExport.js       # Export/Import logic
│       ├── imageUpload.js      # Image upload utility
│       └── netWorthHistory.js  # Net worth tracking
├── supabase/
│   └── schema.sql              # Database schema
├── vercel.json                 # Cron job configuration
└── FEATURES.md                 # This file
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| assets | All assets (cash, gold, investments, physical) |
| loans | Both given and taken loans |
| loan_payments | Payment records for loans |
| finance_schemes | Chit funds, RD, SIP, FD |
| finance_payments | Scheme payment records |
| net_worth_history | Historical net worth snapshots |
| metals_price_history | Daily metal price records |
| notifications | User notifications & alerts |

---

## 🔧 Development Phases

### Phase 1: Foundation ✅
- Next.js 16 + Supabase setup
- Dark theme with CSS variables
- Responsive layout (Sidebar, Header, Mobile Nav)
- Database schema design

### Phase 2: Core CRUD ✅
- Assets CRUD operations
- Loans Given/Taken management
- Finance Schemes tracking
- Universal Add page
- Settings page

### Phase 3: Advanced Logic ✅
- Interest calculations (simple & compound)
- Payment tracking with history
- Reports with Recharts
- Number formatting (L/Cr notation)
- Gold price auto-fetch

### Phase 4: Power Features ✅
- Net worth history tracking
- Data export (JSON/CSV)
- Data import with validation
- Price tracking (Gold/Silver/Copper)
- Notifications system
- Daily price comparisons

### Phase 5: Integration ✅
- NotificationBell in Header
- Prices link in navigation
- Cron API for daily alerts (8 AM, 9 AM IST)
- Vercel cron configuration

### Phase 6: Polish ✅
- Real net worth history from database
- Date range filter (7/30/90/365 days)
- Capture snapshot button
- Physical asset type with categories
- Asset/Liability toggle
- Image upload with preview
- AssetHelpDialog (educational popup)
- Global search (⌘K shortcut)
- Features Guide page (/guide)

---

## 🌐 API Routes

| Route | Purpose |
|-------|---------|
| `/api/prices` | Fetch live metal prices (Gold/Silver/Copper) |
| `/api/cron/daily-prices` | Daily cron job for price alerts |

### Price API Sources (cascade fallback)
1. **GoldPriceZ** - Primary (30-60 req/hr free)
2. **Metals.Dev** - Secondary (100 req/month)
3. **Metals.Live** - Tertiary
4. **Fallback** - Static realistic prices

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open global search |
| `ESC` | Close dialogs/search |

---

## 📱 Page Routes

| Route | Page |
|-------|------|
| `/` | Dashboard |
| `/assets` | Asset management (5 tabs) |
| `/loans/given` | Loans given tracking |
| `/loans/taken` | Loans taken tracking |
| `/finance` | Finance schemes |
| `/prices` | Price tracker |
| `/reports` | Reports & analytics |
| `/guide` | Features guide |
| `/add` | Universal add page |
| `/settings` | Settings (export/import) |

---

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL)
- **UI**: Shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## 📊 Build Stats

- **Pages**: 12
- **API Routes**: 2
- **Components**: 50+
- **Features**: 35+

---

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill Supabase keys
4. Run the database schema: `supabase/schema.sql`
5. Start development: `npm run dev`
6. Open http://localhost:3000

---

**Built with ❤️ using Next.js + Supabase**
