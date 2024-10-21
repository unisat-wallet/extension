import { useEffect, useMemo, useState } from 'react';

import { DecodedPsbt, Risk, RiskType } from '@/shared/types';
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

const AGREEMENT_TEXT = 'CONFIRM';

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
      return <BadFeeRate decodedPsbt={decodedPsbt} risk={detailRisk} onClose={() => setDetailRisk(null)} />;
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
        <Text text="Use at your own risk" preset="title-bold" />
        <Text text={'Please be aware that sending the following assets involves risk:'} preset="sub" />

        <Column gap="md" fullX mb="md">
          {decodedPsbt.risks.map((risk, index) => {
            return (
              <Column
                key={'risk_' + index}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10 }}
                px="md"
                py="sm">
                <Row justifyBetween justifyCenter mt="sm">
                  <Text text={risk.title} color={risk.level === 'warning' ? 'warning' : 'danger'} />
                  {visibleRiskDetailTypes.includes(risk.type) ? (
                    <Text
                      text={'View>'}
                      onClick={() => {
                        setDetailRisk(risk);
                      }}
                    />
                  ) : null}
                </Row>
                <Row style={{ borderBottomWidth: 1, color: colors.border }}></Row>
                <Text text={risk.desc} preset="sub" />
              </Column>
            );
          })}

          {confirmable && (
            <Column>
              <Text text={'I understand and accept the risks associated with this transaction.'} preset="sub" />

              <Row itemsCenter gap="sm" mb="md">
                <Text text={`Enter “${AGREEMENT_TEXT}” to proceed`} preset="bold" />
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
            text={'Cancel'}
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
              text={'Confirm'}
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
