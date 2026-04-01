import React, { useState, useEffect } from 'react'
import LightRays from './components/reactbits/LightRays'

import { GradientText } from './components/reactbits/GradientText'
import { SpotlightCard } from './components/reactbits/SpotlightCard'
import { Shield, Zap, EyeOff, Download, ExternalLink, ChevronRight, Star, Package, Settings, MousePointerClick, Activity, Code, Ban } from 'lucide-react'
import { motion } from 'framer-motion'
import './index.css'

const GITHUB_URL = 'https://github.com/sasmit-1/ADBLK'

// Inline GitHub SVG icon (not in lucide-react)
const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ padding: scrolled ? '0.5rem 2rem' : '1rem 2rem' }}
    >
      <div className="navbar-inner" style={{
        background: scrolled ? 'rgba(3, 0, 20, 0.85)' : 'rgba(3, 0, 20, 0.6)',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none'
      }}>
        <div className="navbar-brand">
          <div className="shield-icon">
            <Shield size={18} color="white" />
          </div>
          <span>AdBlck</span>
        </div>

        <ul className="navbar-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#install">Install</a></li>
          <li>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-github-btn cursor-target"
            >
              <GithubIcon size={16} />
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </motion.nav>
  )
}

function HeroSection() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async (e) => {
    e.preventDefault();
    if (isDownloading) return; // Prevent multiple clicks
    
    setIsDownloading(true);
    try {
      const { downloadExtensionZip } = await import('./utils/downloadManager')
      await downloadExtensionZip();
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to bundle extension files. Please try again or download manually from GitHub.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="hero-section" id="hero">
      <motion.div
        className="hero-badge"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <span className="pulse-dot" />
        Manifest V3 &middot; Open Source &middot; Free Forever
      </motion.div>

      <motion.h1
        className="hero-title"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className="line-muted">F*ck The Ads</span>
        <br />
        <GradientText text="Save your time" />
      </motion.h1>

      <motion.p
        className="hero-subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        A next-gen adblocker built for Manifest V3. Skip unskippable YouTube ads, obliterates 100+ shady networks, collapses manga/anime popups, and cleans the web — completely free.
      </motion.p>

      <motion.div
        className="hero-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <motion.a
          href="#"
          onClick={handleDownloadClick}
          className="btn-primary cursor-target"
          style={{ opacity: isDownloading ? 0.7 : 1, pointerEvents: isDownloading ? 'none' : 'auto' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Download size={20} />
          {isDownloading ? 'Packaging...' : 'Download Setup'}
          {!isDownloading && <ChevronRight size={16} />}
        </motion.a>
        <motion.a
          href="#install"
          className="btn-secondary cursor-target"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <MousePointerClick size={18} />
          How to Install
        </motion.a>
      </motion.div>

      <motion.div
        className="stats-bar"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.0 }}
      >
        <div className="stat-item">
          <div className="stat-value">MV3</div>
          <div className="stat-label">Manifest Version</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-value">16x</div>
          <div className="stat-label">Ad Fast-Forward</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-value">100%</div>
          <div className="stat-label">Free &amp; Open Source</div>
        </div>
      </motion.div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: <Zap size={26} color="#38bdf8" />,
      colorClass: 'blue',
      title: 'YouTube Ad Annihilator',
      desc: 'Instantly detects pre-roll ads and fast-forwards them at 16x speed. The "Skip Ad" button gets clicked the millisecond it appears. No waiting, no interruptions.'
    },
    {
      icon: <EyeOff size={26} color="#a78bfa" />,
      colorClass: 'purple',
      title: 'Cosmetic Filtering Engine',
      desc: 'Surgically removes banner ads, Outbrain widgets, Taboola feeds, and sponsored content blocks. Pages load faster and look cleaner — the way they should.'
    },
    {
      icon: <Shield size={26} color="#34d399" />,
      colorClass: 'emerald',
      title: 'Network-Level Blocking',
      desc: 'Intercepts tracking scripts and ad network requests using the new DeclarativeNetRequest API. Built for Chrome\'s Manifest V3 from the ground up.'
    },
    {
      icon: <Star size={26} color="#fbbf24" />,
      colorClass: 'yellow',
      title: 'Manga & Streaming Protection',
      desc: 'Decimates shady popup networks (ExoClick, PopAds) and aggressively collapses sidebar "Sponsored" blocks on pirate streaming and manga sites.'
    },
    {
      icon: <Ban size={26} color="#f43f5e" />,
      colorClass: 'rose',
      title: 'Clickjack & Popunder Killer',
      desc: 'Detects invisible full-screen overlay traps that hijack your clicks to open gambling sites like Stake or 1xBet. Neutralizes them before your click ever registers.'
    }
  ]

  return (
    <section className="section" id="features">
      <motion.div
        className="section-header"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="section-label">
          <Star size={14} />
          Core Features
        </div>
        <h2 className="section-title">
          Everything you need.<br />
          <span style={{ color: 'var(--text-secondary)' }}>Nothing you don't.</span>
        </h2>
        <p className="section-desc">
          Three powerful modules working together to give you the cleanest browsing experience possible.
        </p>
      </motion.div>

      <div className="glow-line" style={{ marginBottom: '3rem' }} />

      <motion.div
        className="features-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {features.map((feat, i) => (
          <motion.div key={i} variants={fadeUp} custom={i}>
            <SpotlightCard
              className="cursor-target"
              style={{
                height: '100%',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                boxSizing: 'border-box',
                border: 'none',
                background: 'transparent'
              }}
            >
              <div className={`feature-icon-wrapper ${feat.colorClass}`}>
                {feat.icon}
              </div>
              <h3 style={{ marginBottom: '0.75rem' }}>{feat.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem' }}>{feat.desc}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

function HowItWorksSection() {
  const mechanisms = [
    {
      num: '01',
      title: 'DeclarativeNetRequest API',
      desc: 'The blocker sits at the browser core level, intercepting domain requests before they even touch the network. Over 100+ shady ad syndicates and 50+ tracking matrices are blocked at the network-level.',
      icon: <Shield size={20} />
    },
    {
      num: '02',
      title: 'Active DOM Mutation Observer',
      desc: 'Instead of polling infinitely, we leverage hardware-accelerated MutationObservers. It idles at 0% CPU, but the millisecond the website tries to inject a new ad via JavaScript, our engine wakes up and nukes it.',
      icon: <Activity size={20} />
    },
    {
      num: '03',
      title: '3-Layer Cosmetic Engine',
      desc: 'It doesn\'t just hide things with CSS. Our script actively sniffs out invisible iframes from popunder networks and uses TreeWalkers to detect text like "Sponsored Ads", collapsing their entire parent trees instantly.',
      icon: <Code size={20} />
    }
  ]

  return (
    <section className="section" id="how-it-works" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
      <motion.div
        className="section-header"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="section-label">
          <Zap size={14} />
          Under The Hood
        </div>
        <h2 className="section-title">
          How it <GradientText text="works" />
        </h2>
        <p className="section-desc">
          Built on a highly optimized 3-layer ad blocking architecture to save your memory and CPU.
        </p>
      </motion.div>

      <div className="glow-line" style={{ marginBottom: '3rem' }} />

      <div className="steps-container">
        {mechanisms.map((mech, i) => (
          <motion.div
            key={i}
            className="step-card cursor-target"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="step-number" style={{ color: 'var(--accent-cyan)' }}>{mech.num}</div>
            <div className="step-content">
              <h3>{mech.title}</h3>
              <p>{mech.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function InstallSection() {
  const steps = [
    {
      num: '01',
      title: 'Download & Extract',
      desc: (
        <>
          Click the <strong>Download Setup</strong> button above to download the required extension files. 
          Extract the downloaded <code>AdBlck-Extension.zip</code> somewhere memorable (like your Desktop). <br/><br/>
          <strong style={{ color: 'var(--accent-rose)' }}>CRITICAL:</strong> Make sure you extract the contents into a folder instead of just opening the ZIP directly. You need the folder containing <code>manifest.json</code>.
        </>
      ),
      icon: <Package size={20} />
    },
    {
      num: '02',
      title: 'Open Chrome Extension Settings',
      desc: (
        <>
          Type <code>chrome://extensions</code> into your Chrome address bar and hit Enter.
          In the top-right corner, toggle on <code>Developer mode</code>.
          This unlocks the ability to side-load extensions directly.
        </>
      ),
      icon: <Settings size={20} />
    },
    {
      num: '03',
      title: 'Load the Extension',
      desc: (
        <>
          Click <code>Load unpacked</code> in the top-left corner.
          Select the exact folder that has <code>manifest.json</code> inside it (do <strong>not</strong> select the outer wrapper folder!).
          The extension icon will appear in your toolbar — you are now protected.
        </>
      ),
      icon: <Shield size={20} />
    }
  ]

  return (
    <section className="section" id="install">
      <motion.div
        className="section-header"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="section-label">
          <Download size={14} />
          Installation
        </div>
        <h2 className="section-title">
          Up and running in <GradientText text="3 minutes" />
        </h2>
        <p className="section-desc">
          No web store fees, no reviews, no waiting. Side-load it directly into Chrome with these three steps.
        </p>
      </motion.div>

      <div className="glow-line" style={{ marginBottom: '3rem' }} />

      <div className="steps-container">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="step-card cursor-target"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="step-number">{step.num}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA after steps */}
      <motion.div
        style={{ textAlign: 'center', marginTop: '3rem' }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <motion.a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary cursor-target"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'inline-flex' }}
        >
          <GithubIcon size={20} />
          View on GitHub
          <ExternalLink size={16} />
        </motion.a>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>&copy; {new Date().getFullYear()} AdBlck &mdash; Built with purpose, not profit.</p>
        <div className="footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#features">Features</a>
          <a href="#install">Install</a>
        </div>
      </div>
    </footer>
  )
}

function App() {
  return (
    <div className="page-wrapper">
      {/* WebGL Light Rays Background */}
      <div className="light-rays-bg">
        <LightRays
          raysOrigin="top-center"
          raysColor="#8b5cf6"
          raysSpeed={0.6}
          lightSpread={1.5}
          rayLength={2.5}
          pulsating={true}
          fadeDistance={1.2}
          saturation={1.2}
          followMouse={true}
          mouseInfluence={0.15}
          distortion={0.3}
        />
      </div>



      {/* Content */}
      <div className="content-layer">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <InstallSection />
        <Footer />
      </div>
    </div>
  )
}

export default App
