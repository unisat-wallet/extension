import { useMemo, useState } from 'react';

import { ToAddressInfo } from '@/shared/types';
import { ColorTypes } from '@/ui/theme/colors';
import { shortAddress } from '@/ui/utils';

import { AccordingInscription } from '../AccordingInscription';
import { AddressDetailPopover } from '../AddressDetailPopover';
import { Column } from '../Column';
import { CopyableAddress } from '../CopyableAddress';
import { Row } from '../Row';
import { Text } from '../Text';

export const AddressText = (props: {
  address?: string;
  addressInfo?: ToAddressInfo;
  textCenter?: boolean;
  color?: ColorTypes;
}) => {
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
        />
      )}
    </Column>
  );
};
