import { Montserrat } from 'next/font/google';

export const montserrat = Montserrat({
  weight: [
    '300', // Light
    '400', // Regular
    '500', // Medium
    '600', // Semi-Bold
    '700', // Bold
    '900', // Black
  ],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});
