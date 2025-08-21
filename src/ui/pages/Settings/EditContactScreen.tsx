import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { CHAINS_ENUM, CHAINS_MAP, ChainType } from '@/shared/constant';
import { Button, Column, Content, Footer, Header, Image, Input, Layout, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { useWallet } from '@/ui/utils/WalletContext';
import { isValidAddress } from '@unisat/wallet-bitcoin';

const inputStyle = {
  backgroundColor: colors.black_muted,
  height: 48,
  padding: '12px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0
};

function EditContactScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  // Required parameters
  const { address, chain } = useParams<{ address: string; chain: string }>();
  const wallet = useWallet();
  const [name, setName] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [originalAddress, setOriginalAddress] = useState('');
  const [originalChain, setOriginalChain] = useState<CHAINS_ENUM | undefined>();
  const [chainType, setChainType] = useState<ChainType>(ChainType.BITCOIN_MAINNET);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (address) {
      fetchContact();
    } else {
      const state = location.state as { selectedNetworkFilter?: ChainType } | undefined;
      const preselectedChainType = state?.selectedNetworkFilter;

      if (preselectedChainType) {
        setChainType(preselectedChainType);
      }
    }
  }, [address, chain, location]);

  const fetchContact = async () => {
    if (!address || !chain) return;

    try {
      const chainEnum = chain as CHAINS_ENUM;
      const contact = await wallet.getContactByAddressAndChain(address, chainEnum);

      if (contact) {
        setName(contact.name);
        setContactAddress(contact.address);
        setOriginalAddress(contact.address);
        setOriginalChain(contact.chain);
        setChainType(contact.chain);
      } else {
        setError(t('contact_not_found'));
        setTimeout(() => {
          navigate('/settings/contacts');
        }, 1500);
      }
    } catch (err) {
      console.error('Error fetching contact:', err);
      setError(t('failed_to_load_contact_information'));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t('please_enter_name'));
      return;
    }

    if (!contactAddress.trim()) {
      setError(t('please_enter_address'));
      return;
    }

    const networkType = CHAINS_MAP[chainType].networkType;

    if (!isValidAddress(contactAddress, networkType)) {
      setError(t('invalid_address_format_for_selected_network'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (
        originalAddress &&
        originalChain &&
        (originalAddress !== contactAddress.trim() || originalChain !== chainType)
      ) {
        await wallet.removeContact(originalAddress, originalChain);
      }

      await wallet.updateContact({
        name: name.trim(),
        address: contactAddress.trim(),
        chain: chainType,
        isContact: true,
        isAlias: false
      });

      navigate('/settings/contacts', {
        state: {
          returnWithNetwork: chainType,
          lastEditedContactAddress: contactAddress.trim()
        }
      });
    } catch (err) {
      setError(t('failed_to_save_contact'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!address || !originalChain) return;

    setLoading(true);
    try {
      await wallet.removeContact(address, originalChain);

      navigate('/settings/contacts', {
        state: {
          returnWithNetwork: chainType
        }
      });
    } catch (err) {
      setError(t('failed_to_delete_contact'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setContactAddress(value);

    if (error.includes('Invalid address') || !value) {
      setError('');
    }

    if (value) {
      const networkType = CHAINS_MAP[chainType].networkType;

      if (value.length > 15 && !isValidAddress(value, networkType)) {
        setError(t('invalid_address_format_for_selected_network'));
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <Layout>
      <Header
        onBack={() => navigate('/settings/contacts', { state: { returnWithNetwork: chainType } })}
        title={address ? t('edit_address') : t('add_address')}
      />
      <Content>
        <Column gap="xl" style={{ padding: `${spacing.large}px ${spacing.small}px` }}>
          <Column>
            <Text text={t('name_label')} preset="regular" />
            <Input
              preset="text"
              value={name}
              onChange={handleNameChange}
              placeholder={t('please_enter_name')}
              containerStyle={inputStyle}
              style={{ color: 'white' }}
            />
          </Column>

          <Column>
            <Text text={t('address_label')} preset="regular" />
            <Input
              preset="text"
              value={contactAddress}
              onChange={handleAddressChange}
              placeholder={t('please_enter_address')}
              containerStyle={inputStyle}
              style={{ color: 'white' }}
            />
          </Column>

          <Column>
            <Text text={t('network')} preset="regular" />
            <Row
              style={{
                ...inputStyle,
                height: 48,
                display: 'flex',
                alignItems: 'center'
              }}
              itemsCenter>
              <Row itemsCenter>
                <Image src={CHAINS_MAP[chainType].icon} size={30} style={{ marginRight: 8 }} />
                <Text text={CHAINS_MAP[chainType].label} color="text" />
              </Row>
            </Row>
          </Column>

          {error && (
            <Row
              style={{
                padding: spacing.small,
                backgroundColor: 'rgba(245, 84, 84, 0.1)',
                borderRadius: 8
              }}>
              <Text text={error} preset="regular" color="error" />
            </Row>
          )}
        </Column>
      </Content>
      <Footer style={{ padding: '16px 16px 32px 16px' }}>
        <Column full gap="lg" style={{ marginBottom: 0 }}>
          <Button
            text={loading ? t('saving') : t('save')}
            onClick={handleSubmit}
            disabled={loading}
            preset="primary"
            style={{
              minHeight: 48
            }}
            full
          />
          {address && (
            <Button
              text={t('delete')}
              preset="delete"
              onClick={handleDelete}
              disabled={loading}
              style={{
                minHeight: 48
              }}
              full
            />
          )}
        </Column>
      </Footer>
    </Layout>
  );
}

export default EditContactScreen;
