import { Tooltip } from 'antd';

import { Icon, Row, Text } from '@/ui/components';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { fontSizes } from '@/ui/theme/font';
import { amountToSatoshis } from '@/ui/utils';

import Section from './Section';

const FeeSection = ({ txInfo, t, networkFee, btcUnit }) => {
  return (
    <>
      <Section title={t('network_fee')} extra={<BtcUsd sats={amountToSatoshis(networkFee)} />}>
        <Text text={networkFee} />
        <Text text={btcUnit} color="textDim" />
      </Section>

      <Section title={t('network_fee_rate')}>
        {txInfo.decodedPsbt.shouldWarnFeeRate ? (
          <Tooltip
            title={
              txInfo.decodedPsbt.recommendedFeeRate > txInfo.decodedPsbt.feeRate
                ? `${t('the_fee_rate_is_much_lower_than_recommended_fee_rate')} (${
                    txInfo.decodedPsbt.recommendedFeeRate
                  } sat/vB)`
                : `${t('the_fee_rate_is_much_higher_than_recommended_fee_rate')} (${
                    txInfo.decodedPsbt.recommendedFeeRate
                  } sat/vB)`
            }
            overlayStyle={{
              fontSize: fontSizes.xs
            }}>
            <div>
              <Row>
                <Text text={txInfo.decodedPsbt.feeRate.toString()} />
                <Icon icon="alert" color="warning" />
              </Row>
            </div>
          </Tooltip>
        ) : (
          <Text text={txInfo.decodedPsbt.feeRate.toString()} />
        )}

        <Text text="sat/vB" color="textDim" />
      </Section>
    </>
  );
};

export default FeeSection;
