'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Sidebar, MobileNav, Header } from '@/components/layout'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

// Pages that don't need app layout (auth pages)
const authPages = ['/login', '/signup', '/forgot-password', '/reset-password']

export function AppLayout({ children }) {
    const pathname = usePathname()
    const { isDemo, loading } = useAuth()

    // Don't show app layout on auth pages
    if (authPages.includes(pathname)) {
        return <>{children}</>
    }

    // Show skeleton while loading auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <>
            {/* Demo Mode Banner */}
            <AnimatePresence>
                {isDemo && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gradient-to-r from-primary/20 via-chart-2/20 to-primary/20 border-b border-primary/30"
                    >
                        <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            <span className="text-foreground/80">
                                <strong>Demo Mode</strong> – Viewing sample data.{' '}
                                <a href="/login" className="text-primary underline hover:no-underline">
                                    Sign in
                                </a>{' '}
                                to save your own data.
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="lg:pl-64 min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
        </>
    )
}
