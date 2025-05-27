import { InputInfo } from '@/ui/pages/Approval/components/SignPsbt/types';

export interface AddressDetailPopoverProps {
  address: string;
  onClose: () => void;
  inputInfo?: InputInfo;
}
