import { useState } from 'react';

import { useNavigate } from '@/ui/pages/MainRoute';
import { useSetTabCallback } from '@/ui/state/global/hooks';
import { TabOption } from '@/ui/state/global/reducer';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Grid } from '../Grid';
import { Icon, IconTypes } from '../Icon';

export function NavTabBar({ tab }: { tab: TabOption }) {
  return (
    <Grid columns={4} style={{ width: '100%', height: '50px', backgroundColor: colors.bg2 }}>
      <TabButton tabName="home" icon="wallet" isActive={tab === 'home'} label="Wallet" />
      <TabButton tabName="mint" icon="compass" isActive={tab === 'mint'} label="Search" />
      <TabButton tabName="app" icon="grid" isActive={tab === 'app'} label="More" />
      <TabButton tabName="settings" icon="settings" isActive={tab === 'settings'} label="Settings" />
    </Grid>
  );
}

function TabButton({
  tabName,
  icon,
  isActive,
  label
}: {
  tabName: TabOption;
  icon: IconTypes;
  isActive: boolean;
  label: string;
}) {
  const setTab = useSetTabCallback();
  const [hover, setHover] = useState('');
  const navigate = useNavigate();
  return (
    <Column
      justifyCenter
      itemsCenter
      onClick={(e) => {
        if (tabName === 'home') {
          navigate('MainScreen');
        } else if (tabName === 'mint') {
          navigate('DiscoverTabScreen');
        } else if (tabName === 'app') {
          navigate('AppTabScrren');
        } else if (tabName === 'settings') {
          navigate('SettingsTabScreen');
        }
      }}
    >
      <Icon icon={icon} color={isActive ? 'white' : 'white_muted'} size="18px" />
    </Column>
  );
}
