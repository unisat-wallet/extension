import 'reflect-metadata';

import { keyringService, notificationService, permissionService } from '@/background/service';
import { PromiseFlow, underline2Camelcase } from '@/background/utils';
import { CHAINS_ENUM, EVENTS } from '@/shared/constant';
import eventBus from '@/shared/eventBus';

import { rpcErrors } from '@/shared/lib/bitcoin-rpc-errors/errors';
import { ApprovalContext } from '@/shared/types/Approval';
import { WalletError } from '@/shared/types/Error';
import { ProviderControllerRequest } from '@/shared/types/Request';
import providerController from './controller';


const isSignApproval = (type: string) => {
    const SIGN_APPROVALS = ['SignText', 'SignPsbt', 'SignTx', 'SignData', 'SignInteraction'];
    return SIGN_APPROVALS.includes(type);
};
const windowHeight = 600;
const flow = new PromiseFlow<ApprovalContext>();
const flowContext = flow
    .use((ctx, next) => {
        // check method
        const {
            data: { method }
        } = ctx.request;
        ctx.mapMethod = underline2Camelcase(method);

        if (!providerController[ctx.mapMethod]) {
            throw rpcErrors.methodNotFound({
                message: `method [${method}] doesn't has corresponding handler`,
                data: ctx.request.data
            });
        }

        return next();
    })
    .use(async (ctx, next) => {
        const { mapMethod } = ctx;
        if (!Reflect.getMetadata('SAFE', providerController, mapMethod)) {
            // check lock
            const isUnlock = keyringService.memStore.getState().isUnlocked;

            if (!isUnlock) {
                ctx.request.requestedApproval = true;
                await notificationService.requestApproval({ lock: true });
            }
        }

        return next();
    })
    .use(async (ctx, next) => {
        // check connect
        const {
            request: {
                session: { origin, name, icon }
            },
            mapMethod
        } = ctx;
        // if (!Reflect.getMetadata('SAFE', providerController, mapMethod)) {
        if (!['getNetwork', 'switchNetwork', 'getChain', 'switchChain'].includes(mapMethod)) {
            if (!permissionService.hasPermission(origin)) {
                if (['getAccounts'].includes(mapMethod)) {
                    return [];
                }
                ctx.request.requestedApproval = true;
                await notificationService.requestApproval(
                    {
                        params: {
                            method: 'connect',
                            data: {},
                            session: { origin, name, icon }
                        },
                        approvalComponent: 'Connect'
                    },
                    { height: windowHeight }
                );
                permissionService.addConnectedSite(origin, name, icon, CHAINS_ENUM.BTC);
            }
        }

        return next();
    })
    .use(async (ctx, next) => {
        // check need approval
        const {
            request: {
                data: { params, method },
                session: { origin, name, icon }
            },
            mapMethod
        } = ctx;
        const [approvalType, condition, options = {}] =
            Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];

        if (approvalType && (!condition || !condition(ctx.request))) {
            ctx.request.requestedApproval = true;
            ctx.approvalRes = await notificationService.requestApproval(
                {
                    approvalComponent: approvalType,
                    params: {
                        method,
                        data: params || {},
                        session: { origin, name, icon }
                    },
                    origin
                },
                { height: windowHeight }
            );
            if (isSignApproval(approvalType)) {
                permissionService.updateConnectSite(origin, { isSigned: true }, true);
            } else {
                permissionService.touchConnectedSite(origin);
            }
        }

        return next();
    })
    .use(async (ctx) => {
        const { approvalRes, mapMethod, request } = ctx;
        // process request
        const [approvalType] = Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];

        const requestDefer = Promise.resolve(
            providerController[mapMethod]({
                ...request,
                approvalRes
            })
        );

        requestDefer
            .then((result) => {
                if (isSignApproval(approvalType)) {
                    eventBus.emit(EVENTS.broadcastToUI, {
                        method: EVENTS.SIGN_FINISHED,
                        params: {
                            success: true,
                            data: result
                        }
                    });
                }
                return result;
            })
            .catch((e: WalletError) => {
                if (isSignApproval(approvalType)) {
                    eventBus.emit(EVENTS.broadcastToUI, {
                        method: EVENTS.SIGN_FINISHED,
                        params: {
                            success: false,
                            errorMsg: e.message
                        }
                    });
                }
            });

            // TODO (typing): If a multi-step approval is needed, re-implement recursive requestApprovalLoop function here  

        return requestDefer;
    })
    .callback();

export default (request: ProviderControllerRequest) => {
    const ctx: ApprovalContext = { request: { ...request, requestedApproval: false }, mapMethod: ''};
    return flowContext(ctx).finally(() => {
        if (ctx.request.requestedApproval) {
            flow.requestedApproval = false;
            // only unlock notification if current flow is an approval flow
            notificationService.unLock();
        }
    });
};
