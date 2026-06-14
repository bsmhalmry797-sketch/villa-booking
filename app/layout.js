import { Cairo } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from './context/LanguageContext'
import { Toaster } from 'react-hot-toast'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '900']
})
export const metadata = {
  icons: {
    icon: '/photo9.png',
  },
}
export default function RootLayout({ children }) {  return (
    <html lang="ar">
      <body className={cairo.className}>
        <LanguageProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Cairo, sans-serif',
                fontWeight: '700',
                borderRadius: '12px',
              },
              success: {
                style: {
                  background: '#166534',
                  color: '#fff',
                },
              },
              error: {
                style: {
                  background: '#991b1b',
                  color: '#fff',
                },
              },
            }}
          />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}