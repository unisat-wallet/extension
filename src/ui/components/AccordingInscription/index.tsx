import { Inscription } from '@/shared/types';

import { Text } from '../Text';

export function AccordingInscription({ inscription }: { inscription: Inscription }) {
    return (
        <Text
            text={`By inscription #${inscription.inscriptionNumber} ${
                inscription.utxoConfirmation == 0 ? '(unconfirmed)' : ''
            }`}
            preset="link"
            onClick={() => {
                window.open(`https://ordinals.com/inscription/${inscription.inscriptionId}`);
            }}
        />
    );
}
