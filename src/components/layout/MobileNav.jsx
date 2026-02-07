'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Wallet,
    HandCoins,
    BarChart3,
    PlusCircle,
    Target,
} from 'lucide-react'

const navItems = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/assets', label: 'Assets', icon: Wallet },
    { href: '/add', label: 'Add', icon: PlusCircle, isSpecial: true },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border" />

            {/* Navigation items */}
            <div className="relative flex items-center justify-around px-2 py-2 safe-bottom">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href))
                    const Icon = item.icon

                    if (item.isSpecial) {
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    className="relative -mt-6"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg glow-primary">
                                        <Icon className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </motion.div>
                            </Link>
                        )
                    }

                    return (
                        <Link key={item.href} href={item.href} className="flex-1 max-w-[72px]">
                            <motion.div
                                className="flex flex-col items-center gap-1 py-2"
                                whileTap={{ scale: 0.9 }}
                            >
                                <motion.div
                                    className={`
                    p-2 rounded-xl transition-all duration-300
                    ${isActive
                                            ? 'bg-primary/20 text-primary'
                                            : 'text-muted-foreground'
                                        }
                  `}
                                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.div>
                                <span className={`
                  text-[10px] font-medium transition-colors
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}
                `}>
                                    {item.label}
                                </span>

                                {/* Active indicator dot */}
                            </motion.div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
