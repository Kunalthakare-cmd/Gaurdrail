export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                safe: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
            boxShadow: {
                'soft': '0 4px 12px rgba(0, 0, 0, 0.08)',
            },
        },
    },
    plugins: [],
};
