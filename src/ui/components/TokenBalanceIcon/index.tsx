import { Button } from '../Button';
import { Column } from '../Column';
import { Image } from '../Image';
import { Text } from '../Text';

const CONTAINER_SIZE = 36;
const ICON_SIZE = 32;
export function TokenBalanceIcon({ iconInfo }: { iconInfo: { iconShortName?: string; iconUrl: string } }) {
  const { iconUrl, iconShortName } = iconInfo;
  return (
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
  );
}
