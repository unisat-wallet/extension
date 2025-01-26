import { colors } from '@/ui/theme/colors';

import { Row } from '../Row';

export function Line() {
  return <Row full style={{ borderBottomWidth: 1, borderColor: colors.border }}></Row>;
}
