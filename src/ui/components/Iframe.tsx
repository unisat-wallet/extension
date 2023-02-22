import { memo, useMemo } from 'react';

export type IframeProps = { preview: string; className?: string; ref: any };

const Iframe = ({ preview, className, ref }: IframeProps) => {
  return useMemo(
    () => (
      <iframe
        onClick={(e) => e.preventDefault()}
        ref={ref}
        className={className}
        style={{ pointerEvents: 'none' }} // prevent events in iframe
        src={preview}
        sandbox="allow-scripts"
        scrolling="no"
        loading="lazy"></iframe>
    ),
    [preview]
  );
};

export default memo(Iframe, (p, n) => {
  return p.preview === n.preview;
});
