/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // 主色调 - 与 App 端保持一致
                primary: '#FAC638',
                'primary-content': '#111817',
                'primary-light': '#FBD35A',
                'primary-dark': '#E5B232',
                // 背景色
                'background-light': '#f8f8f5',
                'background-dark': '#231e0f',
                // 表面色
                'surface-light': '#ffffff',
                'surface-dark': '#1A2C29',
                // 文字色
                'text-main': '#111817',
                'text-muted': '#6b7280',
                // 状态色
                success: '#22c55e',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',
            },
            fontFamily: {
                display: ['Plus Jakarta Sans', 'Noto Sans SC', 'sans-serif'],
                sans: ['Noto Sans SC', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                full: '9999px',
            },
            boxShadow: {
                soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                card: '0 2px 8px rgba(0, 0, 0, 0.04)',
                'card-hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
            },
        },
    },
    plugins: [],
};
