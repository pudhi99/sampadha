'use client'

import { motion } from 'framer-motion'
import { Menu, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Wallet,
    HandCoins,
    CreditCard,
    TrendingUp,
    PlusCircle,
    Settings,
    Sparkles,
    FileText,
    Coins,
    Book
} from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { useAuth } from '@/context/AuthContext'

const allNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/assets', label: 'Assets', icon: Wallet },
    { href: '/loans/given', label: 'Loans Given', icon: HandCoins },
    { href: '/loans/taken', label: 'Loans Taken', icon: CreditCard },
    { href: '/finance', label: 'Private Finance', icon: TrendingUp },
    { href: '/prices', label: 'Price Tracker', icon: Coins },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/guide', label: 'Guide', icon: Book },
    { href: '/add', label: 'Add New', icon: PlusCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, isDemo, signOut } = useAuth()

    // Get current page title
    const currentPage = allNavItems.find(
        item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
    )

    const handleSignOut = async () => {
        await signOut()
        router.push('/login')
    }

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
                                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-black/50 border border-white/10">
                                        <Image src="/logo-192.png" alt="Logo" width={40} height={40} className="w-full h-full object-cover p-1" />
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
                                                {isActive && (
                                                    <motion.div
                                                        className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"
                                                        layoutId="mobileSheetActiveIndicator"
                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                    />
                                                )}
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
                    <div className="hidden sm:block">
                        <GlobalSearch />
                    </div>
                    <NotificationBell />

                    {/* User Menu */}
                    {isDemo ? (
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                            <Link href="/login">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign In</span>
                            </Link>
                        </Button>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user?.email}</p>
                                        <p className="text-xs text-muted-foreground">Logged in</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
}
