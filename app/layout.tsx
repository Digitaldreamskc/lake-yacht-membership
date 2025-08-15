import './globals.css'
import { Inter } from 'next/font/google'
import { PrivyWrapper } from '@/components/privy-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lake Stockton Yacht Club - Exclusive Digital Membership',
  description: 'Join an exclusive community where digital innovation meets timeless luxury. Experience seamless NFT membership with NFC integration.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <PrivyWrapper>
          <div className="min-h-screen bg-white">
            {/* Luxury Header - Minimal & Refined */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200 transition-all duration-300">
              <div className="luxury-container">
                <div className="flex items-center justify-between h-20">
                  
                  {/* Logo - Refined & Minimal */}
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-neutral-900 rounded-sm"></div>
                    <span className="text-xl font-light text-neutral-900 tracking-wide">
                      Lake Stockton
                    </span>
                  </div>
                  
                  {/* Navigation - Elegant & Subtle */}
                  <nav className="hidden md:flex items-center space-x-12">
                    <a 
                      href="/" 
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200 uppercase tracking-wider font-light"
                    >
                      Home
                    </a>
                    <a 
                      href="/real-world" 
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200 uppercase tracking-wider font-light"
                    >
                      Real-World Interface
                    </a>
                    <a 
                      href="/member-portal" 
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200 uppercase tracking-wider font-light"
                    >
                      Member Portal
                    </a>
                    <a 
                      href="/admin" 
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200 uppercase tracking-wider font-light"
                    >
                      Admin
                    </a>
                  </nav>
                  
                  {/* Mobile Menu Button - Minimal */}
                  <button className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200">
                    <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                      <div className="w-4 h-0.5 bg-current"></div>
                      <div className="w-4 h-0.5 bg-current"></div>
                      <div className="w-4 h-0.5 bg-current"></div>
                    </div>
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content with Header Spacing */}
            <main className="pt-20">
              {children}
            </main>

            {/* Luxury Footer - Sophisticated & Minimal */}
            <footer className="bg-neutral-50 border-t border-neutral-200">
              <div className="luxury-container">
                <div className="py-20">
                  
                  {/* Footer Content - Elegant Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
                    
                    {/* Company Info */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-neutral-900 rounded-sm"></div>
                        <span className="text-xl font-light text-neutral-900 tracking-wide">
                          Lake Stockton
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed max-w-xs">
                        Where digital innovation meets timeless luxury. 
                        Experience exclusive membership redefined.
                      </p>
                    </div>
                    
                    {/* Quick Links */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-light text-neutral-800 uppercase tracking-wider">
                        Quick Links
                      </h3>
                      <div className="space-y-3">
                        <a 
                          href="/real-world" 
                          className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
                        >
                          Real-World Interface
                        </a>
                        <a 
                          href="/member-portal" 
                          className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
                        >
                          Member Portal
                        </a>
                        <a 
                          href="/admin" 
                          className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
                        >
                          Admin Dashboard
                        </a>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-light text-neutral-800 uppercase tracking-wider">
                        Contact
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm text-neutral-600">
                          info@lakestocktonyachtclub.com
                        </p>
                        <p className="text-sm text-neutral-600">
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Divider */}
                  <div className="luxury-divider"></div>
                  
                  {/* Bottom Footer - Minimal */}
                  <div className="flex flex-col md:flex-row items-center justify-between pt-8">
                    <p className="text-xs text-neutral-500 text-center md:text-left">
                      © 2024 Lake Stockton Yacht Club. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-8 mt-4 md:mt-0">
                      <a 
                        href="#" 
                        className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                      >
                        Privacy Policy
                      </a>
                      <a 
                        href="#" 
                        className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                      >
                        Terms of Service
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </PrivyWrapper>
      </body>
    </html>
  )
}