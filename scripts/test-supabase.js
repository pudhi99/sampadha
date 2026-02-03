
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cqurahndhvcmvrvqhsfq.supabase.co';
const supabaseKey = 'sb_publishable_pw0CppTAkb17emYpobA4XA_gkhmdEwn';

async function testConnection() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey);

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Try to select from a table that should exist, e.g., 'assets' or just check auth
        // and added the git commits
        const { data, error } = await supabase.from('assets').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection Failed:', error);
        } else {
            console.log('Connection Successful!');
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

testConnection();
