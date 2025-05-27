import { Row, Text } from '@/ui/components';

import Section from './Section';

const FeaturesSection = ({ txInfo, t }) => {
  return (
    <Section title={t('features')}>
      <Row>
        {txInfo.decodedPsbt.features.rbf ? (
          <Text text="RBF" color="white" style={{ backgroundColor: 'green', padding: 5, borderRadius: 5 }} />
        ) : (
          <Text
            text="RBF"
            color="white"
            style={{ backgroundColor: '#F55454', padding: 5, borderRadius: 5, textDecoration: 'line-through' }}
          />
        )}
      </Row>
    </Section>
  );
};

export default FeaturesSection;
