import { ProviderController } from "../controller/provider/controller";
import internalMethod, { InternalMethod } from "../controller/provider/internalMethod";
import { WalletController } from "../controller/wallet";
import { OpenApiService } from "../service/openapi";

export function isProviderControllerMethod(key: string): key is keyof ProviderController {
    return key in ProviderController.prototype && typeof ProviderController.prototype[key as keyof ProviderController] === 'function';
}

export function isWalletControllerMethod(key: string): key is keyof WalletController {
    return key in WalletController.prototype && typeof WalletController.prototype[key as keyof WalletController] === 'function';
}

export function isOpenapiServiceMethod(key: string): key is keyof OpenApiService {
    return key in OpenApiService.prototype && typeof OpenApiService.prototype[key as keyof OpenApiService] === 'function';
}

export function isInternalMethod(method: string): method is keyof InternalMethod {
    return method in internalMethod;
}
