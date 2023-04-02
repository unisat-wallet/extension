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
}

export function Header(props: HeaderProps) {
  const { onBack, title, LeftComponent, RightComponent } = props;
  return (
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

      <Row itemsCenter>{title ? <Text text={title} preset="regular-bold" /> : <Logo preset="small" />}</Row>

      <Row full justifyEnd>
        <Column selfItemsCenter>{RightComponent}</Column>
      </Row>
    </Row>
  );
}
