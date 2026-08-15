import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, HelpCircle, X } from 'lucide-react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [promptConfig, setPromptConfig] = useState(null);
  const [promptValue, setPromptValue] = useState('');

  // Override standard window.alert
  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (message) => {
      setAlertConfig({
        message,
        onClose: () => setAlertConfig(null),
      });
    };
    return () => {
      window.alert = nativeAlert;
    };
  }, []);

  const showConfirm = (message) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        message,
        onConfirm: () => {
          setConfirmConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmConfig(null);
          resolve(false);
        }
      });
    });
  };

  const showPrompt = (message, placeholder = '') => {
    setPromptValue('');
    return new Promise((resolve) => {
      setPromptConfig({
        message,
        placeholder,
        onConfirm: (val) => {
          setPromptConfig(null);
          resolve(val);
        },
        onCancel: () => {
          setPromptConfig(null);
          resolve(null);
        }
      });
    });
  };

  const getAlertStyle = (message) => {
    const lowercaseMsg = (message || '').toLowerCase();
    
    // Check if it is a success message
    if (
      lowercaseMsg.includes('success') ||
      lowercaseMsg.includes('approved') ||
      lowercaseMsg.includes('added to cart') ||
      lowercaseMsg.includes('updated') ||
      lowercaseMsg.includes('moderated') ||
      lowercaseMsg.includes('sent') ||
      lowercaseMsg.includes('thank you')
    ) {
      return {
        color: 'var(--secondary)', // Green
        icon: <CheckCircle size={44} style={{ color: 'var(--secondary)' }} />,
        bg: 'rgba(5, 150, 105, 0.08)',
        title: 'Success'
      };
    }
    
    // Check if it is an error or caution message
    if (
      lowercaseMsg.includes('failed') ||
      lowercaseMsg.includes('error') ||
      lowercaseMsg.includes('cannot') ||
      lowercaseMsg.includes('invalid') ||
      lowercaseMsg.includes('deleted') ||
      lowercaseMsg.includes('rejected') ||
      lowercaseMsg.includes('incorrect') ||
      lowercaseMsg.includes('required') ||
      lowercaseMsg.includes('wrong') ||
      lowercaseMsg.includes('exceeds')
    ) {
      return {
        color: 'var(--accent)', // Red
        icon: <AlertCircle size={44} style={{ color: 'var(--accent)' }} />,
        bg: 'rgba(225, 29, 72, 0.08)',
        title: 'Attention'
      };
    }
    
    // Default to Blue info style
    return {
      color: 'var(--primary)', // Blue
      icon: <Info size={44} style={{ color: 'var(--primary)' }} />,
      bg: 'rgba(2, 132, 199, 0.08)',
      title: 'Notification'
    };
  };

  return (
    <AlertContext.Provider value={{ showConfirm, showPrompt }}>
      {children}

      {/* Centered Alert Modal */}
      {alertConfig && (() => {
        const style = getAlertStyle(alertConfig.message);
        return (
          <div className="glass-alert-overlay">
            <div className="glass-panel glass-alert-modal">
              <button 
                onClick={alertConfig.onClose}
                className="glass-alert-close"
                title="Close"
              >
                <X size={18} />
              </button>
              
              <div 
                className="glass-alert-icon-container"
                style={{ backgroundColor: style.bg }}
              >
                {style.icon}
              </div>
              
              <div className="glass-alert-content">
                <h4 
                  className="glass-alert-title"
                  style={{ color: style.color }}
                >
                  {style.title}
                </h4>
                <p className="glass-alert-message">
                  {alertConfig.message}
                </p>
              </div>
              
              <button
                onClick={alertConfig.onClose}
                className="btn btn-primary glass-alert-btn"
                style={{
                  backgroundColor: style.color === 'var(--secondary)' ? 'var(--secondary)' : style.color === 'var(--accent)' ? 'var(--accent)' : 'var(--primary)',
                  borderColor: style.color === 'var(--secondary)' ? 'var(--secondary)' : style.color === 'var(--accent)' ? 'var(--accent)' : 'var(--primary)',
                }}
              >
                OK
              </button>
            </div>
          </div>
        );
      })()}

      {/* Centered Confirm Modal */}
      {confirmConfig && (
        <div className="glass-alert-overlay">
          <div className="glass-panel glass-alert-modal" style={{ maxWidth: '400px' }}>
            <button 
              onClick={confirmConfig.onCancel}
              className="glass-alert-close"
              title="Cancel"
            >
              <X size={18} />
            </button>

            <div 
              className="glass-alert-icon-container"
              style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)' }}
            >
              <HelpCircle size={44} style={{ color: 'var(--warning)' }} />
            </div>
            
            <div className="glass-alert-content">
              <h4 
                className="glass-alert-title"
                style={{ color: 'var(--warning)' }}
              >
                Confirmation
              </h4>
              <p className="glass-alert-message">
                {confirmConfig.message}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
              <button
                onClick={confirmConfig.onCancel}
                className="btn btn-secondary glass-alert-btn-secondary"
                style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className="btn btn-primary glass-alert-btn-primary"
                style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Prompt Modal */}
      {promptConfig && (
        <div className="glass-alert-overlay">
          <div className="glass-panel glass-alert-modal" style={{ maxWidth: '420px', alignItems: 'stretch' }}>
            <button 
              onClick={promptConfig.onCancel}
              className="glass-alert-close"
              title="Cancel"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div 
                className="glass-alert-icon-container"
                style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)' }}
              >
                <HelpCircle size={44} style={{ color: 'var(--primary)' }} />
              </div>
              
              <div className="glass-alert-content">
                <h4 
                  className="glass-alert-title"
                  style={{ color: 'var(--primary)' }}
                >
                  Input Required
                </h4>
                <p className="glass-alert-message" style={{ marginBottom: '1.2rem' }}>
                  {promptConfig.message}
                </p>
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <input
                type="text"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={promptConfig.placeholder}
                className="form-control"
                style={{ 
                  width: '100%', 
                  background: 'rgba(255, 255, 255, 0.8)', 
                  border: '1px solid var(--border-color)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '10px', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    promptConfig.onConfirm(promptValue);
                  }
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem' }}>
              <button
                onClick={promptConfig.onCancel}
                className="btn btn-secondary glass-alert-btn-secondary"
                style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => promptConfig.onConfirm(promptValue)}
                className="btn btn-primary glass-alert-btn-primary"
                style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
export default AlertContext;
