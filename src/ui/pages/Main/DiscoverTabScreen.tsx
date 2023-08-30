import { InscriptionMintedItem } from '@/shared/types';
import { Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useInscriptionSummary } from '@/ui/state/accounts/hooks';

function MintItem({ info }: { info: InscriptionMintedItem }) {
  const navigate = useNavigate();
  return (
    <Column mt="lg" gap="sm">
      <Text text={info.title} preset="regular-bold" />
      <Row justifyBetween>
        <Text text={info.desc} preset="sub" />

        <Text
          text="More"
          color="orange"
          onClick={() => {
            window.open(`https://unisat.io/inscription/tag/${info.title}`);
          }}
        />
      </Row>

      <Content px="sm" overflowX>
        <Row>
          {info.inscriptions.map((v) => (
            <InscriptionPreview
              key={v.inscriptionId}
              onClick={() => {
                navigate('OrdinalsDetailScreen', { inscription: v });
              }}
              preset="medium"
              data={v}
            />
          ))}
        </Row>
      </Content>
    </Column>
  );
}

export default function DiscoverTabScreen() {
  const inscriptionSummary = useInscriptionSummary();
  return (
    <Layout>
      <Header />
      <Content px="lg">
        <Column>
          {inscriptionSummary.mintedList.map((v) => (
            <MintItem key={v.title} info={v} />
          ))}
        </Column>
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="mint" />
      </Footer>
    </Layout>
  );
}
