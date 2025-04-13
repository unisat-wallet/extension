import { CSSProperties } from 'react';

import { Column, Icon, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { IconTypes } from '@/ui/components/Icon';
import { copyToClipboard } from '@/ui/utils';

interface ContactItemProps {
  icon: IconTypes;
  text: string;
  url: string;
  iconSize?: number;
  style?: CSSProperties;
  textStyle?: CSSProperties;
}

export default function ContactItem({ icon, text, url, iconSize = 20, style, textStyle }: ContactItemProps) {
  const tools = useTools();

  const handleClick = () => {
    if (url.startsWith('mailto:') || url.includes('@')) {
      const email = url.startsWith('mailto:') ? url.replace('mailto:', '') : url;
      copyToClipboard(email).then(() => {
        tools.toastSuccess(`Copy: ${email}`);
      });
    } else {
      window.open(url);
    }
  };

  return (
    <Column onClick={handleClick} style={{ gap: 12, alignItems: 'center' }}>
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          aspectRatio: '1/1',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.20)',
          background: 'rgba(255, 255, 255, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}>
        <Icon icon={icon} size={iconSize} color="textDim" />
      </div>
      <Text text={text} preset="sub" color="textDim" style={{ textAlign: 'center', ...textStyle }} />
    </Column>
  );
}
