export const testDecodedTx = {
    code: 0,
    msg: 'ok',
    data: {
        inputInfos: [
            {
                txid: 'e19512fb8177cb676faa44390fc757ce78934bf6495d5a6a50736123994ded78',
                vout: 1,
                address: 'tb1qkrewl9zclku2qngth52eezdyrwmjpcspttdypa',
                value: 546,
                inscriptions: [
                    {
                        inscriptionId: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                        inscriptionNumber: 18529581,
                        offset: 0
                    },
                    {
                        inscriptionId: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i1',
                        inscriptionNumber: 18529583,
                        offset: 0
                    },
                    {
                        inscriptionId: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i2',
                        inscriptionNumber: 18529584,
                        offset: 0
                    }
                ],
                atomicals: [
                    {
                        type: 'FT',
                        ticker: 'atom'
                    }
                ],
                runes: [
                    {
                        runeid: '1222:90',
                        spacedRune: 'AAAAA',
                        amount: '100',
                        divisibility: 3,
                        symbol: 'G'
                    }
                ],
                onchain: true,
                height: 824479
            },
            {
                txid: 'f3abed06096fd2d6d294bf4133c6ee89e4438c4b3ea5cdf2336da09d7357db54',
                vout: 1,
                address: 'bc1p8tf3csd75fhlwe7u42hx92rgvxgu7vycjmslrppz4rd0gggv2t5qxpymsu',
                value: 24077,
                inscriptions: [],
                atomicals: [],
                onchain: true,
                height: 824868
            }
        ],
        outputInfos: [
            {
                address: 'bc1p8tf3csd75fhlwe7u42hx92rgvxgu7vycjmslrppz4rd0gggv2t5qxpymsu',
                value: 546,
                inscriptions: [
                    {
                        offset: 0,
                        inscriptionId: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                        inscriptionNumber: 18529581,
                        outputValue: 546
                    }
                ],
                atomicals: []
            },
            {
                address: 'bc1p8tf3csd75fhlwe7u42hx92rgvxgu7vycjmslrppz4rd0gggv2t5qxpymsu',
                value: 21745,
                inscriptions: [
                    {
                        inscriptionId: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i1',
                        inscriptionNumber: 18529583,
                        offset: 0
                    }
                ],
                atomicals: [],
                runes: [
                    {
                        runeid: '1222:90',
                        spacedRune: 'AAAAA',
                        amount: '10',
                        divisibility: 20,
                        symbol: 'G'
                    }
                ]
            }
        ],
        feeRate: '11.0',
        fee: 2332,
        isCompleted: true,
        risks: [
            {
                title: 'Atomicals FT destroyed detected',
                desc: 'Atomicals FT atom will be destroyed',
                level: 'danger',
                type: 6
            },
            {
                title: 'Inscription lost detected',
                desc: '10 inscriptions will be lost',
                level: 'danger',
                type: 3
            },
            {
                level: 'danger',
                title: 'Multiple assets detected',
                desc: 'This transaction mixed with multiple assets',
                type: 7
            },
            {
                type: 8,
                level: 'warning',
                title: 'High fee rate detected',
                desc: 'The fee rate is much higher than recommended fee rate'
            },
            {
                type: 12,
                level: 'warning',
                title: 'Changing inscription detected',
                desc: 'The outputValue of the inscription has been changed'
            },
            {
                type: 13,
                level: 'warning',
                title: 'Changing inscription detected',
                desc: 'The outputValue of the inscription has been changed'
            }
        ],

        features: {
            rbf: false
        },
        inscriptions: {
            '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0': {
                inscriptionId: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                inscriptionNumber: 18529581,
                address: 'bc1p8tf3csd75fhlwe7u42hx92rgvxgu7vycjmslrppz4rd0gggv2t5qxpymsu',
                outputValue: 546,
                preview:
                    'https://ordinals.com/preview/789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                content:
                    'https://ordinals.com/content/789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                contentLength: 18,
                contentType: 'text/plain;charset=utf-8',
                contentBody: '',
                timestamp: 1689995529,
                genesisTransaction: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9',
                location: 'e19512fb8177cb676faa44390fc757ce78934bf6495d5a6a50736123994ded78:1:0',
                output: 'e19512fb8177cb676faa44390fc757ce78934bf6495d5a6a50736123994ded78:1',
                offset: 0,
                utxoHeight: 824479,
                utxoConfirmation: 10992,
                brc20: {
                    tick: 'ordi',
                    amt: '100'
                }
            },
            '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i1': {
                inscriptionId: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                inscriptionNumber: 18529581,
                address: 'bc1p8tf3csd75fhlwe7u42hx92rgvxgu7vycjmslrppz4rd0gggv2t5qxpymsu',
                outputValue: 546,
                preview:
                    'https://ordinals.com/preview/789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                content:
                    'https://ordinals.com/content/789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                contentLength: 18,
                contentType: 'text/plain;charset=utf-8',
                contentBody: '',
                timestamp: 1689995529,
                genesisTransaction: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9',
                location: 'e19512fb8177cb676faa44390fc757ce78934bf6495d5a6a50736123994ded78:1:0',
                output: 'e19512fb8177cb676faa44390fc757ce78934bf6495d5a6a50736123994ded78:1',
                offset: 0,
                utxoHeight: 824479,
                utxoConfirmation: 10992
            },
            '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i2': {
                inscriptionId: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                inscriptionNumber: 18529581,
                address: 'bc1p8tf3csd75fhlwe7u42hx92rgvxgu7vycjmslrppz4rd0gggv2t5qxpymsu',
                outputValue: 546,
                preview:
                    'https://ordinals.com/preview/789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                content:
                    'https://ordinals.com/content/789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9i0',
                contentLength: 18,
                contentType: 'text/plain;charset=utf-8',
                contentBody: '',
                timestamp: 1689995529,
                genesisTransaction: '789d2c6ec282d852b34b655fd8fe6a383747a7aee9fe8cd1f24208cb9bcecce9',
                location: 'e19512fb8177cb676faa44390fc757ce78934bf6495d5a6a50736123994ded78:1:0',
                output: 'e19512fb8177cb676faa44390fc757ce78934bf6495d5a6a50736123994ded78:1',
                offset: 0,
                utxoHeight: 824479,
                utxoConfirmation: 10992
            }
        }
    }
};
