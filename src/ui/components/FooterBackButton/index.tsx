import { Footer } from 'antd/lib/layout/layout';
import { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './index.less';

export const FooterBackButton: React.FC<{ onClick?: MouseEventHandler<HTMLElement> }> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <Footer className="footer-bar">
      <div
        className="duration-80 footer-back-button"
        onClick={(e) => {
          if (onClick) {
            onClick(e);
          } else {
            window.history.go(-1);
          }
        }}>
        <FontAwesomeIcon icon={faArrowLeft} style={{ height: '1.125rem', marginTop: '-0.125rem' }} />
        <span className="text-lg font-semibold leading-4_5">&nbsp;{t('Back')}</span>
      </div>
    </Footer>
  );
};

export const FooterButton: React.FC<{ title?: string; onClick?: MouseEventHandler<HTMLElement> }> = ({
  onClick,
  title
}) => {
  const { t } = useTranslation();
  return (
    <Footer className="footer-bar">
      <div
        className="duration-80 footer-back-button"
        onClick={(e) => {
          if (onClick) {
            onClick(e);
          } else {
            window.history.go(-1);
          }
        }}>
        <span className="text-lg font-semibold leading-4_5">{title}</span>
      </div>
    </Footer>
  );
};
