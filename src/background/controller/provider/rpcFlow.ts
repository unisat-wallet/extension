import 'reflect-metadata';

import { keyringService, notificationService, permissionService } from '@/background/service';
import { PromiseFlow, underline2Camelcase } from '@/background/utils';
import { CHAINS_ENUM, EVENTS } from '@/shared/constant';
import eventBus from '@/shared/eventBus';

import { isProviderControllerMethod } from '@/background/utils/controller';
import { rpcErrors } from '@/shared/lib/bitcoin-rpc-errors/errors';
import { ApprovalContext, ApprovalType } from '@/shared/types/Approval';
import { ProviderControllerRequest } from '@/shared/types/Request';
import { isWalletError } from '@/shared/utils/errors';
import providerController, { ProviderController } from './controller';


// This is used for type safety while returning approval metadata
type ApprovalMetadata = [ApprovalType, (req: ProviderControllerRequest) => boolean, object?];


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

        if (!isProviderControllerMethod(ctx.mapMethod)) {
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
                        approvalComponent: ApprovalType.Connect
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
        const approvalMetadata = Reflect.getMetadata('APPROVAL', providerController, mapMethod) as ApprovalMetadata | undefined;
        const [approvalType, condition, options = {}] = approvalMetadata || [];
        

        if (approvalType && !condition?.(ctx.request)) {
            ctx.request.requestedApproval = true;
            ctx.approvalRes = await notificationService.requestApproval(
                {
                    approvalComponent: approvalType,
                    params: {
                        method,
                        data: params ?? {},
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
        const approvalMetadata = Reflect.getMetadata('APPROVAL', providerController, mapMethod) as ApprovalMetadata | undefined;
        const [approvalType = ''] = approvalMetadata || [];

        const method = providerController[mapMethod as keyof ProviderController];
        // TODO (typing): Check this again as it's not the most ideal solution. 
        // However, the problem is that we have a general type like RequestParams for 
        // incoming request data as we have different handlers. So, we assumed that 
        // the params are passed correctly for each method for now.
        const requestDefer = Promise.resolve(
            (method as (args?: object) => unknown).call(providerController, { ...request, approvalRes })
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
            .catch((e: unknown) => {
                if (isSignApproval(approvalType)) {
                    eventBus.emit(EVENTS.broadcastToUI, {
                        method: EVENTS.SIGN_FINISHED,
                        params: {
                            success: false,
                            errorMsg: isWalletError(e) ? e.message : 'Unknown error occurred'
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
