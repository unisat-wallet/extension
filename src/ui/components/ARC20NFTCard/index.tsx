import { Tooltip } from 'antd';

// import { TokenBalance } from '@/shared/types';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { InfoCircleOutlined } from '@ant-design/icons';
import { toUnicode } from 'punycode';
import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { IAtomicalBalanceItem } from '@/background/service/interfaces/api';
import { findValueInDeepObject } from '@/ui/utils';
import { Image } from '../Image';
import { spacingGap } from '@/ui/theme/spacing';
import { Tag } from '../Tag';
// import Checkbox from '../Checkbox';

export interface ARC20NFTCardProps {
  tokenBalance: IAtomicalBalanceItem;
  onClick?: () => void;
  checkbox?: boolean;
  selectvalues?: string[];
}

export default function ARC20NFTCard(props: ARC20NFTCardProps) {
  const {
    tokenBalance: { ticker, confirmed, data },
    checkbox,
    selectvalues,
    onClick
  } = props;

  // let realm = data.realm;
  let ct, b64String;
  const mint_data = data.mint_data;
  if (mint_data) {
    ct = findValueInDeepObject(mint_data.fields!, '$ct');
    if (ct) {
      if (ct.endsWith('webp')) {
        ct = 'image/webp';
      } else if (ct.endsWith('svg')) {
        ct = 'image/svg+xml';
      } else if (ct.endsWith('png')) {
        ct = 'image/png';
      } else if (ct.endsWith('jpg') || ct.endsWith('jpeg')) {
        ct = 'image/jpeg';
      } else if (ct.endsWith('gif')) {
        ct = 'image/gif';
      }
      const data = findValueInDeepObject(mint_data.fields!, '$d');
      b64String = Buffer.from(data, 'hex').toString('base64');
    }
  }
  console.log('data=====', data.$realm);

  return (
    <Card
      style={{
        backgroundColor: '#141414',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        width: 150,
        height: 120,
        minWidth: 150,
        minHeight: 120
      }}
      onClick={onClick}>
      {data.$realm ? (
        <Column full gap={'xs'}>
          <Row justifyBetween itemsCenter>
            <Text text={`# ${data.atomical_number.toLocaleString()}`} color="blue" />
            {/* {
              checkbox && <Checkbox value={data.atomical_id} checked={selectvalues?.includes(data.atomical_id)} />
            } */}
          </Row>
          <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Column>
            <div>
              <Tag preset='success' text={'Realm'} />
            </div>
            <Row justifyCenter>
              <Text
                text={
                  data.$full_realm_name!.toLowerCase().startsWith('xn--')
                    ? toUnicode(data.$full_realm_name!)
                    : data.$full_realm_name
                }
                color="textDim"
                size="xxl"
              />
            </Row>
            <Text text={`${confirmed} sats`} size="xs" />
          </Column>
        </Column>
      ) : (
        <Column full gap={'xs'}>
          <Row justifyBetween itemsCenter>
            <Text text={`# ${data.atomical_number.toLocaleString()}`} color="blue" />
            {/* {
              checkbox && <Checkbox value={data.atomical_id} checked={selectvalues?.includes(data.atomical_id)} />
            } */}
          </Row>
          <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Column>
            <div>
              <Tag  preset='default' text={ct} />
            </div>
            <Row justifyCenter>
              <Image size={24} src={`data:${ct};base64,${b64String}`} />
            </Row>
            <Text text={`${confirmed} sats`} size="xs" />
          </Column>
        </Column>
      )}
    </Card>
  );
}
