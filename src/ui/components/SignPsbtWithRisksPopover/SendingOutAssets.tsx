import BigNumber from 'bignumber.js';

import { DecodedPsbt, Inscription } from '@/shared/types';
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
                            onClose();
                        }}
                    />
                </Row>

                <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />
                {inscriptions.length > 0 ? (
                    <Column fullX>
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
                                    <InscriptionPreview
                                        key={'inscription_sending_' + index}
                                        data={inscription.data}
                                        preset="small"
                                    />
                                );
                            })}
                        </Row>
                    </Column>
                ) : null}

                {arc20List.length > 0 ? (
                    <Column fullX>
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
                    </Column>
                ) : null}

                {brc20List.length > 0 ? (
                    <Column fullX>
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
                ) : null}
            </Column>
        </Popover>
    );
};
