import { useMemo, useState } from 'react';

import { ToAddressInfo } from '@/shared/types';
import { ColorTypes } from '@/ui/theme/colors';
import { shortAddress } from '@/ui/utils';

import { AddressDetailPopover } from '../AddressDetailPopover';
import { Column } from '../Column';
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
    return (
        <Column>
            <Column
                onClick={() => {
                    setPopoverVisible(true);
                }}>
                <Text text={shortAddress(address)} color={props.color ?? 'white'} />
            </Column>
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
