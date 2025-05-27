import { Icon, Row, Text } from '@/ui/components';
import { copyToClipboard, shortAddress } from '@/ui/utils';

import Section from './Section';

const PsbtDataSection = ({ txInfo, t, tools }) => {
  return (
    <Section title={t('psbt_data')}>
      <Text text={shortAddress(txInfo.psbtHex, 10)} />
      <Row
        itemsCenter
        onClick={() => {
          copyToClipboard(txInfo.psbtHex).then(() => {
            tools.toastSuccess(t('copied'));
          });
        }}>
        <Text text={`${txInfo.psbtHex.length / 2} bytes`} color="textDim" />
        <Icon icon="copy" color="textDim" />
      </Row>
    </Section>
  );
};

export default PsbtDataSection;
