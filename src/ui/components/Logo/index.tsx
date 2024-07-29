import { Image } from '../Image';
import { Row } from '../Row';

export function Logo(props: { preset?: 'large' | 'small' }) {
  const { preset } = props;
  if (preset === 'large') {
    return (
      <Row justifyCenter itemsCenter>
        <Image src="./images/logo/opnet_logo_dark.svg" width={150} height={80} />

        {/* <Text text="OP_WALLET" preset="title-bold" size="xxl" disableTranslate /> */}
      </Row>
    );
  } else {
    return (
      <Row justifyCenter itemsCenter>
        <Image src="./images/logo/opnet_logo_dark.svg" height={30} width={100} />
        {/* <Text text="OP_WALLET" preset="title-bold" disableTranslate /> */}
      </Row>
    );
  }
}
