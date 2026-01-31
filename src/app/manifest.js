
export default function manifest() {
    return {
        name: 'Sampadha - Personal Finance',
        short_name: 'Sampadha',
        description: 'Track your assets, loans, and net worth',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/logo-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
