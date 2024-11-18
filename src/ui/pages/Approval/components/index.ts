import { ApprovalType } from '@/shared/types/Approval';
import Connect from './Connect';
import SignData from './SignData';
import SignDeployment from './SignDeployment';
import SignInteraction from './SignInteraction';
import SignPsbt from './SignPsbt';
import SignText from './SignText';
import SwitchChain from './SwitchChain';
import SwitchNetwork from './SwitchNetwork';

export { Connect, SignData, SignDeployment, SignInteraction, SignPsbt, SignText, SwitchChain, SwitchNetwork };

export const ApprovalComponents = {
    [ApprovalType.Connect]: Connect,
    [ApprovalType.SignData]: SignData,
    [ApprovalType.SignInteraction]: SignInteraction,
    [ApprovalType.SignPsbt]: SignPsbt,
    [ApprovalType.SignText]: SignText,
    [ApprovalType.SwitchChain]: SwitchChain,
    [ApprovalType.SwitchNetwork]: SwitchNetwork,
    [ApprovalType.SignDeployment]: SignDeployment,
} as const;

