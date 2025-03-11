import { ContractResult } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';

import { Button } from '../Button';
import { Column } from '../Column';
import { Line } from '../Line';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Section } from '../Section';
import { Text } from '../Text';
import { TextArea } from '../TextArea';

export const ContractPopover = ({ contract, onClose }: { contract: ContractResult; onClose: () => void }) => {
  const contractData = contract;
  const { t } = useI18n();

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Text text={t('bitcoin_address_verifier')} preset="title-bold" />
        <Row>
          <Text
            text={`${t('please_read_more_detail_on')} https://github.com/unisat-wallet/bitcoin-address-verifier.`}
            preset="sub"
            selectText
          />
        </Row>
        <Line />

        <Column gap="md" fullX mb="md">
          <Section title={t('id')} value={contractData.id} />
          <Section title={t('name')} value={contractData.name} maxLength={30} />
          <Section title={t('address')} value={contractData.address} showCopyIcon />
          <Section title={t('script')} value={contractData.script} showCopyIcon />
          <Section title={t('owner')} value={contractData.isOwned ? 'YES' : 'NO'} />
          <Line />
          <Section title={t('description')} value={''} />
          <TextArea
            text={contractData.description}
            style={{
              backgroundColor: 'transparent'
            }}
          />
        </Column>

        <Row full>
          <Button
            text={t('ok')}
            preset="default"
            full
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />
        </Row>
      </Column>
    </Popover>
  );
};
