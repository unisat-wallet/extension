import { useSearchParams } from 'react-router-dom';

import { Button } from '@/ui/components';

const PhishingScreen = () => {
  const [searchParams] = useSearchParams();
  const hostname = searchParams.get('hostname');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <img src="images/unisat-logo.svg" className="w-24 mb-8" />
      <h1 className="text-2xl font-bold mb-4">{hostname} 已被屏蔽!</h1>
      <p className="text-gray-600 mb-8">UniSat 认为这是恶意网站，存在安全隐患。</p>
      <p className="text-gray-500 text-sm mb-4">
        此网站已被标记为由社区维护的已知网络钓鱼网站和诈骗数据库的一部分。如果您认为该网站被错误标记，请提交回馈。
      </p>
      <Button onClick={() => window.history.back()}>返回上一页</Button>
    </div>
  );
};

export default PhishingScreen;
