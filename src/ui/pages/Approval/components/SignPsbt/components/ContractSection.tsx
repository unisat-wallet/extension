import { ContractResult } from '@/shared/types';
import { Row, Text } from '@/ui/components';

export default function ContractSection(props: {
  contract: ContractResult;
  setContractPopoverData: (contract: ContractResult) => void;
}) {
  const { contract, setContractPopoverData } = props;
  return (
    <Row
      style={{
        borderWidth: 1,
        borderColor: 'rgba(244, 182, 44, 0.2)',
        borderRadius: 5,
        padding: 2,
        backgroundColor: 'rgba(244, 182, 44, 0.1)'
      }}
      onClick={() => {
        setContractPopoverData(contract);
      }}>
      <Text text={contract.name + ' >'} style={{ color: 'rgba(244, 182, 44, 0.85)' }} size="xs" />
    </Row>
  );
}
