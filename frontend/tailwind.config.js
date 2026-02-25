import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '2rem',
                lg: '4rem',
                xl: '5rem',
                '2xl': '6rem',
            },
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                neon: {
                    cyan: 'oklch(var(--neon-cyan))',
                    blue: 'oklch(var(--neon-blue))',
                    green: 'oklch(var(--neon-green))',
                    purple: 'oklch(var(--neon-purple))',
                    pink: 'oklch(var(--neon-pink))',
                    orange: 'oklch(var(--neon-orange))',
                    red: 'oklch(var(--neon-red))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                'neon-sm': '0 0 15px oklch(var(--neon-cyan) / 0.5)',
                'neon-md': '0 0 30px oklch(var(--neon-blue) / 0.6)',
                'neon-lg': '0 0 45px oklch(var(--neon-purple) / 0.7)',
                'neon-bullish': '0 0 25px oklch(var(--neon-green) / 0.6), 0 0 50px oklch(var(--neon-cyan) / 0.4)',
                'neon-bearish': '0 0 25px oklch(var(--neon-red) / 0.6), 0 0 50px oklch(var(--neon-orange) / 0.4)'
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'pulse-neon': {
                    '0%, 100%': { 
                        opacity: '1',
                        boxShadow: '0 0 20px oklch(var(--neon-cyan) / 0.5)'
                    },
                    '50%': { 
                        opacity: '0.85',
                        boxShadow: '0 0 35px oklch(var(--neon-cyan) / 0.8)'
                    }
                },
                'pulse-bullish': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px oklch(var(--neon-green) / 0.6), 0 0 40px oklch(var(--neon-cyan) / 0.4)'
                    },
                    '50%': {
                        boxShadow: '0 0 30px oklch(var(--neon-green) / 0.8), 0 0 60px oklch(var(--neon-cyan) / 0.6)'
                    }
                },
                'pulse-bearish': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px oklch(var(--neon-red) / 0.6), 0 0 40px oklch(var(--neon-orange) / 0.4)'
                    },
                    '50%': {
                        boxShadow: '0 0 30px oklch(var(--neon-red) / 0.8), 0 0 60px oklch(var(--neon-orange) / 0.6)'
                    }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
                'pulse-bullish': 'pulse-bullish 2s ease-in-out infinite',
                'pulse-bearish': 'pulse-bearish 2s ease-in-out infinite'
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
