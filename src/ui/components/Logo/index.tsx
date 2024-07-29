import { fontSizes } from '@/ui/theme/font';

import { Image } from '../Image';
import { Row } from '../Row';
import { Text } from '../Text';

export function Logo(props: { preset?: 'large' | 'small' }) {
  const { preset } = props;
  if (preset === 'large') {
    return (
      <Row justifyCenter itemsCenter>
        <Image src="./images/logo/wallet-logo.jpg" size={fontSizes.xxxl} />

        <Text text="OP_wallet" preset="title-bold" size="xxl" disableTranslate />
      </Row>
    );
  } else {
    return (
      <Row justifyCenter itemsCenter>
        <Image src="./images/logo/wallet-logo.jpg" size={fontSizes.xxl} />
        <Text text="OP_wallet" preset="title-bold" disableTranslate />
      </Row>
    );
  }
}
