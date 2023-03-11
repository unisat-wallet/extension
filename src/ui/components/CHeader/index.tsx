import { Header } from 'antd/lib/layout/layout';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './index.module.less';

const CHeader = ({
  onBack,
  title,
  LeftComponent,
  RightComponent
}: {
  onBack?: () => void;
  title?: string;
  LeftComponent?: React.ReactNode;
  RightComponent?: React.ReactNode;
}) => {
  return (
    <Header className=" border-white border-opacity-10" style={{ backgroundColor: '#1C1919' }}>
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 ">
          {LeftComponent}
          {onBack && (
            <div
              className="duration-80  w-20 cursor-pointer"
              onClick={(e) => {
                onBack();
              }}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ height: '1.125rem', marginTop: '-0.125rem' }} />
              <span className="text-lg font-semibold leading-4_5">&nbsp;{'Back'}</span>
            </div>
          )}
        </div>

        {title ? (
          <div className="flex flex-auto items-center justify-center ">
            <div className="text-xl font-semibold tracking-widest select-none">{title}</div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <img src="./images/wallet-logo.png" className="w-10 h-10 select-none" alt="" />
            <div className="text-2xl font-semibold tracking-widest select-none">UNISAT</div>
          </div>
        )}
        <div className="flex-1">{RightComponent}</div>
      </div>
    </Header>
  );
};

export default CHeader;
