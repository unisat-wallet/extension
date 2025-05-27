import { ToAddressInfo } from '@/shared/types';
import { InputInfo } from '@/ui/pages/Approval/components/SignPsbt/types';
import { ColorTypes } from '@/ui/theme/colors';

export interface AddressTextProps {
  address?: string;
  addressInfo?: ToAddressInfo;
  textCenter?: boolean;
  color?: ColorTypes;
  inputInfo?: InputInfo;
}
