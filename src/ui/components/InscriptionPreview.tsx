import { Inscription } from '@/shared/types';

import { formatDate } from '../utils';
import Iframe from './Iframe';

function getDateShowdate(date: Date) {
  if (date.getTime() < 100) {
    return 'unconfirmed';
  } else {
    const old = Date.now() - date.getTime();
    if (old < 60 * 1000) {
      return `${Math.floor(old / 1000)} seconds ago`;
    }
    if (old < 1000 * 60 * 60) {
      return `${Math.floor(old / 60000)} minutes age`;
    }
    if (old < 1000 * 60 * 60 * 24) {
      return `${Math.floor(old / 3600000)} hours ago`;
    }
    if (old < 1000 * 60 * 60 * 24 * 30) {
      return `${Math.floor(old / 86400000)} days ago`;
    }
  }
  return formatDate(date, 'yyyy-MM-dd');
}

const sizeMap = {
  large: {
    iframe: 'w-95 h-95',
    time: ''
  },
  medium: {
    iframe: 'w-48 h-48',
    time: ''
  },
  small: {
    iframe: 'w-24 h-24',
    time: 'h-5'
  }
};
export default function InscriptionPreview({
  data,
  className,
  onClick,
  size = 'large'
}: {
  data: Inscription;
  className?: string;
  onClick?: (data: any) => void;
  size?: 'large' | 'medium' | 'small';
}) {
  if (data.detail) {
    const detail = data.detail;
    const date = new Date(detail.timestamp);
    const time = getDateShowdate(date);
    return (
      <div
        onClick={(e) => {
          if (onClick) onClick(data);
        }}
        className={`flex flex-col shadow  shadow-soft-black ${className}`}
        style={{ backgroundColor: '#2a2a2a' }}>
        <Iframe preview={detail.preview} className={sizeMap[size].iframe} />

        <div className="px-2 pt-1 text-sm w-24" style={{ color: '#f6ae2d' }}>
          # {data.number}
        </div>
        <div className={`px-1 pb-1 text-sm ${sizeMap[size].time}`} style={{ color: '#8A8A8A' }}>
          {time}
        </div>
      </div>
    );
  } else {
    return <div />;
  }
}
