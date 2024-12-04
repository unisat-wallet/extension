import { useMemo } from 'react';

import { spacing } from '@/ui/theme/spacing';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Column } from '../Column';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { Row } from '../Row';
import { Text } from '../Text';
import './index.module.less';

interface HeaderProps {
  onBack?: () => void;
  title?: string;
  LeftComponent?: React.ReactNode;
  RightComponent?: React.ReactNode;
  children?: React.ReactNode;
  hideLogo?: boolean;
  type?: 'style1' | 'style2';
}

function HeaderContainer(props: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'block', backgroundColor: '#070606' }}>
      <img
        src={'./images/artifacts/top-linear-gradient.png'}
        alt=""
        style={{ width: '100%', height: 182, position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
      />
      <Row
        justifyBetween
        itemsCenter
        style={{
          height: '67.5px',
          paddingLeft: spacing.large,
          paddingRight: spacing.large
        }}>
        {props.children}
      </Row>
    </div>
  );
}

export function Header(props: HeaderProps) {
  const { hideLogo, onBack, title, LeftComponent, RightComponent, children, type } = props;

  const CenterComponent = useMemo(() => {
    if (hideLogo) {
      return;
    }
    if (children) {
      return children;
    } else if (title) {
      return <Text text={title} preset="regular-bold" />;
    } else {
      return <Logo preset="small" />;
    }
  }, [title]);

  if (type === 'style2') {
    return (
      <HeaderContainer>
        <Row>
          <Column selfItemsCenter>{LeftComponent}</Column>
        </Row>
        <Row>
          <Column selfItemsCenter>{RightComponent}</Column>
        </Row>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer>
      <Row full>
        <Column selfItemsCenter>
          {LeftComponent}
          {onBack && (
            <Row
              onClick={(e) => {
                onBack();
              }}>
              <Icon>
                <FontAwesomeIcon icon={faArrowLeft} />
              </Icon>
            </Row>
          )}
        </Column>
      </Row>

      <Row itemsCenter>{CenterComponent}</Row>

      <Row full justifyEnd>
        <Column selfItemsCenter>{RightComponent}</Column>
      </Row>
    </HeaderContainer>
  );
}
