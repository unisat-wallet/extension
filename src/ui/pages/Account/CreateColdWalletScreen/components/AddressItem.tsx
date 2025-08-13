import { Column, Row, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';

import { bitcoinIconStyle } from '../constants';
import { AddressItemProps } from '../types';
import { formatAddress, formatBalance } from '../utils';

export default function AddressItem({
  address,
  index,
  balance = 0,
  isLoadingBalance,
  getDerivePath,
  showDivider
}: AddressItemProps) {
  return (
    <Column>
      <Row
        justifyBetween
        itemsCenter
        style={{
          padding: '16px 12px',
          minHeight: '56px'
        }}>
        <Column gap="xs" style={{ flex: 1 }}>
          <Row itemsCenter gap="sm">
            <Text
              text={formatAddress(address)}
              size="xs"
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
                fontFamily: 'monospace'
              }}
            />
            <Text
              text={getDerivePath(index)}
              size="xs"
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontWeight: 500
              }}
            />
          </Row>
        </Column>

        <Row itemsCenter gap="sm">
          <Row itemsCenter justifyCenter style={bitcoinIconStyle}>
            <Text text="₿" size="xs" color="black" style={{ fontWeight: 'bold' }} />
          </Row>
          {isLoadingBalance ? (
            <Text
              text="..."
              size="xs"
              color="primary"
              style={{
                fontWeight: 500,
                opacity: 0.6
              }}
            />
          ) : (
            <Text text={formatBalance(balance)} size="xs" color="primary" style={{ fontWeight: 500 }} />
          )}
        </Row>
      </Row>
      {showDivider && (
        <Row
          style={{
            height: '1px',
            backgroundColor: colors.line,
            margin: '0 12px'
          }}
        />
      )}
    </Column>
  );
}
