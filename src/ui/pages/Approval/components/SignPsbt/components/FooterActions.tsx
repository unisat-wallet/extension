import { TxType } from '@/shared/types';
import { Button, Row } from '@/ui/components';

const FooterActions = ({ txInfo, type, isValid, t, handleCancel, handleConfirm, setIsPsbtRiskPopoverVisible }) => {
  return (
    <Row full>
      <Button preset="default" text={t('reject')} onClick={handleCancel} full />
      <Button
        preset="primary"
        icon={txInfo.decodedPsbt.risks.length > 0 ? 'risk' : undefined}
        text={type === TxType.SIGN_TX ? t('sign') : t('sign_and_pay')}
        onClick={() => {
          if (txInfo.decodedPsbt.risks.length > 0) {
            setIsPsbtRiskPopoverVisible(true);
            return;
          }
          handleConfirm && handleConfirm();
        }}
        disabled={!isValid}
        full
      />
    </Row>
  );
};

export default FooterActions;
