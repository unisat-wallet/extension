import { Button } from '../Button';
import { Column } from '../Column';
import { Image } from '../Image';
import { Line } from '../Line';
import { Popover } from '../Popover';
import { Text } from '../Text';

export const VersionNotice = ({ notice, onClose }: { notice: string; onClose: () => void }) => {
  const lines = notice.split('\n');
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Text text="Important Notice" color="white" textCenter size="md" />

        <Line />

        <Image src="./images/artifacts/notice.png" size={50} />

        {lines.map((v, index) => (
          <Column gap="zero" mt="sm" key={'line_' + index}>
            <Text size="md" text={v} />
          </Column>
        ))}

        <Column full mt={'xl'}>
          <Button
            text="OK"
            full
            preset="defaultV2"
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />
        </Column>
      </Column>
    </Popover>
  );
};
