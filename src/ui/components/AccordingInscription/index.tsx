import { Inscription } from '@/shared/types';
import { useOrdinalsWebsite } from '@/ui/state/settings/hooks';

import { Text } from '../Text';

export function AccordingInscription({ inscription }: { inscription: Inscription }) {
  const ordinalsWebsite = useOrdinalsWebsite();
  return (
    <Text
      text={`By inscription #${inscription.inscriptionNumber} ${
        inscription.utxoConfirmation == 0 ? '(unconfirmed)' : ''
      }`}
      preset="link"
      onClick={() => {
        window.open(`${ordinalsWebsite}/inscription/${inscription.inscriptionId}`);
      }}
    />
  );
}
