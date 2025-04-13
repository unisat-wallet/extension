import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ContactBookItem } from '@/background/service/contactBook';
import { CHAINS_MAP, ChainType } from '@/shared/constant';
import { Button, Card, Column, Content, Footer, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { BottomModal } from '@/ui/components/BottomModal';
import { useChain } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { spacing } from '@/ui/theme/spacing';
import { useWallet } from '@/ui/utils';
import { SearchOutlined } from '@ant-design/icons';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ContactChainModal } from './ContactChainModal';

const formatAddress = (address: string) => {
  if (!address) return '';
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
};

// Sortable contact item component
function SortableContactItem({ contact, index }: { contact: ContactBookItem; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${contact.address}_${contact.chain}`,
    data: { index, contact }
  });

  const chainInfo = CHAINS_MAP[contact.chain || ChainType.BITCOIN_MAINNET];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
    userSelect: 'none' as const
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item" {...attributes}>
      <Card
        mt="md"
        style={{
          backgroundColor: '#1A1A1A',
          borderRadius: 12,
          padding: '12px 16px',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'default',
          border: isDragging ? `1px solid ${colors.gold}` : 'none',
          boxShadow: isDragging ? '0 0 10px rgba(0, 0, 0, 0.3)' : 'none'
        }}>
        <Row full justifyBetween itemsCenter>
          <Row itemsCenter gap="md">
            <Image src={chainInfo.icon} size={30} />
            <Column>
              <Text
                text={contact.name}
                preset="regular-bold"
                style={{
                  maxWidth: '180px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              />
              <Text
                text={formatAddress(contact.address)}
                preset="sub"
                style={{
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              />
            </Column>
          </Row>
          <Row itemsCenter gap="md">
            {index > 0 && (
              <div
                className="top-button"
                onClick={(e) => {
                  e.stopPropagation();

                  const context = document.querySelector('.contacts-sortable-container');
                  if (context) {
                    const items = Array.from(context.querySelectorAll('.sortable-item'));
                    const currentItem = items[index];

                    if (currentItem && items.length > 0) {
                      context.insertBefore(currentItem, items[0]);

                      const event = new CustomEvent('itemTopChanged', {
                        detail: { index, contact }
                      });
                      context.dispatchEvent(event);
                    }
                  }
                }}
                style={{
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'none',
                  backgroundColor: 'transparent',
                  borderRadius: '4px'
                }}>
                <Icon icon="sortTop" size={20} color="textDim" />
              </div>
            )}
            <div
              {...listeners}
              className="drag-handle"
              style={{
                cursor: 'grab',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'none',
                backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderRadius: '4px'
              }}>
              <Icon icon="sortDrag" size={20} color="textDim" />
            </div>
          </Row>
        </Row>
      </Card>
    </div>
  );
}

export default function ContactsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useWallet();
  const chain = useChain();
  const [contacts, setContacts] = useState<ContactBookItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactBookItem | null>(null);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<ChainType>(ChainType.BITCOIN_MAINNET);
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [orderedContacts, setOrderedContacts] = useState<ContactBookItem[]>([]);

  // Setup sensors for touch and keyboard operations
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    setSelectedNetworkFilter(chain.enum);
    loadContacts();
  }, []);

  useEffect(() => {
    if (location.state && location.state.returnWithNetwork) {
      setSelectedNetworkFilter(location.state.returnWithNetwork);
      // Clear the state to prevent repeated selection
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  useEffect(() => {
    setOrderedContacts(filteredContacts);
  }, [contacts, searchKeyword, selectedNetworkFilter]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const list = await wallet.listContacts();
      setContacts(list);

      if (location.state && location.state.lastEditedContactAddress) {
        const editedAddress = location.state.lastEditedContactAddress;

        const returnWithNetwork = location.state.returnWithNetwork;

        if (returnWithNetwork) {
          const chainEnum = returnWithNetwork;
          const editedContact = list.find(
            (contact) => contact.address.toLowerCase() === editedAddress.toLowerCase() && contact.chain === chainEnum
          );

          if (editedContact) {
            setSelectedNetworkFilter(returnWithNetwork);
            navigate(location.pathname, { replace: true });
            return;
          }
        }

        const editedContact = list.find((contact) => contact.address.toLowerCase() === editedAddress.toLowerCase());

        if (editedContact) {
          setSelectedNetworkFilter(editedContact.chain);
          navigate(location.pathname, { replace: true });
        }
      }
    } catch (e) {
      console.error('Failed to load contacts', e);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedContact) return;
    try {
      await wallet.removeContact(selectedContact.address, selectedContact.chain);
      await loadContacts();
      setDeleteModalVisible(false);
      setSelectedContact(null);
    } catch (e) {
      console.error('Failed to delete contact', e);
    }
  };

  const toggleSortDirection = () => {
    try {
      if (!isSortingMode) {
        setOrderedContacts([...filteredContacts]);

        setSearchKeyword('');
      } else {
        saveContactOrder().catch((e) => {
          console.error('Failed to save contact order on exit sorting mode', e);
        });
      }

      setIsSortingMode(!isSortingMode);
    } catch (error) {
      console.error('Error toggling sort mode', error);
      setIsSortingMode(false);
    }
  };

  const cancelSorting = () => {
    try {
      setOrderedContacts([...filteredContacts]);
      setIsSortingMode(false);
    } catch (error) {
      console.error('Error cancelling sort mode', error);
      setIsSortingMode(false);
    }
  };

  const saveContactOrder = async () => {
    try {
      // Get contacts for current network type
      const networkContacts = contacts.filter((contact) => contact.chain === selectedNetworkFilter);

      // Find indices of ordered contacts in original array using composite ID
      const orderedIndices = orderedContacts.map((orderedContact) => {
        const orderedContactId = getContactId(orderedContact);
        return networkContacts.findIndex((contact) => getContactId(contact) === orderedContactId);
      });

      // Create array with contacts from other networks
      const contactsFromOtherNetworks = contacts.filter((contact) => contact.chain !== selectedNetworkFilter);

      // Add current network contacts in new order
      const reorderedNetworkContacts = orderedIndices
        .map((index) => (index !== -1 ? networkContacts[index] : null))
        .filter((contact) => contact !== null) as ContactBookItem[];

      // Merge contact lists
      const newContacts = [...contactsFromOtherNetworks, ...reorderedNetworkContacts];

      // Update local state
      setContacts(newContacts);

      // Try to save to backend
      try {
        await wallet.saveContactsOrder(newContacts);
      } catch (saveError) {
        console.error('Failed to save contact order to background', saveError);
      }
    } catch (e) {
      console.error('Failed to handle contact order save operation', e);
    }
  };

  const handleSelectNetwork = (chainType: ChainType) => {
    setSelectedNetworkFilter(chainType);
    setShowNetworkModal(false);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      (contact.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        contact.address.toLowerCase().includes(searchKeyword.toLowerCase())) &&
      contact.chain === selectedNetworkFilter
  );

  const showEmptyState = !isLoading && contacts.length === 0;
  const showEmptyFilteredState = !isLoading && contacts.length > 0 && filteredContacts.length === 0;

  const getContactId = (contact: ContactBookItem) => `${contact.address}_${contact.chain}`;

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    setIsLoading(true);

    const activeId = active.id as string;
    const overId = over.id as string;

    const oldIndex = orderedContacts.findIndex((contact) => getContactId(contact) === activeId);
    const newIndex = orderedContacts.findIndex((contact) => getContactId(contact) === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrderedContacts = arrayMove(orderedContacts, oldIndex, newIndex);
      setOrderedContacts(newOrderedContacts);

      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const handleMoveToTop = (index: number) => {
    if (index <= 0) return;

    setIsLoading(true);

    const newOrderedContacts = [...orderedContacts];

    const contactToMove = newOrderedContacts[index];

    newOrderedContacts.splice(index, 1);

    newOrderedContacts.unshift(contactToMove);

    setOrderedContacts(newOrderedContacts);

    setIsLoading(false);
  };

  useEffect(() => {
    const container = document.querySelector('.contacts-sortable-container');
    if (container) {
      const handleTopEvent = (e: any) => {
        const { index } = e.detail;
        handleMoveToTop(index);
      };

      container.addEventListener('itemTopChanged', handleTopEvent);

      return () => {
        container.removeEventListener('itemTopChanged', handleTopEvent);
      };
    }
  }, [orderedContacts]);

  const renderFilteredContacts = () => {
    if (isLoading) {
      return (
        <Column style={{ padding: spacing.large, alignItems: 'center' }}>
          <Text text="Loading..." preset="regular" color="textDim" />
        </Column>
      );
    }

    if (filteredContacts.length === 0) {
      return (
        <Column style={{ padding: spacing.large, alignItems: 'center' }}>
          <Text text="No contacts found" preset="regular" color="textDim" />
        </Column>
      );
    }

    return filteredContacts.map((contact, index) => (
      <div
        key={`${contact.address}_${contact.chain}`}
        style={{ cursor: 'pointer' }}
        onClick={() =>
          navigate(`/settings/contact/${contact.address}/${contact.chain}`, {
            state: { selectedNetworkFilter }
          })
        }>
        <Card
          mt="md"
          style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 12,
            padding: '12px 16px'
          }}>
          <Row full justifyBetween itemsCenter>
            <Row itemsCenter gap="md">
              <Image src={CHAINS_MAP[contact.chain].icon} size={30} />
              <Column>
                <Text
                  text={contact.name}
                  preset="regular-bold"
                  style={{
                    maxWidth: '180px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
                <Text
                  text={formatAddress(contact.address)}
                  preset="sub"
                  style={{
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
              </Column>
            </Row>
            <Icon icon="right" color="textDim" size={18} />
          </Row>
        </Card>
      </div>
    ));
  };

  return (
    <Layout>
      <Header
        onBack={() => {
          navigate('/settings');
        }}
        title="Address Book"
      />

      <Row justifyBetween mt="md" mb="lg" style={{ padding: '0 16px' }}>
        <Row
          style={{
            border: `1px solid ${colors.gold}`,
            borderRadius: 20,
            padding: '8px 16px',
            cursor: isSortingMode ? 'not-allowed' : 'pointer',
            opacity: 1
          }}
          onClick={isSortingMode ? undefined : () => setShowNetworkModal(true)}
          itemsCenter>
          <Image src={CHAINS_MAP[selectedNetworkFilter].icon} size={20} style={{ marginRight: 8 }} />
          <Text text={CHAINS_MAP[selectedNetworkFilter].label} color="gold" size="sm" />
          <Icon icon="down" size={14} color="gold" style={{ marginLeft: 8 }} />
        </Row>

        {!showEmptyState && !showEmptyFilteredState && !isSortingMode ? (
          <Row
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: `1px solid ${colors.border}`,
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.06)'
            }}
            onClick={toggleSortDirection}>
            <Icon icon="sortAddress" size={16} color="textDim" />
          </Row>
        ) : isSortingMode ? (
          <Row
            style={{
              height: 36,
              alignItems: 'center'
            }}>
            <Text
              text="Cancel"
              style={{
                color: '#F55454',
                textAlign: 'right',
                fontSize: 14,
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                cursor: 'pointer'
              }}
              onClick={cancelSorting}
            />
          </Row>
        ) : null}
      </Row>

      <Content style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {isLoading ? (
          <Column full justifyCenter itemsCenter style={{ flex: 1 }}>
            <Text text="Loading..." preset="sub" textCenter />
          </Column>
        ) : showEmptyState ? (
          <Column full justifyCenter itemsCenter style={{ flex: 1 }}>
            <Icon icon="addressBookEmpty" size={fontSizes.iconEmpty} style={{ marginBottom: spacing.large }} />
            <Text text="You haven't added address information yet" preset="sub" textCenter mt="md" />
          </Column>
        ) : (
          <Column gap="lg" style={{ flex: filteredContacts.length === 0 ? 1 : 'unset' }}>
            <div
              style={{
                backgroundColor: '#2a2626',
                border: '1px solid #2a2626',
                borderRadius: 8,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                height: 48,
                width: '100%',
                opacity: isSortingMode ? 0.5 : 1
              }}>
              <SearchOutlined style={{ color: '#888', marginRight: 8, fontSize: 20, display: 'flex' }} />
              <input
                type="text"
                placeholder="Search address or name"
                value={searchKeyword}
                onChange={(e) => !isSortingMode && setSearchKeyword(e.target.value)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: 16,
                  width: '100%',
                  height: '100%',
                  pointerEvents: isSortingMode ? 'none' : 'auto'
                }}
                disabled={isSortingMode}
              />
            </div>

            {filteredContacts.length === 0 ? (
              <Column full justifyCenter itemsCenter style={{ flex: 1 }}>
                <Icon icon="addressBookEmpty" size={fontSizes.iconEmpty} style={{ marginBottom: spacing.large }} />
                <Text text="No matching contacts found" preset="sub" textCenter mt="md" />
              </Column>
            ) : isSortingMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                autoScroll={{
                  threshold: {
                    x: 0,
                    y: 0.2 // Start scrolling when drag target is at 20% of the viewport
                  }
                }}>
                <SortableContext
                  items={orderedContacts.map((contact) => getContactId(contact))}
                  strategy={verticalListSortingStrategy}>
                  <div
                    className="contacts-sortable-container"
                    style={{
                      minHeight: '100px',
                      position: 'relative',
                      marginTop: spacing.small,
                      paddingBottom: spacing.large
                    }}>
                    {orderedContacts.map((contact, index) => (
                      <SortableContactItem key={getContactId(contact)} contact={contact} index={index} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              renderFilteredContacts()
            )}
          </Column>
        )}
      </Content>
      <Footer>
        <Button
          text={isSortingMode ? 'Finish' : 'Add Address'}
          preset="primary"
          onClick={
            isSortingMode
              ? toggleSortDirection
              : () => {
                  navigate('/settings/contacts/edit', {
                    state: { selectedNetworkFilter }
                  });
                }
          }
          full
        />
      </Footer>

      {deleteModalVisible && selectedContact && (
        <BottomModal onClose={() => setDeleteModalVisible(false)}>
          <Column gap="xl" style={{ padding: `${spacing.large}px ${spacing.large}px ${spacing.large}px` }}>
            <Row justifyBetween itemsCenter>
              <Text text="Delete Contact" preset="title-bold" />
              <Icon
                icon="close"
                color="textDim"
                onClick={() => setDeleteModalVisible(false)}
                style={{ cursor: 'pointer' }}
              />
            </Row>

            <Column gap="lg">
              <Text text="Are you sure you want to delete this contact?" preset="regular" color="textDim" />

              <Card style={{ backgroundColor: colors.black_muted, padding: spacing.medium }}>
                <Column gap="sm">
                  <Row itemsCenter gap="sm">
                    <Image src={CHAINS_MAP[selectedContact.chain || ChainType.BITCOIN_MAINNET].icon} size={24} />
                    <Text text={selectedContact.name} preset="regular-bold" />
                  </Row>
                  <Text text={formatAddress(selectedContact.address)} preset="sub" color="textDim" />
                </Column>
              </Card>
            </Column>

            <Row gap="md">
              <Button
                text="Cancel"
                preset="default"
                onClick={() => {
                  setDeleteModalVisible(false);
                  setSelectedContact(null);
                }}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border}`
                }}
              />
              <Button text="Delete" preset="danger" onClick={confirmDelete} style={{ flex: 1 }} />
            </Row>
          </Column>
        </BottomModal>
      )}

      {showNetworkModal && (
        <ContactChainModal
          onClose={() => setShowNetworkModal(false)}
          onSelect={handleSelectNetwork}
          selectedChainType={selectedNetworkFilter}
          hideAllNetworks={true}
        />
      )}
    </Layout>
  );
}
