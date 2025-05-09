/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['var(--font-merriweather-sans)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
      height: {
        '5.5': '1.375rem',
      },
      width: {
        '5.5': '1.375rem',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			calm: {
  				primary: 'var(--calm-primary)',
  				secondary: 'var(--calm-secondary)'
  			},
  			analysis: {
  				primary: 'var(--analysis-primary)',
  				secondary: 'var(--analysis-secondary)'
  			},
  			alert: {
  				primary: 'var(--alert-primary)',
  				secondary: 'var(--alert-secondary)'
  			},
  			success: {
  				primary: 'var(--success-primary)',
  				secondary: 'var(--success-secondary)'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			},
  			subtlePulse: {
  				'0%': {
  					boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  				},
  				'50%': {
  					boxShadow: '0 2px 3px rgba(0,0,0,0.08)'
  				},
  				'100%': {
  					boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  				}
  			},
  			fadeIn: {
  				from: {
  					opacity: '0',
  					transform: 'translateY(5px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			subtlePulse: 'subtlePulse 5s ease-in-out infinite',
  			fadeIn: 'fadeIn 1.2s ease-out'
  		},
  		sidebar: {
  			DEFAULT: 'hsl(var(--sidebar-background))',
  			foreground: 'hsl(var(--sidebar-foreground))',
  			primary: 'hsl(var(--sidebar-primary))',
  			'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  			accent: 'hsl(var(--sidebar-accent))',
  			'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  			border: 'hsl(var(--sidebar-border))',
  			ring: 'hsl(var(--sidebar-ring))'
  		}
  	}
  },
  plugins: [import("tailwindcss-animate")],
}