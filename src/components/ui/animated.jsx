'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

/**
 * AnimatedNumber - Counts up from 0 to a target value with smooth animation
 */
export function AnimatedNumber({
    value,
    duration = 1.5,
    prefix = '',
    suffix = '',
    formatOptions = { maximumFractionDigits: 0 }
}) {
    const spring = useSpring(0, {
        damping: 30,
        stiffness: 100,
        duration: duration * 1000
    })

    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        spring.set(value)
        return spring.on('change', (v) => {
            setDisplayValue(v)
        })
    }, [spring, value])

    const formatted = new Intl.NumberFormat('en-IN', formatOptions).format(displayValue)

    return (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {prefix}{formatted}{suffix}
        </motion.span>
    )
}

/**
 * AnimatedCurrency - Displays currency with count-up animation
 */
export function AnimatedCurrency({ value, showSign = false }) {
    const absValue = Math.abs(value)

    let suffix = ''
    let displayValue = absValue

    if (absValue >= 10000000) {
        displayValue = absValue / 10000000
        suffix = ' Cr'
    } else if (absValue >= 100000) {
        displayValue = absValue / 100000
        suffix = ' L'
    } else if (absValue >= 1000) {
        displayValue = absValue / 1000
        suffix = 'K'
    }

    const prefix = value < 0 ? '-₹' : (showSign && value > 0 ? '+₹' : '₹')

    return (
        <AnimatedNumber
            value={displayValue}
            prefix={prefix}
            suffix={suffix}
            formatOptions={{
                minimumFractionDigits: suffix ? 2 : 0,
                maximumFractionDigits: suffix ? 2 : 0
            }}
        />
    )
}

/**
 * PulsingDot - Animated indicator dot
 */
export function PulsingDot({ color = 'bg-primary', size = 'w-2 h-2' }) {
    return (
        <span className="relative flex">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
            <span className={`relative inline-flex rounded-full ${size} ${color}`} />
        </span>
    )
}

/**
 * ShimmerCard - Loading skeleton with shimmer effect
 */
export function ShimmerCard({ className = '' }) {
    return (
        <div className={`animate-shimmer rounded-xl bg-gradient-to-r from-card via-accent/20 to-card bg-[length:200%_100%] ${className}`} />
    )
}

/**
 * LoadingSpinner - Animated loading indicator
 */
export function LoadingSpinner({ size = 'w-6 h-6', className = '' }) {
    return (
        <motion.div
            className={`${size} border-2 border-primary/30 border-t-primary rounded-full ${className}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    )
}

/**
 * FadeIn - Fade in animation wrapper
 */
export function FadeIn({ children, delay = 0, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * StaggerChildren - Stagger animation for list items
 */
export function StaggerChildren({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
        >
            {children}
        </motion.div>
    )
}

/**
 * StaggerItem - Individual item in stagger animation
 */
export function StaggerItem({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
        >
            {children}
        </motion.div>
    )
}

/**
 * FloatingElement - Subtle floating animation
 */
export function FloatingElement({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}

/**
 * GlowEffect - Animated glow background
 */
export function GlowEffect({ color = 'primary', className = '' }) {
    return (
        <motion.div
            className={`absolute inset-0 rounded-full bg-${color}/30 blur-xl ${className}`}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
        />
    )
}
