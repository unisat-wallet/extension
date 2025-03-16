import { copyToClipboard, shortAddress } from '@/ui/utils';
import { CopyOutlined } from '@ant-design/icons';

import { useTools } from '../ActionComponent';
import { Row } from '../Row';
import { Text } from '../Text';

export function Section({
  value,
  title,
  link,
  showCopyIcon
}: {
  value: string | number;
  title: string;
  link?: string;
  showCopyIcon?: boolean;
}) {
  const tools = useTools();

  let displayText = value.toString();
  if (value && typeof value === 'string' && value.length > 20) {
    displayText = shortAddress(value, 10);
  }

  return (
    <Row
      justifyBetween
      itemsCenter
      px="md"
      style={{
        minHeight: 25
      }}>
      <Text text={title} preset="sub" />
      <Row
        onClick={() => {
          if (link) {
            window.open(link);
          } else {
            copyToClipboard(value).then(() => {
              tools.toastSuccess('Copied');
            });
          }
        }}>
        <Text text={displayText} preset={link ? 'link' : 'regular'} size="xs" wrap />
        {showCopyIcon && <CopyOutlined style={{ color: '#888', fontSize: 14 }} />}
      </Row>
    </Row>
  );
}
