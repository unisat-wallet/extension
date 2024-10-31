import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApprovalResponse } from '@/shared/types/Approval';
import { WalletError } from '@/shared/types/Error';
import { isWalletError } from '@/shared/utils/errors';
import { getUiType } from '.';
import { useWallet } from './WalletContext';

export const useApproval = () => {
    const wallet = useWallet();
    const navigate = useNavigate();
    const getApproval = wallet.getApproval;

    const resolveApproval = async (data?: ApprovalResponse, stay = false, forceReject = false) => {
        const approval = await getApproval();

        if (approval) {
            await wallet.resolveApproval(data, forceReject);
        }

        if (stay) {
            return;
        }

        setTimeout(() => {
            navigate('/');
        });
    };

    const rejectApproval = async (err?: string, stay = false, isInternal = false) => {
        const approval = await getApproval();
        if (approval) {
            await wallet.rejectApproval(err, stay, isInternal);
        }
        if (!stay) {
            navigate('/');
        }
    };

    const handleBeforeUnload = () => {
        rejectApproval('beforeUnload event occurred', false, false);
    };

    useEffect(() => {
        if (!getUiType().isNotification) {
            return;
        }
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return [getApproval, resolveApproval, rejectApproval] as const;
};

export const useSelectOption = <T>({
    options,
    defaultValue = [],
    onChange,
    value
}: {
    options: T[];
    defaultValue?: T[];
    onChange?: (arg: T[]) => void;
    value?: T[];
}) => {
    const isControlled = useRef(typeof value !== 'undefined').current;
    const [idxs, setChoosedIdxs] = useState((isControlled ? value! : defaultValue).map((x) => options.indexOf(x)));

    useEffect(() => {
        if (!isControlled) {
            return;
        }

        // shallow compare
        if (value && idxs.some((x, i) => options[x] != value[i])) {
            setChoosedIdxs(value.map((x) => options.indexOf(x)));
        }
    }, [value]);

    const changeValue = (idxs: number[]) => {
        setChoosedIdxs([...idxs]);
        onChange && onChange(idxs.map((o) => options[o]));
    };

    const handleRemove = (i: number) => {
        idxs.splice(i, 1);
        changeValue(idxs);
    };

    const handleChoose = (i: number) => {
        if (idxs.includes(i)) {
            return;
        }

        idxs.push(i);
        changeValue(idxs);
    };

    const handleToggle = (i: number) => {
        const inIdxs = idxs.indexOf(i);
        if (inIdxs !== -1) {
            handleRemove(inIdxs);
        } else {
            handleChoose(i);
        }
    };

    const handleClear = () => {
        changeValue([]);
    };

    return [idxs.map((o) => options[o]), handleRemove, handleChoose, handleToggle, handleClear, idxs] as const;
};

export const useWalletRequest = <TArgs extends unknown[], TResult>(
    requestFn: (...args: TArgs) => Promise<TResult>,
    {
        onSuccess,
        onError
    }: {
        onSuccess?(result: TResult): void;
        onError?(error: WalletError): void;
    }
) => {
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);
    const [loading, setLoading] = useState<boolean>(false);
    const [res, setRes] = useState<TResult | undefined>(undefined);
    const [err, setErr] = useState<WalletError>();

    const run = async (...args: TArgs) => {
        setLoading(true);
        try {
            const _res = await Promise.resolve(requestFn(...args));
            if (!mounted.current) {
                return;
            }
            setRes(_res);
            onSuccess && onSuccess(_res);
        } catch (err) {
            if (!mounted.current) {
                return;
            }
            if (isWalletError(err)) {
                setErr(err);
                onError && onError(err);
            } else {
                console.error("Non-WalletError caught: ", err);
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
        }
    };

    return [run, loading, res, err] as const;
};

export interface UseHoverOptions {
    mouseEnterDelayMS?: number;
    mouseLeaveDelayMS?: number;
}

export type HoverProps = Pick<React.HTMLAttributes<HTMLElement>, 'onMouseEnter' | 'onMouseLeave'>;

export const useHover = ({ mouseEnterDelayMS = 0, mouseLeaveDelayMS = 0 }: UseHoverOptions = {}): [
    boolean,
    HoverProps
] => {
    const [isHovering, setIsHovering] = useState(false);
    let mouseEnterTimer: number | undefined;
    let mouseOutTimer: number | undefined;
    return [
        isHovering,
        {
            onMouseEnter: () => {
                clearTimeout(mouseOutTimer);
                mouseEnterTimer = window.setTimeout(() => setIsHovering(true), mouseEnterDelayMS);
            },
            onMouseLeave: () => {
                clearTimeout(mouseEnterTimer);
                mouseOutTimer = window.setTimeout(() => setIsHovering(false), mouseLeaveDelayMS);
            }
        }
    ];
};
