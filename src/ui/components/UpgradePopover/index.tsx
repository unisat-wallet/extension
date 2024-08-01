import { useEffect, useState } from 'react';

import { VersionDetail } from '@/shared/types';
import { useVersionInfo } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const UpgradePopover = ({ onClose }: { onClose: () => void }) => {
    const versionInfo = useVersionInfo();

    const [versionDetail, setVersionDetail] = useState<VersionDetail>({ version: '', changelogs: [], title: '' });
    const wallet = useWallet();
    useEffect(() => {
        if (!versionInfo.newVersion) return;
        wallet
            .getVersionDetail(versionInfo.newVersion)
            .then((res) => {
                setVersionDetail(res);
            })
            .catch((e) => {
                console.log(e);
            });
    }, [versionInfo.newVersion]);
    return (
        <Popover onClose={onClose}>
            <Column justifyCenter itemsCenter>
                <Column mt="lg">
                    <Text preset="bold" text={versionDetail.title} textCenter />
                </Column>

                <div style={{ marginTop: 8 }}>
                    {versionDetail.changelogs.map((str, index) => (
                        <div key={index} style={{ fontSize: fontSizes.sm }}>
                            {str}
                        </div>
                    ))}
                </div>

                <Row full mt="lg">
                    <Button
                        text="Skip"
                        full
                        onClick={(e) => {
                            if (onClose) {
                                onClose();
                            }
                        }}
                    />

                    <Button
                        text="Go to update"
                        full
                        preset="primary"
                        onClick={(e) => {
                            window.open('https://unisat.io/extension/update');
                        }}
                    />
                </Row>
            </Column>
        </Popover>
    );
};
