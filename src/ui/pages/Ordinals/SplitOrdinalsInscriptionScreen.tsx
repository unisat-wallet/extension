import { Button, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { useSplitOrdinalsInscriptionScreenLogic } from '@unisat/wallet-state';

export default function SplitOrdinalsInscriptionScreen() {
  const {
    t,
    inscriptions,
    minOutputValue,
    error,
    disabled,
    onOutputValueChange,
    splitedCount,
    onClickNext,
    onClickBack
  } = useSplitOrdinalsInscriptionScreenLogic();
  return (
    <Layout>
      <Header onBack={onClickBack} title={t('split_inscriptions')} />
      <Content>
        <Text color="red" textCenter text={t('split_inscription_tips')} />
        <Column>
          <Text text={`${t('inscriptions')} (${inscriptions.length})`} color="textDim" />
          <Row justifyBetween>
            <Row overflowX gap="lg" pb="md">
              {inscriptions.map((v) => (
                <InscriptionPreview key={v.inscriptionId} data={v} preset="small" />
              ))}
            </Row>
          </Row>

          <Text text={t('each_output_value')} color="textDim" />

          <OutputValueBar defaultValue={minOutputValue} minValue={minOutputValue} onChange={onOutputValueChange} />
          <Column mt="lg">
            <FeeRateBar />
          </Column>

          {error && <Text text={error} color="error" />}

          {inscriptions.length > 1 && splitedCount > 0 && (
            <Text text={`${t('spliting_to')} ${splitedCount} ${t('utxos')}`} color="primary" />
          )}

          <Button disabled={disabled} preset="primary" text={t('next')} onClick={onClickNext} />
        </Column>
      </Content>
    </Layout>
  );
}
