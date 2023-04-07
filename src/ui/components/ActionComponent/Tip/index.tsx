import { Column } from '../../Column';
import { Popover } from '../../Popover';
import { Text } from '../../Text';
import './index.less';

export interface TipProps {
  text?: string;
  onClose?: () => void;
}

export function Tip(props: TipProps) {
  const { text, onClose } = props;
  return (
    <Popover
      onClose={() => {
        onClose && onClose();
      }}>
      <Column>
        <Text text={text} textCenter />
      </Column>
    </Popover>
  );
}
