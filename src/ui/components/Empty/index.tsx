import { useI18n } from '@unisat/wallet-state';

import { Text } from '../Text';

interface EmptyProps {
  text?: string;
}
export function Empty(props: EmptyProps) {
  const { text } = props;
  const { t } = useI18n();
  const content = text || t('no_data');
  return (
    <div
      style={{
        alignSelf: 'center'
      }}>
      <Text text={content} preset="sub" textCenter />
    </div>
  );
}
