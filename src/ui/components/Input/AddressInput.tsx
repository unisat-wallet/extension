import React, { useEffect, useState } from 'react';

import { getSatsName } from '@/shared/lib/satsname-utils';
import { Inscription } from '@/shared/types';
import { Icon, Row, Text } from '@/ui/components';
import { getAddressType, isValidAddress } from '@/ui/utils/bitcoin-utils';
import { useChain, useI18n, useWallet } from '@unisat/wallet-state';

import { CHAINS_MAP, SAFE_DOMAIN_CONFIRMATION } from '@unisat/wallet-shared';
import { AddressType, ChainType } from '@unisat/wallet-types';
import { $baseContainerStyle, $baseTextareaStyle, InputProps } from '.';
import { AccordingInscription } from '../AccordingInscription';
import { Column } from '../Column';
import { ContactsModal } from '../ContactsModal';
import { CopyableAddress } from '../CopyableAddress';

export const AddressInput = (props: InputProps) => {
  const { t } = useI18n();
  const {
    placeholder,
    onAddressInputChange,
    addressInputData,
    style: $inputStyleOverride,
    networkType: propsNetworkType,
    recipientLabel,
    ...rest
  } = props;

  if (!addressInputData || !onAddressInputChange) {
    return <div />;
  }

  const [showContactsModal, setShowContactsModal] = useState(false);
  const [validAddress, setValidAddress] = useState(addressInputData.address || '');
  const [parseName, setParseName] = useState<boolean>(false);
  const [parseAddress, setParseAddress] = useState(addressInputData.domain ? addressInputData.address : '');
  const [parseError, setParseError] = useState('');
  const [formatError, setFormatError] = useState('');
  const [inscription, setInscription] = useState<Inscription>();
  const [inputVal, setInputVal] = useState(addressInputData.domain || addressInputData.address || '');
  const [searching, setSearching] = useState(false);
  const [addressTip, setAddressTip] = useState('');

  const wallet = useWallet();
  const chain = useChain();
  const networkType = propsNetworkType || chain.enum;

  let SUPPORTED_DOMAINS = ['sats', 'unisat', 'x', 'btc'];
  let inputAddressPlaceholder = props.addressPlaceholder || t('address_or_name_sats_unisat_etc');
  if (chain.isFractal) {
    SUPPORTED_DOMAINS = ['fb'];
    inputAddressPlaceholder = t('address_or_name_fb');
  }

  function getAddressTips(address: string, chanEnum: ChainType) {
    let ret = {
      homeTip: '',
      sendTip: ''
    };
    try {
      const chain = CHAINS_MAP[chanEnum];
      const addressType = getAddressType(address, chain.networkType);
      if (chain.isFractal && addressType === AddressType.P2PKH) {
        ret = {
          homeTip: t('legacy_address_warning_3'),
          sendTip: t('legacy_address_warning_4')
        };
      }
    } catch (e) {
      console.log(e);
    }

    return ret;
  }

  useEffect(() => {
    onAddressInputChange({
      address: validAddress,
      domain: parseAddress ? inputVal : '',
      inscription
    });

    const addressTips = getAddressTips(validAddress, chain.enum);
    if (addressTips.sendTip) {
      setAddressTip(addressTips.sendTip);
    } else {
      setAddressTip('');
    }
  }, [validAddress]);

  const resetState = () => {
    if (parseError) {
      setParseError('');
    }
    if (parseAddress) {
      setParseAddress('');
    }
    if (formatError) {
      setFormatError('');
    }

    if (validAddress) {
      setValidAddress('');
    }

    if (inscription) {
      setInscription(undefined);
    }
    setParseName(false);
  };

  const handleInputAddress = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputAddress = e.target.value.trim();
    setInputVal(inputAddress);

    resetState();

    const teststr = inputAddress.toLowerCase();
    const satsname = getSatsName(teststr);
    if (satsname) {
      if (SUPPORTED_DOMAINS.includes(satsname.suffix)) {
        setSearching(true);
        wallet
          .queryDomainInfo(encodeURIComponent(inputAddress))
          .then((inscription) => {
            resetState();
            if (!inscription) {
              setParseError(`${inputAddress} ${t('does_not_exist')}`);
              return;
            }
            setInscription(inscription);
            if (inscription.utxoConfirmation < SAFE_DOMAIN_CONFIRMATION) {
              setParseError(
                `${t('this_domain_has_been_transferred_or_inscribed_recently_please_wait_for_block_confirmations')} (${
                  inscription.utxoConfirmation
                }/${SAFE_DOMAIN_CONFIRMATION}).`
              );
              return;
            }

            const address = inscription.address || '';
            setParseAddress(address);
            setValidAddress(address);
            setParseName(true);
          })
          .catch((err: Error) => {
            const errMsg = err.message + ' for ' + inputAddress;
            setFormatError(errMsg);
          })
          .finally(() => {
            setSearching(false);
          });
      } else {
        const names = SUPPORTED_DOMAINS.map((v) => `.${v}`);
        let str = '';
        for (let i = 0; i < names.length; i++) {
          if (i == 0) {
            // empty
          } else if (i < names.length - 1) {
            str += ', ';
          } else {
            str += ' and ';
          }
          str += `${names[i]}`;
        }
        setFormatError(`${t('currently_only')} ${str} ${t('are_supported')}.`);
        return;
      }
    } else {
      const isValid = isValidAddress(inputAddress);
      if (!isValid) {
        setFormatError(t('recipient_address_is_invalid'));
        return;
      }
      setValidAddress(inputAddress);
    }
  };

  return (
    <div style={{ alignSelf: 'stretch' }}>
      <Row justifyBetween itemsCenter style={{ marginTop: 20, marginBottom: 12 }}>
        {recipientLabel || <Text text={t('recipient')} preset="regular" />}
        <Row itemsCenter clickable onClick={() => setShowContactsModal(true)} style={{ cursor: 'pointer', gap: 0 }}>
          <Text text={t('address_book_placeholder')} color="yellow" style={{ fontSize: '14px' }} />
          <Icon icon="right" color="yellow" size={16} style={{ marginLeft: 4 }} />
        </Row>
      </Row>
      <div
        style={Object.assign({}, $baseContainerStyle, {
          flexDirection: 'column',
          minHeight: '56.5px',
          paddingTop: 0,
          paddingBottom: 0
        })}>
        <Row full itemsCenter>
          <textarea
            placeholder={inputAddressPlaceholder}
            style={Object.assign({}, $baseTextareaStyle, $inputStyleOverride)}
            onChange={handleInputAddress}
            value={inputVal}
            rows={inputVal && inputVal.length > 50 ? 2 : 1}
            {...rest}
          />
        </Row>

        {searching && (
          <Row full mt="sm">
            <Text preset="sub" text={t('loading')} />
          </Row>
        )}
        {inscription && (
          <Row full itemsCenter mb="md">
            <CopyableAddress address={parseAddress} />
            <AccordingInscription inscription={inscription} />
          </Row>
        )}
      </div>

      {parseName ? (
        <Row mt="sm" gap="zero" itemsCenter>
          <Text preset="sub" size="sm" text={t('name_recognized_and_resolved')} />
          <Text
            preset="link"
            color="yellow"
            text={t('more_details')}
            onClick={() => {
              window.open('https://docs.unisat.io/unisat-wallet/name-recognized-and-resolved');
            }}
          />
          <Text preset="sub" size="sm" text={')'} />
        </Row>
      ) : null}
      {parseError && <Text text={parseError} preset="regular" color="error" />}
      {addressTip && (
        <Column
          py={'lg'}
          px={'md'}
          mt="md"
          gap={'lg'}
          style={{
            borderRadius: 12,
            border: '1px solid rgba(245, 84, 84, 0.35)',
            background: 'rgba(245, 84, 84, 0.08)'
          }}>
          <Text text={addressTip} preset="regular" color="warning" />
        </Column>
      )}
      <Text text={formatError} preset="regular" color="error" />

      {showContactsModal && (
        <ContactsModal
          onClose={() => setShowContactsModal(false)}
          onSelect={(contact) => {
            setInputVal(contact.address);
            resetState();
            const addressValue = contact.address.trim();

            if (isValidAddress(addressValue)) {
              setValidAddress(addressValue);
            } else {
              setFormatError(t('recipient_address_is_invalid'));
            }

            setShowContactsModal(false);
          }}
          selectedNetworkFilter={networkType}
        />
      )}
    </div>
  );
};
