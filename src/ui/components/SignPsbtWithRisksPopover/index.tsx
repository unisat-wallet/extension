import { useEffect, useMemo, useState } from 'react';

import { DecodedPsbt, Risk, RiskType } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';

import { Button } from '../Button';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';
import { Arc20BurningList } from './Arc20BurningList';
import { BadFeeRate } from './BadFeeRate';
import { ChangingInscription } from './ChangingInscription';
import { InscriptionBurning } from './InscriptionBurning';
import { RunesBurningList } from './RunesBurningList';
import { SendingOutAssets } from './SendingOutAssets';

const visibleRiskDetailTypes = [
  RiskType.MULTIPLE_ASSETS,
  RiskType.INSCRIPTION_BURNING,
  RiskType.ATOMICALS_FT_BURNING,
  RiskType.ATOMICALS_NFT_BURNING,
  RiskType.LOW_FEE_RATE,
  RiskType.HIGH_FEE_RATE,
  //   RiskType.SPLITTING_INSCRIPTIONS,
  //   RiskType.MERGING_INSCRIPTIONS,
  RiskType.CHANGING_INSCRIPTION,
  RiskType.RUNES_BURNING
];

function getRiskContentKey(riskType: RiskType) {
  switch (riskType) {
    case RiskType.SIGHASH_NONE:
      return {
        title: 'sighash_none_risk_title',
        description: 'sighash_none_risk_description'
      };
    case RiskType.SCAMMER_ADDRESS:
      return {
        title: 'scammer_address_risk_title',
        description: 'scammer_address_risk_description'
      };
    case RiskType.NETWORK_NOT_MATCHED:
      return {
        title: 'network_not_matched_risk_title',
        description: 'network_not_matched_risk_description'
      };
    case RiskType.INSCRIPTION_BURNING:
      return {
        title: 'inscription_burning_risk_title',
        description: 'inscription_burning_risk_description'
      };
    case RiskType.MULTIPLE_ASSETS:
      return {
        title: 'multiple_assets_risk_title',
        description: 'multiple_assets_risk_description'
      };
    case RiskType.HIGH_FEE_RATE:
      return {
        title: 'high_fee_rate_risk_title',
        description: 'high_fee_rate_risk_description'
      };
    case RiskType.MERGING_INSCRIPTIONS:
      return {
        title: 'merging_inscriptions_risk_title',
        description: 'merging_inscriptions_risk_description'
      };
    case RiskType.CHANGING_INSCRIPTION:
      return {
        title: 'changing_inscription_risk_title',
        description: 'changing_inscription_risk_description'
      };
    case RiskType.RUNES_BURNING:
      return {
        title: 'runes_burning_risk_title',
        description: 'runes_burning_risk_description'
      };
    case RiskType.RUNES_MULTIPLE_ASSETS:
      return {
        title: 'runes_multiple_assets_risk_title',
        description: 'runes_multiple_assets_risk_description'
      };
    case RiskType.INDEXER_API_DOWN:
      return {
        title: 'indexer_api_down_risk_title',
        description: 'indexer_api_down_risk_description'
      };
    case RiskType.RUNES_API_DOWN:
      return {
        title: 'runes_api_down_risk_title',
        description: 'runes_api_down_risk_description'
      };
    case RiskType.ALKANES_BURNING:
      return {
        title: 'alkanes_burning_risk_title',
        description: 'alkanes_burning_risk_description'
      };
    case RiskType.ALKANES_MULTIPLE_ASSETS:
      return {
        title: 'alkanes_multiple_assets_risk_title',
        description: 'alkanes_multiple_assets_risk_description'
      };
    case RiskType.UTXO_INDEXING:
      return {
        title: 'utxo_indexing_risk_title',
        description: 'utxo_indexing_risk_description'
      };
    default:
      return {
        title: 'unknown_risk_title',
        description: 'unknown_risk_description'
      };
  }
}

export const SignPsbtWithRisksPopover = ({
  decodedPsbt,
  onConfirm,
  onClose
}: {
  decodedPsbt: DecodedPsbt;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const [inputValue, setInputValue] = useState('');
  const [understand, setUnderstand] = useState(false);
  const { t } = useI18n();
  const AGREEMENT_TEXT = 'CONFIRM';

  useEffect(() => {
    if (inputValue.toUpperCase() === AGREEMENT_TEXT) {
      setUnderstand(true);
    } else {
      setUnderstand(false);
    }
  }, [inputValue]);

  const [detailRisk, setDetailRisk] = useState<Risk | null>();

  const confirmable = useMemo(() => {
    const foundCriticalRisk = decodedPsbt.risks.find((v) => v.level === 'critical');
    if (foundCriticalRisk) {
      return false;
    } else {
      return true;
    }
  }, [decodedPsbt]);

  if (detailRisk) {
    if (detailRisk.type === RiskType.ATOMICALS_FT_BURNING) {
      return <Arc20BurningList decodedPsbt={decodedPsbt} onClose={() => setDetailRisk(null)} />;
    } else if (detailRisk.type === RiskType.INSCRIPTION_BURNING) {
      return <InscriptionBurning decodedPsbt={decodedPsbt} onClose={() => setDetailRisk(null)} />;
    } else if (detailRisk.type === RiskType.MULTIPLE_ASSETS) {
      return <SendingOutAssets decodedPsbt={decodedPsbt} onClose={() => setDetailRisk(null)} />;
    } else if (detailRisk.type === RiskType.LOW_FEE_RATE || detailRisk.type === RiskType.HIGH_FEE_RATE) {
      const riskContentKey = getRiskContentKey(detailRisk.type);
      return (
        <BadFeeRate decodedPsbt={decodedPsbt} riskContentKey={riskContentKey} onClose={() => setDetailRisk(null)} />
      );
    } else if (detailRisk.type === RiskType.CHANGING_INSCRIPTION) {
      return <ChangingInscription decodedPsbt={decodedPsbt} onClose={() => setDetailRisk(null)} />;
    } else if (detailRisk.type === RiskType.RUNES_BURNING) {
      return <RunesBurningList decodedPsbt={decodedPsbt} onClose={() => setDetailRisk(null)} />;
    }
  }

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Icon icon={'alert'} color={'red'} size={20} />
        <Text text={t('use_at_your_own_risk')} preset="title-bold" />
        <Text text={t('please_be_aware_that_sending_the_following_assets_involves_risk')} preset="sub" />

        <Column gap="md" fullX mb="md">
          {decodedPsbt.risks.map((risk, index) => {
            const riskContentKey = getRiskContentKey(risk.type);
            const title = riskContentKey.title ? t(riskContentKey.title) : risk.title;
            const desc = riskContentKey.description ? t(riskContentKey.description) : risk.desc;
            return (
              <Column
                key={'risk_' + index}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10 }}
                px="md"
                py="sm">
                <Row justifyBetween justifyCenter mt="sm">
                  <Text text={title} color={risk.level === 'warning' ? 'warning' : 'danger'} />
                  {visibleRiskDetailTypes.includes(risk.type) ? (
                    <Text
                      text={t('view')}
                      onClick={() => {
                        setDetailRisk(risk);
                      }}
                    />
                  ) : null}
                </Row>
                <Row style={{ borderBottomWidth: 1, color: colors.border }}></Row>
                <Text text={desc} preset="sub" />
              </Column>
            );
          })}

          {confirmable && (
            <Column>
              <Text text={t('understand_and_accept_the_risks_associated_with_this_transaction')} preset="sub" />

              <Row itemsCenter gap="sm" mb="md">
                <Text text={`${t('enter')} “${AGREEMENT_TEXT}” ${t('to_proceed')}`} preset="bold" />
              </Row>
              <Input
                preset="text"
                autoFocus={true}
                onChange={(e) => {
                  setInputValue(e.target.value);
                }}
              />
            </Column>
          )}
        </Column>

        <Row full>
          <Button
            text={t('cancel')}
            preset="default"
            full
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />

          {confirmable && (
            <Button
              text={t('confirm')}
              preset="danger"
              disabled={!understand}
              full
              onClick={(e) => {
                if (onConfirm) {
                  onConfirm();
                }
              }}
            />
          )}
        </Row>
      </Column>
    </Popover>
  );
};
