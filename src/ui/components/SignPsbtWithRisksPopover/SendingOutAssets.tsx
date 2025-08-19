import BigNumber from 'bignumber.js';

import { AlkanesBalance, DecodedPsbt, Inscription, RuneBalance } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Icon } from '../Icon';
import InscriptionPreview from '../InscriptionPreview';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const SendingOutAssets = ({ decodedPsbt, onClose }: { decodedPsbt: DecodedPsbt; onClose: () => void }) => {
  const currentAccount = useCurrentAccount();
  const { t } = useI18n();

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

  const runesBalanceIn: {
    [key: string]: BigNumber;
  } = {};

  const runesBalanceOut: {
    [key: string]: BigNumber;
  } = {};

  const alkanesBalanceIn: {
    [key: string]: BigNumber;
  } = {};

  const alkanesBalanceOut: {
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
      inputInfo.runes?.forEach((rune) => {
        const key = rune.runeid;
        runesBalanceIn[key] = runesBalanceIn[key] || BigNumber(0);
        runesBalanceIn[key] = runesBalanceIn[key].plus(new BigNumber(rune.amount));
      });

      inputInfo.alkanes?.forEach((alkane) => {
        const key = alkane.alkaneid;
        alkanesBalanceIn[key] = alkanesBalanceIn[key] || BigNumber(0);
        alkanesBalanceIn[key] = alkanesBalanceIn[key].plus(new BigNumber(alkane.amount));
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
      outputInfo.runes?.forEach((rune) => {
        const key = rune.runeid;
        runesBalanceOut[key] = runesBalanceOut[key] || BigNumber(0);
        runesBalanceOut[key] = runesBalanceOut[key].plus(new BigNumber(rune.amount));
      });

      outputInfo.alkanes?.forEach((alkane) => {
        const key = alkane.alkaneid;
        alkanesBalanceOut[key] = alkanesBalanceOut[key] || BigNumber(0);
        alkanesBalanceOut[key] = alkanesBalanceOut[key].plus(new BigNumber(alkane.amount));
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

  const arc20List = Object.keys(arc20BalanceChanged)
    .filter((ticker) => arc20BalanceChanged[ticker] < 0) // Only show assets being sent out
    .map((ticker) => {
      return {
        ticker: ticker,
        amount: Math.abs(arc20BalanceChanged[ticker]) // Show absolute value
      };
    });

  const brc20BalanceChanged: { [key: string]: BigNumber } = {};
  for (const id in brc20BalanceIn) {
    brc20BalanceChanged[id] = (brc20BalanceOut[id] || BigNumber(0)).minus(brc20BalanceIn[id]);
  }

  const brc20List = Object.keys(brc20BalanceChanged)
    .filter((ticker) => brc20BalanceChanged[ticker].isNegative()) // Only show assets being sent out
    .map((ticker) => {
      return {
        ticker: ticker,
        amount: brc20BalanceChanged[ticker].abs().toString() // Show absolute value
      };
    });

  const runesBalanceChanged: { [key: string]: { change: BigNumber; rune: RuneBalance } } = {};
  for (const id in runesBalanceIn) {
    const change = (runesBalanceOut[id] || BigNumber(0)).minus(runesBalanceIn[id]);
    if (change.isNegative()) {
      // Only show assets being sent out (negative change)
      // Find the rune info from either input or output
      let runeInfo: RuneBalance | undefined;
      for (const inputInfo of decodedPsbt.inputInfos) {
        const found = inputInfo.runes?.find((r) => r.runeid === id);
        if (found) {
          runeInfo = found;
          break;
        }
      }
      if (!runeInfo) {
        for (const outputInfo of decodedPsbt.outputInfos) {
          const found = outputInfo.runes?.find((r) => r.runeid === id);
          if (found) {
            runeInfo = found;
            break;
          }
        }
      }
      if (runeInfo) {
        runesBalanceChanged[id] = { change, rune: runeInfo };
      }
    }
  }

  const runesList = Object.keys(runesBalanceChanged).map((runeid) => {
    const { change, rune } = runesBalanceChanged[runeid];
    return {
      runeid: runeid,
      rune: rune,
      amount: change.abs().toString() // Show absolute value
    };
  });

  const alkanesBalanceChanged: { [key: string]: { change: BigNumber; alkane: AlkanesBalance } } = {};
  for (const id in alkanesBalanceIn) {
    const change = (alkanesBalanceOut[id] || BigNumber(0)).minus(alkanesBalanceIn[id]);
    if (change.isNegative()) {
      // Only show assets being sent out (negative change)
      // Find the alkane info from either input or output
      let alkaneInfo: AlkanesBalance | undefined;
      for (const inputInfo of decodedPsbt.inputInfos) {
        const found = inputInfo.alkanes?.find((a) => a.alkaneid === id);
        if (found) {
          alkaneInfo = found;
          break;
        }
      }
      if (!alkaneInfo) {
        for (const outputInfo of decodedPsbt.outputInfos) {
          const found = outputInfo.alkanes?.find((a) => a.alkaneid === id);
          if (found) {
            alkaneInfo = found;
            break;
          }
        }
      }
      if (alkaneInfo) {
        alkanesBalanceChanged[id] = { change, alkane: alkaneInfo };
      }
    }
  }

  console.log(runesBalanceIn, runesBalanceOut, runesBalanceChanged);
  const alkanesList = Object.keys(alkanesBalanceChanged).map((alkaneid) => {
    const { change, alkane } = alkanesBalanceChanged[alkaneid];
    return {
      alkaneid: alkaneid,
      alkane: alkane,
      amount: change.abs().toString() // Show absolute value
    };
  });

  console.log(runesList, alkanesList);

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Row fullX justifyBetween>
          <Row />
          <Text text={t('sending_out_assets')} preset="bold" />
          <Icon
            icon="close"
            onClick={() => {
              onClose();
            }}
          />
        </Row>

        <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />
        {inscriptions.length > 0 ? (
          <Column fullX>
            <Text text={`${t('inscriptions')}:`}></Text>
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
          </Column>
        ) : null}

        {arc20List.length > 0 ? (
          <Column fullX>
            <Text text={`${t('arc20')}:`} mt="md"></Text>
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
          </Column>
        ) : null}

        {brc20List.length > 0 ? (
          <Column fullX>
            <Text text={'brc20:'} mt="md"></Text>
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
        ) : null}

        {runesList.length > 0 ? (
          <Column fullX>
            <Text text={`${t('runes')}:`} mt="md"></Text>
            {runesList.map((runeItem, index) => {
              return (
                <Row
                  key={'runes_sending_' + index}
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
                    <Text text={runeItem.rune.spacedRune || runeItem.rune.rune} />
                    {runeItem.rune.symbol && <Text text={` (${runeItem.rune.symbol})`} />}
                  </Row>

                  <Text
                    text={new BigNumber(runeItem.amount).div(Math.pow(10, runeItem.rune.divisibility)).toString()}
                  />
                </Row>
              );
            })}
          </Column>
        ) : null}

        {alkanesList.length > 0 ? (
          <Column fullX>
            <Text text={'Alkanes:'} mt="md"></Text>
            {alkanesList.map((alkaneItem, index) => {
              return (
                <Row
                  key={'alkanes_sending_' + index}
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
                    <Text text={alkaneItem.alkane.name || alkaneItem.alkane.symbol} />
                    {alkaneItem.alkane.symbol && alkaneItem.alkane.name !== alkaneItem.alkane.symbol && (
                      <Text text={` (${alkaneItem.alkane.symbol})`} />
                    )}
                  </Row>

                  <Text
                    text={new BigNumber(alkaneItem.amount).div(Math.pow(10, alkaneItem.alkane.divisibility)).toString()}
                  />
                </Row>
              );
            })}
          </Column>
        ) : null}
      </Column>
    </Popover>
  );
};
