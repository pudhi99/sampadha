'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Wallet,
    HandCoins,
    CreditCard,
    TrendingUp,
    PlusCircle,
    Settings,
    Sparkles,
    BarChart3,
    Coins,
    Book,
    Target
} from 'lucide-react'

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/assets', label: 'Assets', icon: Wallet },
    { href: '/loans/given', label: 'Loans Given', icon: HandCoins },
    { href: '/loans/taken', label: 'Loans Taken', icon: CreditCard },
    { href: '/finance', label: 'Finance', icon: TrendingUp },
    { href: '/prices', label: 'Prices', icon: Coins },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/guide', label: 'Guide', icon: Book },
    { href: '/add', label: 'Add New', icon: PlusCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-sidebar border-r border-sidebar-border">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-black/50 border border-white/10">
                        <Image src="/logo-192.png" alt="Logo" width={40} height={40} className="w-full h-full object-cover p-1" />
                    </div>
                    <span className="text-xl font-bold gradient-text">Sampadha</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href))
                    const Icon = item.icon

                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={item.href}>
                                <motion.div
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-lg glow-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }
                  `}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"
                                            layoutId="activeIndicator"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        </motion.div>
                    )
                })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-sidebar-border">
                <div className="glass-card rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-2">Your Net Worth</p>
                    <p className="text-2xl font-bold gradient-text">₹0</p>
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Track your wealth
                    </p>
                </div>
            </div>
        </aside>
    )
}
