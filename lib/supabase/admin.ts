import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'


/**
 * Creates a Supabase client with admin privileges (bypasses RLS)
 * ⚠️ ONLY use this in Server Actions, API Routes, or backend code
 * NEVER expose this client on the frontend
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    // Support both new Secret Keys and legacy Service Role Key
    const supabaseKey =
        process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            'Missing Supabase admin credentials. ' +
            'Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in your environment variables.'
        )
    }

    return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
