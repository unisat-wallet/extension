import { useMemo, useState } from 'react';

import { shortAddress } from '@/ui/utils';

import { AccordingInscription } from '../AccordingInscription';
import { AddressDetailPopover } from '../AddressDetailPopover';
import { Column } from '../Column';
import { CopyableAddress } from '../CopyableAddress';
import { Row } from '../Row';
import { Text } from '../Text';
import { AddressTextProps } from './interface';

export const AddressText = (props: AddressTextProps) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const address = useMemo(() => {
    if (props.address) {
      return props.address;
    }
    if (props.addressInfo) {
      return props.addressInfo.address;
    }
    return '';
  }, []);
  const domain = props.addressInfo?.domain;
  const inscription = props.addressInfo?.inscription;

  return (
    <Column>
      {inscription ? (
        <Column
          onClick={() => {
            setPopoverVisible(true);
          }}>
          {domain && <Text text={domain} textCenter={props.textCenter} />}
          {inscription && (
            <Row full itemsCenter mt="sm">
              <CopyableAddress address={inscription.address || ''} />
              <AccordingInscription inscription={inscription} />
            </Row>
          )}
        </Column>
      ) : (
        <Column
          onClick={() => {
            setPopoverVisible(true);
          }}>
          <Text text={shortAddress(address)} color={props.color || 'white'} />
        </Column>
      )}
      {popoverVisible && (
        <AddressDetailPopover
          address={address}
          onClose={() => {
            setPopoverVisible(false);
          }}
          // inputInfo={props.inputInfo}
        />
      )}
    </Column>
  );
};
