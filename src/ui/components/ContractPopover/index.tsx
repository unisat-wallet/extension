import { ContractResult } from '@/shared/types';

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

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Text text="Bitcoin Address Verifier" preset="title-bold" />
        <Row>
          <Text
            text={'Please read more detail on https://github.com/unisat-wallet/bitcoin-address-verifier.'}
            preset="sub"
            selectText
          />
        </Row>
        <Line />

        <Column gap="md" fullX mb="md">
          <Section title="id" value={contractData.id} />
          <Section title="name" value={contractData.name} maxLength={30} />
          <Section title="address" value={contractData.address} showCopyIcon />
          <Section title="script" value={contractData.script} showCopyIcon />
          <Section title="owner" value={contractData.isOwned ? 'YES' : 'NO'} />
          <Line />
          <Section title="description" value={''} />
          <TextArea
            text={contractData.description}
            style={{
              backgroundColor: 'transparent'
            }}
          />
        </Column>

        <Row full>
          <Button
            text={'OK'}
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
