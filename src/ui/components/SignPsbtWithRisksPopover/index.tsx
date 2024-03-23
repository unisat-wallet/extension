import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

import { DecodedPsbt, Inscription, Risk, RiskType } from '@/shared/types';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { colors } from '@/ui/theme/colors';

import { Button } from '../Button';
import { Column } from '../Column';
import { FeeRateBar } from '../FeeRateBar';
import { Icon } from '../Icon';
import { Input } from '../Input';
import InscriptionPreview from '../InscriptionPreview';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

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
  RiskType.CHANGING_INSCRIPTION
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
    if (inputValue === AGREEMENT_TEXT) {
      setUnderstand(true);
    }
  }, [inputValue]);

  const [detailRisk, setDetailRisk] = useState<Risk | null>(decodedPsbt.risks[4]);
  const currentAccount = useCurrentAccount();
  if (detailRisk) {
    if (detailRisk.type === RiskType.ATOMICALS_FT_BURNING) {
      const inputTokenMap = {};

      decodedPsbt.inputInfos.forEach((inputInfo) => {
        inputInfo.atomicals.forEach((ins) => {
          if (ins.type === 'FT') {
            const ticker = ins.ticker || '';
            inputTokenMap[ticker] = inputTokenMap[ticker] || 0;
            inputTokenMap[ticker] += inputInfo.value;
          }
        });
      });

      const outputTokenMap = {};
      decodedPsbt.outputInfos.forEach((outputInfo) => {
        outputInfo.atomicals.forEach((ins) => {
          if (ins.type === 'FT') {
            const ticker = ins.ticker || '';
            outputTokenMap[ticker] = outputTokenMap[ticker] || 0;
            outputTokenMap[ticker] += outputInfo.value;
          }
        });
      });

      const burnList: { ticker: string; amount: number }[] = [];
      Object.keys(inputTokenMap).forEach((ticker) => {
        const outAmount = outputTokenMap[ticker] || 0;
        if (outAmount < inputTokenMap[ticker]) {
          burnList.push({
            ticker: ticker,
            amount: inputTokenMap[ticker] - outAmount
          });
        }
      });

      return (
        <Popover>
          <Column justifyCenter itemsCenter>
            <Row fullX justifyBetween>
              <Row />
              <Text text="ARC20 Burn Risk List" preset="bold" />
              <Icon
                icon="close"
                onClick={() => {
                  setDetailRisk(null);
                }}
              />
            </Row>

            <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />

            {burnList.map((burn, index) => {
              return (
                <Row
                  key={'arc20_burn_' + index}
                  justifyBetween
                  fullX
                  px="md"
                  py="xl"
                  style={{
                    backgroundColor: '#1e1a1e',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#442326'
                  }}>
                  <Row>
                    <Icon icon="burn" color="red" />
                    <Text text={burn.ticker} />
                  </Row>

                  <Text text={burn.amount} />
                </Row>
              );
            })}
          </Column>
        </Popover>
      );
    } else if (detailRisk.type === RiskType.INSCRIPTION_BURNING) {
      const inputInscriptionMap = {};
      decodedPsbt.inputInfos.forEach((inputInfo) => {
        inputInfo.inscriptions.forEach((ins) => {
          inputInscriptionMap[ins.inscriptionId] = true;
        });
      });

      const outputInscriptionMap = {};
      decodedPsbt.outputInfos.forEach((outputInfo) => {
        outputInfo.inscriptions.forEach((ins) => {
          outputInscriptionMap[ins.inscriptionId] = true;
        });
      });

      const burnList: string[] = [];
      Object.keys(inputInscriptionMap).forEach((insId) => {
        if (!outputInscriptionMap[insId]) {
          burnList.push(insId);
        }
      });

      return (
        <Popover>
          <Column justifyCenter itemsCenter>
            <Row fullX justifyBetween>
              <Row />
              <Text text="Inscription Burn Risk List" preset="bold" />
              <Icon
                icon="close"
                onClick={() => {
                  setDetailRisk(null);
                }}
              />
            </Row>
            <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />
            <Row
              justifyBetween
              fullX
              px="md"
              py="xl"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#442326'
              }}
              overflowX>
              {burnList.map((burn, index) => {
                return (
                  <InscriptionPreview
                    key={'inscription_burn_' + index}
                    data={decodedPsbt.inscriptions[burn]}
                    preset="small"
                  />
                );
              })}
            </Row>
          </Column>
        </Popover>
      );
    } else if (detailRisk.type === RiskType.MULTIPLE_ASSETS) {
      const inscriptionMap: {
        [key: string]: {
          data: Inscription;
          from: string;
          to: string;
        };
      } = {};
      for (const id in decodedPsbt.inscriptions) {
        inscriptionMap[id] = {
          data: decodedPsbt.inscriptions[id],
          from: '',
          to: ''
        };
      }

      const arc20BalanceIn: {
        [key: string]: number;
      } = {};

      const arc20BalanceOut: {
        [key: string]: number;
      } = {};

      const brc20BalanceIn: {
        [key: string]: BigNumber;
      } = {};

      const brc20BalanceOut: {
        [key: string]: BigNumber;
      } = {};

      decodedPsbt.inputInfos.forEach((inputInfo) => {
        inputInfo.inscriptions.forEach((ins) => {
          inscriptionMap[ins.inscriptionId].from = inputInfo.address;
          if (inputInfo.address === currentAccount?.address) {
            const info = decodedPsbt.inscriptions[ins.inscriptionId];
            if (info.brc20) {
              const ticker = info.brc20.tick;
              brc20BalanceIn[ticker] = brc20BalanceIn[ticker] || BigNumber(0);
              brc20BalanceIn[ticker] = brc20BalanceIn[ticker].plus(new BigNumber(info.brc20.amt));
            }
          }
        });
        if (inputInfo.address === currentAccount?.address) {
          inputInfo.atomicals.forEach((v) => {
            if (v.type === 'FT') {
              const ticker = v.ticker || '';
              arc20BalanceIn[ticker] = arc20BalanceIn[ticker] || 0;
              arc20BalanceIn[ticker] += inputInfo.value;
            }
          });
        }
      });

      decodedPsbt.outputInfos.forEach((outputInfo) => {
        outputInfo.inscriptions.forEach((ins) => {
          inscriptionMap[ins.inscriptionId].to = outputInfo.address;
          if (outputInfo.address === currentAccount?.address) {
            const info = decodedPsbt.inscriptions[ins.inscriptionId];
            if (info.brc20) {
              const ticker = info.brc20.tick;
              brc20BalanceOut[ticker] = brc20BalanceOut[ticker] || BigNumber(0);
              brc20BalanceOut[ticker] = brc20BalanceOut[ticker].plus(new BigNumber(info.brc20.amt));
            }
          }
        });

        if (outputInfo.address === currentAccount?.address) {
          outputInfo.atomicals.forEach((v) => {
            if (v.type === 'FT') {
              const ticker = v.ticker || '';
              arc20BalanceOut[ticker] = arc20BalanceOut[ticker] || 0;
              arc20BalanceOut[ticker] += outputInfo.value;
            }
          });
        }
      });

      // only show the inscriptions that are from current account
      const inscriptions = Object.keys(inscriptionMap)
        .map((id) => {
          return inscriptionMap[id];
        })
        .filter((v) => {
          if (v.from === currentAccount.address && v.to !== currentAccount.address) {
            return true;
          } else {
            return false;
          }
        });

      const arc20BalanceChanged: { [key: string]: number } = {};
      for (const id in arc20BalanceIn) {
        arc20BalanceChanged[id] = (arc20BalanceOut[id] || 0) - arc20BalanceIn[id];
      }

      const arc20List = Object.keys(arc20BalanceChanged).map((ticker) => {
        return {
          ticker: ticker,
          amount: arc20BalanceChanged[ticker]
        };
      });

      const brc20BalanceChanged: { [key: string]: BigNumber } = {};
      for (const id in brc20BalanceIn) {
        brc20BalanceChanged[id] = (brc20BalanceOut[id] || BigNumber(0)).minus(brc20BalanceIn[id]);
      }

      const brc20List = Object.keys(brc20BalanceChanged).map((ticker) => {
        return {
          ticker: ticker,
          amount: brc20BalanceChanged[ticker].toString()
        };
      });

      return (
        <Popover>
          <Column justifyCenter itemsCenter>
            <Row fullX justifyBetween>
              <Row />
              <Text text="Sending Out Assets" preset="bold" />
              <Icon
                icon="close"
                onClick={() => {
                  setDetailRisk(null);
                }}
              />
            </Row>

            <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />
            <Text text={'Inscriptions:'}></Text>
            <Row
              justifyBetween
              fullX
              px="md"
              py="xl"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#442326'
              }}
              overflowX>
              {inscriptions.map((inscription, index) => {
                return (
                  <InscriptionPreview key={'inscription_sending_' + index} data={inscription.data} preset="small" />
                );
              })}
            </Row>

            <Text text={'ARC20:'} mt="md"></Text>
            {arc20List.map((burn, index) => {
              return (
                <Row
                  key={'arc20_sending_' + index}
                  justifyBetween
                  fullX
                  px="md"
                  py="xl"
                  style={{
                    backgroundColor: '#1e1a1e',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#442326'
                  }}>
                  <Row>
                    <Text text={burn.ticker} />
                  </Row>

                  <Text text={burn.amount} />
                </Row>
              );
            })}

            <Text text={'BRC20:'} mt="md"></Text>
            {brc20List.map((burn, index) => {
              return (
                <Row
                  key={'brc20_sending_' + index}
                  justifyBetween
                  fullX
                  px="md"
                  py="xl"
                  style={{
                    backgroundColor: '#1e1a1e',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#442326'
                  }}>
                  <Row>
                    <Text text={burn.ticker} />
                  </Row>

                  <Text text={burn.amount} />
                </Row>
              );
            })}
          </Column>
        </Popover>
      );
    } else if (detailRisk.type === RiskType.LOW_FEE_RATE || detailRisk.type === RiskType.HIGH_FEE_RATE) {
      return (
        <Popover>
          <Column justifyCenter itemsCenter>
            <Row fullX justifyBetween>
              <Row />
              <Text text={detailRisk.title} preset="bold" />
              <Icon
                icon="close"
                onClick={() => {
                  setDetailRisk(null);
                }}
              />
            </Row>

            <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />

            <Text text={`Current fee rate:`} preset="sub" />
            <Text text={`${decodedPsbt.feeRate} sat/vB`} />

            <Text text={`Recommended fee rates:`} preset="sub" mt="lg" />
            <FeeRateBar readonly />
          </Column>
        </Popover>
      );
    } else if (detailRisk.type === RiskType.CHANGING_INSCRIPTION) {
      const inscriptionValueMap: { [key: string]: { in: number; out: number } } = {};
      decodedPsbt.inputInfos.forEach((inputInfo) => {
        inputInfo.inscriptions.forEach((ins) => {
          inscriptionValueMap[ins.inscriptionId] = inscriptionValueMap[ins.inscriptionId] || { in: 0, out: 0 };
          inscriptionValueMap[ins.inscriptionId].in = inputInfo.value;
        });
      });
      decodedPsbt.outputInfos.forEach((outputInfo) => {
        outputInfo.inscriptions.forEach((ins) => {
          inscriptionValueMap[ins.inscriptionId] = inscriptionValueMap[ins.inscriptionId] || { in: 0, out: 0 };
          inscriptionValueMap[ins.inscriptionId].out = outputInfo.value;
        });
      });
      const inscriptions = Object.keys(inscriptionValueMap)
        .map((id) => {
          return {
            id: id,
            in: inscriptionValueMap[id].in,
            out: inscriptionValueMap[id].out,
            data: decodedPsbt.inscriptions[id]
          };
        })
        .filter((v) => v.in !== v.out);

      return (
        <Popover>
          <Column justifyCenter itemsCenter>
            <Row fullX justifyBetween>
              <Row />
              <Text text="Changing Inscriptoins" preset="bold" />
              <Icon
                icon="close"
                onClick={() => {
                  setDetailRisk(null);
                }}
              />
            </Row>

            <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />

            {inscriptions.map((inscription, index) => {
              return (
                <Row
                  key={inscription.id}
                  justifyBetween
                  fullX
                  justifyCenter
                  px="md"
                  py="xl"
                  style={{
                    backgroundColor: '#1e1a1e',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#442326'
                  }}>
                  <InscriptionPreview key={'inscription_sending_' + index} data={inscription.data} preset="small" />
                  <Column justifyCenter>
                    <Text text={`Old Value: `} preset="sub" textEnd />
                    <Text text={`${inscription.in} sats`} textEnd />

                    <Text text={`New Value: `} preset="sub" textEnd />
                    <Text text={`${inscription.out} sats`} textEnd />
                  </Column>
                </Row>
              );
            })}
          </Column>
        </Popover>
      );
    }
  }

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Icon icon={'alert'} color={'red'} size={20} />
        <Text text="Use at your own risk" preset="title-bold" />
        <Text text={'Please be aware that sending the following assets involves risk:'} preset="sub" />

        <Column gap="md">
          {decodedPsbt.risks.map((risk, index) => {
            return (
              <Column
                key={'risk_' + index}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10 }}
                px="md"
                py="sm">
                <Row justifyBetween justifyCenter mt="sm">
                  <Text text={risk.title} color={risk.level === 'danger' ? 'danger' : 'warning'} />
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

        <Row full>
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
        </Row>
      </Column>
    </Popover>
  );
};
