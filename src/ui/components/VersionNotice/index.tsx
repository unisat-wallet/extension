import { VersionDetail } from '@/shared/types';

import { Button } from '../Button';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Popover } from '../Popover';

interface VersionNoticeProps {
  notice: VersionDetail;
  onClose: () => void;
}

export const VersionNotice = ({ notice, onClose }: VersionNoticeProps) => {
  const { title, notice: noticeText } = notice;

  const lines = noticeText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line);

  const features = lines;

  return (
    <Popover
      contentStyle={{
        width: 270,
        height: 314,
        flexShrink: 0,
        borderRadius: 20,
        background: '#24282F',
        color: '#fff',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 0
      }}>
      <Column style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }} gap="md">
        <div
          style={{
            margin: '9px auto 0 auto',
            width: 90,
            height: 90,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <Icon icon="version-notice" size={90} />
        </div>
        <div
          style={{
            display: 'flex',
            height: 24,
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter-Regular',
            fontSize: 16,
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            margin: '0 auto'
          }}>
          {title}
        </div>
        <Column
          gap="sm"
          style={{ width: '100%', margin: '16px 0 24px 0', alignItems: 'center', height: 72, overflowY: 'auto' }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                width: 220,
                minHeight: 24,
                color: 'rgba(255, 255, 255, 0.65)',
                fontFamily: 'Inter-Regular',
                fontSize: 12,
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '20px',
                textAlign: 'left',
                margin: '0 auto'
              }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.65)',
                  marginTop: 7,
                  marginRight: 8,
                  flexShrink: 0
                }}
              />
              <span style={{ flex: 1 }}>{f}</span>
            </div>
          ))}
        </Column>
      </Column>
      <div style={{ padding: '0 16px 24px 16px', width: '100%' }}>
        <Button text="Got it" full preset="defaultV2" onClick={onClose} />
      </div>
    </Popover>
  );
};
