import { fontSizes } from '@/ui/theme/font';

import { Image } from '../Image';
import { Row } from '../Row';
import { Text } from '../Text';

export function Logo(props: { preset?: 'large' | 'small' }) {
  const { preset } = props;
  if (preset === 'large') {
    return (
      <Row justifyCenter itemsCenter>
        <Image src="./images/logo/wallet-logo.png" size={fontSizes.xxxl} />

        <Text text="UNISAT" preset="title-bold" size="xxl" />
      </Row>
    );
  } else {
    return (
      <Row justifyCenter itemsCenter>
        <Image src="./images/logo/wallet-logo.png" size={fontSizes.xxl} />
        <Text text="UNISAT" preset="title-bold" />
      </Row>
    );
  }
}
