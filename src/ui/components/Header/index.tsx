import { useMemo } from 'react';

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
}

export function Header(props: HeaderProps) {
  const { onBack, title, LeftComponent, RightComponent, children } = props;

  const CenterComponent = useMemo(() => {
    if (children) {
      return children;
    } else if (title) {
      return <Text text={title} preset="regular-bold" />;
    } else {
      return <Logo preset="small" />;
    }
  }, [title]);
  return (
    <div style={{ display: 'block' }}>
      <Row
        justifyBetween
        itemsCenter
        style={{
          height: '67.5px',
          padding: 15
        }}>
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

                <Text text="Back" preset="regular-bold" />
              </Row>
            )}
          </Column>
        </Row>

        <Row itemsCenter>{CenterComponent}</Row>

        <Row full justifyEnd>
          <Column selfItemsCenter>{RightComponent}</Column>
        </Row>
      </Row>
    </div>
  );
}
