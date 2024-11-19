import { KEYRING_TYPE } from "@/shared/constant";
import { HdKeyring, KeystoneKeyring } from "@btc-vision/wallet-sdk";
import { Keyring } from "../service/keyring";

export function isHDKeyring(keyring: Keyring): keyring is HdKeyring {
    return keyring.type === KEYRING_TYPE.HdKeyring;
}

export function isKeystoneKeyring(keyring: Keyring): keyring is KeystoneKeyring {
    return keyring.type === KEYRING_TYPE.KeystoneKeyring;
}