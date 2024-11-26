import { walletController } from "../controller";
import providerControllerInstance, { ProviderController } from "../controller/provider/controller";
import internalMethod, { InternalMethod } from "../controller/provider/internalMethod";
import { WalletController } from "../controller/wallet";
import { OpenApiService } from "../service/openapi";

export function isProviderControllerMethod(key: string): key is keyof ProviderController {
    return key in providerControllerInstance && typeof providerControllerInstance[key as keyof ProviderController] === 'function';
}

export function isWalletControllerMethod(key: string): key is keyof WalletController {
    return key in walletController && typeof walletController[key as keyof WalletController] === 'function';
}

export function isOpenapiServiceMethod(key: string): key is keyof OpenApiService {
    return key in walletController.openapi && typeof walletController.openapi[key as keyof OpenApiService] === 'function';
}

export function isInternalMethod(method: string): method is keyof InternalMethod {
    return method in internalMethod;
}
