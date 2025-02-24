import { useSearchParams } from 'react-router-dom';

const PhishingScreen = () => {
  const [searchParams] = useSearchParams();
  const hostname = searchParams.get('hostname');

  return (
    <div className="min-h-screen bg-[#1C1C1C] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Logo & Warning */}
        <div className="flex items-center gap-3 mb-12">
          <img src={chrome.runtime.getURL('/images/logo/wallet-logo.png')} alt="UniSat" className="h-6" />
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center text-orange-500">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ml-2 text-sm font-medium whitespace-nowrap">安全警告</span>
          </div>
        </div>

        {/* Title & Domain */}
        <div className="border-l-4 border-orange-500 pl-4 mb-8">
          <h1 className="text-2xl font-bold text-white">危险！检测到潜在的钓鱼网站</h1>
          <p className="mt-2 text-lg text-gray-400">{hostname}</p>
        </div>

        {/* Warning Message */}
        <div className="bg-gray-800/50 rounded p-6 mb-8">
          <p className="text-gray-200">此网站已被 UniSat 识别为恶意网站，可能会:</p>
          <ul className="mt-4 space-y-2 text-gray-400">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              窃取您的私钥或助记词
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              诱导您签署恶意交易
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              获取您的个人信息
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <a
            href="https://github.com/MetaMask/eth-phishing-detect/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-gray-400 hover:text-orange-500 transition-colors">
            认为这是误报？点击此处提交问题 →
          </a>
          <p className="text-sm text-gray-500">
            如果您执意继续，请自行承担风险：
            <button
              onClick={() => window.history.back()}
              className="text-orange-500 hover:text-orange-400 ml-1 transition-colors">
              继续访问 {hostname}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhishingScreen;
