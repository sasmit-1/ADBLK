import React from 'react'
import { AuroraBackground } from './components/reactbits/AuroraBackground'
import { GradientText } from './components/reactbits/GradientText'
import { SpotlightCard } from './components/reactbits/SpotlightCard'
import { AnimatedStepper } from './components/reactbits/AnimatedStepper'
import { Shield, FastForward, EyeOff, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import './index.css'

function App() {
  const features = [
    { icon: <FastForward size={32} color="#0ea5e9"/>, title: 'YouTube Auto Skipper', desc: 'Automatically 16x fast-forwards and clicks "Skip Ad" instantly for pre-rolls.' },
    { icon: <EyeOff size={32} color="#a855f7"/>, title: 'Cosmetic Filtering', desc: 'Surgically removes display ad containers (banners, outbrain, taboola) giving you clean pages.' },
    { icon: <Shield size={32} color="#22c55e"/>, title: 'Network Level Blocks', desc: 'Intercepts common tracker scripts using the new Manifest V3 DeclarativeNetRequest API.' }
  ];

  const installSteps = [
    { title: 'Download & Extract', description: 'Download the source package and extract it to a dedicated folder on your local drive.' },
    { title: 'Open Chrome Extensions', description: 'Navigate to chrome://extensions in your address bar and enable "Developer mode" in the top right.' },
    { title: 'Load Unpacked', description: "Click the \"Load unpacked\" button and select the extracted AdBlck folder. You're strictly protected!" }
  ];

  return (
    <AuroraBackground>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', width: '100%', boxSizing: 'border-box' }}>
        
        {/* HERO */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '6rem', paddingTop: '4rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Shield size={20} color="#9333ea" />
            <span style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Manifest V3 Compliant Adblocker</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 800, margin: '1rem 0', lineHeight: 1.1 }}>
            Control the Web with<br/>
            <GradientText text="CleanView AdBlck" />
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            Experience the web without borders. Skip unskippable video ads, eradicate trackers, and stop banner overload completely free.
          </p>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', border: 'none', padding: '1rem 2.5rem',
              borderRadius: '2rem', color: 'white', fontSize: '1.125rem', fontWeight: 'bold', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)'
            }}
          >
            <Download size={24} /> Get Source Code
          </motion.button>
        </motion.div>

        {/* FEATURES GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '8rem' }}>
          {features.map((feat, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.2 }}
               style={{ height: '100%' }}
             >
                <SpotlightCard style={{ height: '100%', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {feat.icon}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{feat.title}</h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>{feat.desc}</p>
                </SpotlightCard>
             </motion.div>
          ))}
        </div>

        {/* INSTALLATION STEPS */}
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '6rem' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once:true }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', margin: '0 0 1rem 0' }}>Get Started in <GradientText text="3 Minutes" /></h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '1.125rem', margin: 0 }}>Side-load the extension without the Chrome Web Store fees.</p>
          </motion.div>
          
          <AnimatedStepper steps={installSteps} />
        </div>

      </div>
    </AuroraBackground>
  )
}

export default App
