'use client'

import { motion } from 'framer-motion'
import { Bell, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Wallet,
    HandCoins,
    CreditCard,
    TrendingUp,
    PlusCircle,
    Settings,
    Sparkles,
    FileText
} from 'lucide-react'

const allNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/assets', label: 'Assets', icon: Wallet },
    { href: '/loans/given', label: 'Loans Given', icon: HandCoins },
    { href: '/loans/taken', label: 'Loans Taken', icon: CreditCard },
    { href: '/finance', label: 'Private Finance', icon: TrendingUp },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/add', label: 'Add New', icon: PlusCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export function Header() {
    const pathname = usePathname()

    // Get current page title
    const currentPage = allNavItems.find(
        item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
    )

    return (
        <header className="sticky top-0 z-40 w-full">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-border" />

            <div className="relative flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left: Menu (mobile) + Title */}
                <div className="flex items-center gap-3">
                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0">
                            <SheetHeader className="p-6 border-b border-border">
                                <SheetTitle className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <span className="gradient-text">Sampadha</span>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="p-4 space-y-2">
                                {allNavItems.map((item) => {
                                    const isActive = pathname === item.href ||
                                        (item.href !== '/' && pathname.startsWith(item.href))
                                    const Icon = item.icon

                                    return (
                                        <Link key={item.href} href={item.href}>
                                            <div className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                                }
                      `}>
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* Page Title */}
                    <motion.h1
                        key={pathname}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg font-semibold"
                    >
                        {currentPage?.label || 'Sampadha'}
                    </motion.h1>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            {/* Notification dot */}
                            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </header>
    )
}
