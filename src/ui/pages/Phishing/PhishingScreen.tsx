import { useSearchParams } from 'react-router-dom';

import './PhishingScreen.css';

const PhishingScreen = () => {
  const [searchParams] = useSearchParams();
  const hostname = searchParams.get('hostname');

  const handleProceed = async () => {
    // Send message to background to allow access to this domain
    await chrome.runtime.sendMessage({
      type: 'SKIP_PHISHING_PROTECTION',
      hostname
    });
    // Go back to previous page
    window.history.back();
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
            <span>安全警告</span>
          </div>
        </div>

        {/* Title & Domain */}
        <div className="phishing-title-section">
          <h1>危险！检测到潜在的钓鱼网站</h1>
          <p className="phishing-domain">{hostname}</p>
        </div>

        {/* Warning Message */}
        <div className="phishing-warning-box">
          <p>此网站已被 UniSat 识别为恶意网站，可能会:</p>
          <ul>
            <li>窃取您的私钥或助记词</li>
            <li>诱导您签署恶意交易</li>
            <li>获取您的个人信息</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="phishing-actions">
          <a
            href="https://github.com/MetaMask/eth-phishing-detect/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="phishing-report-link">
            认为这是误报？点击此处提交问题 →
          </a>
          <p className="phishing-proceed-text">
            如果您执意继续，请自行承担风险：
            <button onClick={handleProceed} className="phishing-proceed-button">
              继续访问 {hostname}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhishingScreen;
