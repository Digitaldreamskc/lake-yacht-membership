'use client'

import { useState } from 'react'
import { ChevronRight, Shield, Zap, Globe, Users, CheckCircle, Clock } from 'lucide-react'

export default function RealWorldPage() {
  const [nfcCardId, setNfcCardId] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerification = async () => {
    if (!nfcCardId.trim()) return
    
    setIsVerifying(true)
    // Mock verification - in real app this would call the smart contract
    setTimeout(() => {
      setVerificationResult({
        isValid: true,
        memberName: 'John Smith',
        tier: 'Standard',
        status: 'Active',
        lastVerified: new Date().toLocaleDateString()
      })
      setIsVerifying(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Luxury & Commanding */}
      <section className="luxury-section-xl bg-neutral-50">
        <div className="luxury-container text-center">
          <div className="animate-fade-up">
            <h1 className="hero-text mb-12 text-neutral-900">
              Digital Meets<br />
              <span className="text-neutral-400">Physical</span>
            </h1>
            
            <p className="subtitle-text max-w-3xl mx-auto leading-relaxed mb-20 text-neutral-600 font-light">
              Experience the future of membership with our revolutionary NFT + NFC card system. 
              Seamlessly bridge the digital and physical worlds for secure, instant access.
            </p>
            
            {/* NFC Verification Interface - Elegant & Functional */}
            <div className="max-w-2xl mx-auto bg-white border border-neutral-200 p-12 rounded-lg">
              <h3 className="text-2xl font-light text-neutral-800 mb-8">NFC Card Verification</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-neutral-600 mb-4 uppercase tracking-wider">
                    NFC Card ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter NFC card identifier"
                    value={nfcCardId}
                    onChange={(e) => setNfcCardId(e.target.value)}
                    className="luxury-input focus-ring"
                  />
                </div>
                
                <button 
                  onClick={handleVerification}
                  disabled={isVerifying || !nfcCardId.trim()}
                  className="luxury-button-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed hover-lift focus-ring"
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Verifying...
                    </div>
                  ) : (
                    <>
                      Verify Membership
                      <ChevronRight className="h-5 w-5 ml-3" />
                    </>
                  )}
                </button>
              </div>
              
              {/* Verification Result - Sophisticated Display */}
              {verificationResult && (
                <div className="mt-8 p-8 border border-neutral-200 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-3 h-3 bg-neutral-600 rounded-full"></div>
                    <span className="text-lg font-light text-neutral-800">Verification Result</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500 uppercase tracking-wider">Status</span>
                      <span className="luxury-status luxury-status-success">Valid</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500 uppercase tracking-wider">Member</span>
                      <span className="text-neutral-700 font-light">{verificationResult.memberName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500 uppercase tracking-wider">Tier</span>
                      <span className="text-neutral-700 font-light">{verificationResult.tier}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500 uppercase tracking-wider">Last Verified</span>
                      <span className="text-neutral-700 font-light">{verificationResult.lastVerified}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits - Sophisticated Layout */}
      <section className="luxury-section">
        <div className="luxury-container">
          <div className="text-center mb-20">
            <h2 className="title-text mb-8 text-neutral-800">Key Benefits</h2>
            <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Our revolutionary system combines blockchain security with physical convenience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-neutral-600" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-neutral-800 mb-3">Blockchain Security</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Immutable verification on Base blockchain ensures authenticity and prevents fraud
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-neutral-600" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-neutral-800 mb-3">Instant Access</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Tap-to-verify technology provides immediate member validation and facility access
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-neutral-600" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-neutral-800 mb-3">Global Reach</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Works anywhere in the world, online or offline, with secure cross-border verification
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-neutral-600" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-neutral-800 mb-3">Member Experience</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Seamless integration between digital and physical identities for premium service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture - Elegant Display */}
      <section className="luxury-section bg-neutral-50">
        <div className="luxury-container">
          <div className="text-center mb-20">
            <h2 className="title-text mb-8 text-neutral-800">Technical Architecture</h2>
            <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              How our sophisticated system works under the hood
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-8 w-8 text-neutral-600" />
              </div>
              <h3 className="text-xl font-light text-neutral-800 mb-4">Smart Contract Layer</h3>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">ERC-721 NFT standard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">NFC card linking functions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Access control mechanisms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Royalty management</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <Zap className="h-8 w-8 text-neutral-600" />
              </div>
              <h3 className="text-xl font-light text-neutral-800 mb-4">NFC Integration</h3>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">ISO 14443 NFC standard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Unique card identification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Real-time verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Secure data transmission</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <Globe className="h-8 w-8 text-neutral-600" />
              </div>
              <h3 className="text-xl font-light text-neutral-800 mb-4">User Interface</h3>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Web3 wallet integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Real-time status updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Cross-platform compatibility</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">Intuitive user experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Applications - Sophisticated Grid */}
      <section className="luxury-section">
        <div className="luxury-container">
          <div className="text-center mb-20">
            <h2 className="title-text mb-8 text-neutral-800">Real-World Applications</h2>
            <p className="body-text text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Discover how our technology transforms everyday yacht club experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Club Access',
                description: 'Physical facility entry control',
                content: 'Members tap their NFC cards to gain access to club facilities, with real-time verification against their blockchain membership.'
              },
              {
                title: 'Event Check-in',
                description: 'Seamless event management',
                content: 'Staff can instantly verify membership status and tier privileges for events, workshops, and special occasions.'
              },
              {
                title: 'Guest Management',
                description: 'Controlled guest access',
                content: 'Premium and Elite members can bring guests, with the system automatically checking tier-based guest privileges.'
              },
              {
                title: 'Online Services',
                description: 'Digital platform access',
                content: 'Members can access exclusive online content and services by connecting their wallet and verifying NFT ownership.'
              },
              {
                title: 'Merchandise',
                description: 'Member-exclusive purchases',
                content: 'Special member pricing and exclusive merchandise access based on verified membership tier and status.'
              },
              {
                title: 'Travel Benefits',
                description: 'Reciprocal club access',
                content: 'Members can access partner yacht clubs worldwide using their verified digital membership credentials.'
              }
            ].map((app, index) => (
              <div key={index} className="border border-neutral-200 bg-white p-8 hover:bg-neutral-50 transition-colors duration-200">
                <h3 className="text-xl font-light text-neutral-800 mb-2">{app.title}</h3>
                <p className="text-sm text-neutral-500 mb-4 uppercase tracking-wider">{app.description}</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{app.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Luxury & Commanding */}
      <section className="luxury-section-xl bg-neutral-50">
        <div className="luxury-container text-center">
          <div className="animate-fade-up">
            <h2 className="title-text mb-12 text-neutral-800">
              Ready to Experience<br />
              <span className="text-neutral-400">the Future?</span>
            </h2>
            
            <p className="subtitle-text max-w-2xl mx-auto leading-relaxed mb-16 text-neutral-600 font-light">
              Join the Lake Stockton Yacht Club and get your digital membership today. 
              Get started with a Standard membership and upgrade as you go.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a 
                href="/"
                className="luxury-button-primary text-lg hover-lift focus-ring"
              >
                Get Started
                <ChevronRight className="h-5 w-5 ml-3" />
              </a>
              
              <a 
                href="/member-portal"
                className="luxury-button-secondary text-lg hover-lift focus-ring"
              >
                Member Portal
                <ChevronRight className="h-5 w-5 ml-3" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
