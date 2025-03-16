import { CSSProperties, memo, useMemo } from 'react';

export type IframeProps = { preview: string; style?: CSSProperties; ref: any; disableSandbox?: boolean };

const Iframe = ({ preview, style, ref, disableSandbox }: IframeProps) => {
  return useMemo(
    () => (
      <iframe
        onClick={(e) => e.preventDefault()}
        ref={ref}
        style={Object.assign({}, { pointerEvents: 'none' }, style)} // prevent events in iframe
        src={preview}
        sandbox={disableSandbox ? undefined : 'allow-scripts'}
        scrolling="no"
        loading="lazy"></iframe>
    ),
    [preview]
  );
};

export default memo(Iframe, (p, n) => {
  return p.preview === n.preview;
});
