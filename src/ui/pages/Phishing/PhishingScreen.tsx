import { useSearchParams } from 'react-router-dom';

import './PhishingScreen.css';

const PhishingScreen = () => {
  const [searchParams] = useSearchParams();
  const hostname = searchParams.get('hostname');
  const href = searchParams.get('href');

  const handleProceed = async () => {
    // Send message to background to proceed (one-time bypass, not adding to whitelist)
    await chrome.runtime.sendMessage({
      type: 'SKIP_PHISHING_PROTECTION',
      hostname
    });

    // Redirect to the original URL if available
    if (href) {
      window.location.href = href;
    } else {
      // Fallback to hostname if full URL is not available
      window.location.href = `https://${hostname}`;
    }
  };

  return (
    <div className="phishing-container">
      <div className="phishing-content">
        {/* Logo & Warning */}
        <div className="phishing-header">
          <img src={chrome.runtime.getURL('/images/logo/wallet-logo.png')} alt="UniSat" className="phishing-logo" />
          <div className="phishing-divider" />
          <div className="phishing-warning-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Security Warning</span>
          </div>
        </div>

        {/* Title & Domain */}
        <div className="phishing-title-section">
          <h1>Danger! Potential phishing website detected</h1>
          <p className="phishing-domain">{hostname}</p>
        </div>

        {/* Warning Message */}
        <div className="phishing-warning-box">
          <p>This website has been identified as malicious by UniSat and may:</p>
          <ul>
            <li>Steal your private keys or seed phrases</li>
            <li>Trick you into signing malicious transactions</li>
            <li>Collect your personal information</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="phishing-actions">
          <a
            href="https://github.com/MetaMask/eth-phishing-detect/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="phishing-report-link">
            Think this is a false positive? Click here to report an issue →
          </a>
          <p className="phishing-proceed-text">
            If you insist on continuing, proceed at your own risk:
            <button onClick={handleProceed} className="phishing-proceed-button">
              Continue to {hostname}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhishingScreen;
