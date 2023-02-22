import { Inscription } from '@/shared/types';

import Iframe from './Iframe';

function getPreviewUrl(id: string) {
  return `https://ordinals.com/preview/${id}`;
}

export default function InscriptionPreview({
  data,
  className,
  onClick
}: {
  data: Inscription;
  className?: string;
  onClick?: (data: any) => void;
}) {
  const isMempool = data.num === -1;
  if (data.detail) {
    const detail = data.detail;

    return (
      <div
        onClick={(e) => {
          if (onClick) onClick(data);
        }}
        className={`relative overflow-hidden bg-primary bg-opacity-50 shadow rounded-3xl shadow-soft-black h-50 ${className}`}>
        {detail.content_type === 'todo' ? (
          <div
            className="w-full h-full bg-cover"
            style={{ background: `url(${detail.content})`, backgroundSize: 'cover' }}
          />
        ) : (
          <Iframe preview={detail.preview} className="w-full h-full" />
        )}

        {isMempool === false && (
          <div className="absolute px-2 text-white bg-black rounded opacity-80 bottom-2 left-5">{data.num}</div>
        )}
      </div>
    );
  } else {
    return (
      <div
        onClick={(e) => {
          onClick?.(data);
        }}
        className={`relative overflow-hidden bg-primary bg-opacity-50 shadow rounded-3xl shadow-soft-black h-50 ${className}`}>
        <Iframe preview={getPreviewUrl(data.id)} className="w-full h-full" />

        {isMempool === false && (
          <div className="absolute px-2 text-white bg-black rounded opacity-80 bottom-2 left-5">{data.num}</div>
        )}
      </div>
    );
  }
}
