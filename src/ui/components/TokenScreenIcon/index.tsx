import { Button } from '../Button';
import { Column } from '../Column';
import { Image } from '../Image';
import { Row } from '../Row';
import { Text } from '../Text';

const CONTAINER_SIZE = 52;
const ICON_SIZE = 48;
export function TokenScreenIcon({ iconInfo }: { iconInfo: { iconShortName?: string; iconUrl: string } }) {
  const { iconUrl, iconShortName } = iconInfo;
  return (
    <Row justifyCenter>
      <Button
        preset="default"
        style={{
          minHeight: CONTAINER_SIZE,
          width: CONTAINER_SIZE,
          borderRadius: CONTAINER_SIZE,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: 'rgba(255,255,255,0.1)'
        }}>
        {!iconUrl ? (
          <Column justifyCenter itemsCenter style={{ width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE }}>
            <Text text={iconShortName || '##'}></Text>
          </Column>
        ) : (
          <Image
            size={ICON_SIZE}
            style={{ borderRadius: ICON_SIZE }}
            src={iconUrl}
            fallbackSrc="./images/icons/unknown.png"
          />
        )}
      </Button>
    </Row>
  );
}
