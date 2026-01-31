'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({
    user: null,
    session: null,
    loading: true,
    isDemo: true,
    signOut: async () => { },
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
                setUser(session?.user ?? null)
            } catch (error) {
                console.error('Error getting session:', error)
            } finally {
                setLoading(false)
            }
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            setSession(null)
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    const value = {
        user,
        session,
        loading,
        isDemo: !user, // Demo mode when not logged in
        signOut: handleSignOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
