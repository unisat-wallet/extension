import { AddressType, ToSignInput } from '@unisat/wallet-sdk';
import { getAddressType } from '@unisat/wallet-sdk/lib/address';
import { bitcoin } from '@unisat/wallet-sdk/lib/bitcoin-core';

const DUMMY_SCRIPTS = {
  P2TR_FINAL_SCRIPT_WITNESS:
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  P2WPKH_FINAL_SCRIPT_WITNESS:
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  P2SH_P2WPKH_FINAL_SCRIPT_WITNESS:
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  P2SH_P2WPKH_FINAL_SCRIPT_SIG: '0000000000000000000000000000000000000000000000',
  P2PKH_FINAL_SCRIPT_SIG:
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
};

export function dummySignPsbt(userAddress: string, psbtStr: string, toSignInputs: ToSignInput[]) {
  const addressType = getAddressType(userAddress);
  const psbt = bitcoin.Psbt.fromBase64(psbtStr);
  toSignInputs.forEach((input) => {
    dummySignPsbtInput(psbt, input.index, addressType);
  });
  return psbt;
}

function dummySignPsbtInput(psbt: bitcoin.Psbt, inputIndex: number, addressType: AddressType) {
  if (addressType === AddressType.P2TR) {
    psbt.updateInput(inputIndex, {
      finalScriptWitness: Buffer.from(DUMMY_SCRIPTS.P2TR_FINAL_SCRIPT_WITNESS, 'hex')
    });
  } else if (addressType === AddressType.P2WPKH) {
    psbt.updateInput(inputIndex, {
      finalScriptWitness: Buffer.from(DUMMY_SCRIPTS.P2WPKH_FINAL_SCRIPT_WITNESS, 'hex')
    });
  } else if (addressType === AddressType.P2SH_P2WPKH) {
    psbt.updateInput(inputIndex, {
      finalScriptWitness: Buffer.from(DUMMY_SCRIPTS.P2SH_P2WPKH_FINAL_SCRIPT_WITNESS, 'hex'),
      finalScriptSig: Buffer.from(DUMMY_SCRIPTS.P2SH_P2WPKH_FINAL_SCRIPT_SIG, 'hex')
    });
  } else if (addressType === AddressType.P2PKH) {
    psbt.updateInput(inputIndex, {
      finalScriptSig: Buffer.from(DUMMY_SCRIPTS.P2PKH_FINAL_SCRIPT_SIG, 'hex')
    });
  }
}

export function formatPsbtHex(psbtHex: string) {
  let formatData = '';
  try {
    if (!/^[0-9a-fA-F]+$/.test(psbtHex)) {
      formatData = bitcoin.Psbt.fromBase64(psbtHex).toHex();
    } else {
      bitcoin.Psbt.fromHex(psbtHex);
      formatData = psbtHex;
    }
  } catch (e) {
    throw new Error('invalid psbt');
  }
  return formatData;
}

export function psbtFromString(psbtStr: string) {
  if (!/^[0-9a-fA-F]+$/.test(psbtStr)) {
    return bitcoin.Psbt.fromBase64(psbtStr);
  }
  return bitcoin.Psbt.fromHex(psbtStr);
}
