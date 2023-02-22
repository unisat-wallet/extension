import { useTranslation } from 'react-i18next';

import { AppInfo } from '@/shared/types';
import { useAppSummary } from '@/ui/state/accounts/hooks';
import { shortDesc } from '@/ui/utils';

function AppItem({ info }: { info: AppInfo }) {
  return (
    <div
      onClick={() => {
        if (info.url) window.open(info.url);
      }}
      className="flex font-semibold mt-3 p-2 items-center rounded-lg bg-opacity-50 bg-soft-black hover:bg-primary-active cursor-pointer h-24">
      <img src={info.logo} width={48} height={48} />

      <div style={{ flexDirection: 'column', marginLeft: 20, width: 210 }}>
        <div>{info.title}</div>
        <div className="font-normal opacity-60">{shortDesc(info.desc)}</div>
      </div>
    </div>
  );
}

export default function AppTab() {
  const { t } = useTranslation();
  const appSummary = useAppSummary();
  return (
    <div className="flex flex-col items-center gap-5 justify-evenly my-5">
      {appSummary.apps.map(({ tag, list }) => (
        <div key={tag} className="flex flex-1 flex-col w-full px-8">
          <div className=" font-semibold " style={{ marginBottom: 0 }}>
            {tag}
          </div>
          {list.map((v) => (
            <AppItem key={v.title} info={v} />
          ))}
        </div>
      ))}
    </div>
  );
}
