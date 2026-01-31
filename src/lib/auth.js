/**
 * Authentication Helper Functions
 * Uses Supabase Auth for user management
 */

import { supabase } from './supabase'

/**
 * Sign up with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} { user, error }
 */
export async function signUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) throw error
        return { user: data.user, session: data.session, error: null }
    } catch (error) {
        console.error('Sign up error:', error)
        return { user: null, session: null, error: error.message }
    }
}

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} { user, session, error }
 */
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return { user: data.user, session: data.session, error: null }
    } catch (error) {
        console.error('Sign in error:', error)
        return { user: null, session: null, error: error.message }
    }
}

/**
 * Sign out current user
 * @returns {Promise<Object>} { error }
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Sign out error:', error)
        return { error: error.message }
    }
}

/**
 * Get current user
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    } catch (error) {
        console.error('Get user error:', error)
        return null
    }
}

/**
 * Get current session
 * @returns {Promise<Object|null>} Session object or null
 */
export async function getSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    } catch (error) {
        console.error('Get session error:', error)
        return null
    }
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Called with (event, session)
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return () => subscription.unsubscribe()
}

/**
 * Reset password
 * @param {string} email 
 * @returns {Promise<Object>} { error }
 */
export async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Reset password error:', error)
        return { error: error.message }
    }
}
