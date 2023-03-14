import { useTranslation } from 'react-i18next';

import { InscriptionMintedItem } from '@/shared/types';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useInscriptionSummary } from '@/ui/state/accounts/hooks';

function MintItem({ info }: { info: InscriptionMintedItem }) {
  const navigate = useNavigate();
  return (
    <div className="px-8 flex flex-col w-full">
      <div className=" font-semibold ">{info.title}</div>
      <div className="flex justify-between">
        <div className="font-normal opacity-60">{info.desc}</div>

        <a
          className="font-normal opacity-60"
          onClick={() => {
            window.open(`https://unisat.io/inscription/tag/${info.title}`);
          }}>
          {'More'}
        </a>
      </div>

      <div className="flex gap-5 mt-5">
        {info.inscriptions.map((v) => (
          <InscriptionPreview
            key={v.id}
            onClick={(inscription) => {
              navigate('OrdinalsDetailScreen', { inscription });
            }}
            className="cursor-pointer"
            size="small"
            data={v}
          />
        ))}
      </div>
    </div>
  );
}

export default function MintTab() {
  const { t } = useTranslation();

  const inscriptionSummary = useInscriptionSummary();
  return (
    <div className="flex flex-col items-strech gap-5 justify-evenly mb-5">
      {inscriptionSummary.mintedList.map((v) => (
        <MintItem key={v.title} info={v} />
      ))}
    </div>
  );
}
