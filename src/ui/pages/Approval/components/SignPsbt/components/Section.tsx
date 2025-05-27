import { Card, Column, Row, Text } from '@/ui/components';

export default function Section({
  title,
  children,
  extra
}: {
  title: string;
  children?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <Column>
      <Row justifyBetween>
        <Text text={title} preset="bold" />
        {extra}
      </Row>
      <Card>
        <Row full justifyBetween itemsCenter>
          {children}
        </Row>
      </Card>
    </Column>
  );
}
