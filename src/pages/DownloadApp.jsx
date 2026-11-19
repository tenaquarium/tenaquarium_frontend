import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Sparkles } from 'lucide-react';

const DownloadApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setIsInstallable(false);
    });
  }, []);

  const handlePwaInstall = async () => {
    if (!deferredPrompt) {
      alert('To install on Android: Tap the 3 dots (⋮) in Google Chrome and tap "Add to Home screen" or "Install app".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #174291 0%, #0284c7 48%, #048a60 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '38px 28px',
        textAlign: 'center',
        boxShadow: '0 20px 45px rgba(2, 132, 199, 0.28), 0 10px 25px rgba(4, 138, 96, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
          marginBottom: '18px'
        }}>
          <Sparkles size={16} /> Official Android App
        </div>

        <h1 style={{ fontSize: '32px', margin: '0 0 12px 0', fontWeight: '900', letterSpacing: '-0.02em' }}>
          TEN Aquarium Mobile App
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.95, maxWidth: '540px', margin: '0 auto 28px auto', lineHeight: '1.55' }}>
          Experience lightning-fast ordering, instant UPI QR payments, and real-time order tracking directly on your Android phone.
        </p>

        {/* Primary Action Button */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handlePwaInstall}
            style={{
              background: '#ffffff',
              color: '#174291',
              border: 'none',
              padding: '16px 28px',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 22px rgba(0, 0, 0, 0.18)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Smartphone size={22} color="#0284c7" />
            {installed ? '✓ App Installed!' : '1-Click Install to Phone (Instant)'}
          </button>

          <a
            href="/downloads/tenaquarium.apk"
            download="tenaquarium.apk"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(4px)',
              padding: '16px 24px',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none'
            }}
          >
            <Download size={20} />
            Download APK File
          </a>
        </div>
      </div>

      {/* APK Installation Guide */}
      <div style={{
        marginTop: '32px',
        background: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{ fontSize: '20px', color: '#0f172a', margin: '0 0 16px 0', fontWeight: '800' }}>
          How to Install the APK on Your Android Phone:
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ background: 'linear-gradient(135deg, #174291 0%, #048a60 100%)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              1
            </div>
            <div>
              <strong style={{ color: '#1e293b', fontSize: '15px' }}>Tap "Download APK File" above</strong>
              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '2px' }}>
                If Chrome displays a prompt saying "File might be harmful", tap <strong>Download anyway</strong> (this is normal for direct APK downloads).
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ background: 'linear-gradient(135deg, #174291 0%, #048a60 100%)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              2
            </div>
            <div>
              <strong style={{ color: '#1e293b', fontSize: '15px' }}>Open the Downloaded File</strong>
              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '2px' }}>
                Pull down your notifications bar or open your phone's <strong>Downloads</strong> folder and tap <strong>tenaquarium.apk</strong>.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ background: 'linear-gradient(135deg, #174291 0%, #048a60 100%)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              3
            </div>
            <div>
              <strong style={{ color: '#1e293b', fontSize: '15px' }}>Enable "Install unknown apps" and Install</strong>
              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '2px' }}>
                If Android Settings prompts you, toggle on <strong>"Allow from this source"</strong> for Chrome or Files, then tap <strong>Install</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
