import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface Arc20PreviewCardProps {
  ticker: string;
  amt: number;
  onClick?: () => void;
}

export default function Arc20PreviewCard({ ticker, amt, onClick }: Arc20PreviewCardProps) {
  return (
    <Column
      style={{ backgroundColor: '#1C2852', width: 80, height: 90, borderRadius: 5, padding: 5 }}
      onClick={onClick}>
      <Row>
        <Text text={ticker} color="white_muted" size="lg" />
      </Row>

      <Text text={amt} size="sm" textCenter />
    </Column>
  );
}
