import { EthereumProviderError, EthereumRpcError } from "eth-rpc-errors";

// TODO (typing): when we have a method-response mapping (i.e. methods in providerController),
// we can replace these unknown types with their response types. Also, since there is a messaging protocol
// between background and ui or content-script, there may be some errors as well. So, we created a union of 
// all errors that can happen in the whole extension. We can use if checks while adding error handling for
// specific parts but it's not needed for now since we are just using the message field.
export type AppError = Error | EthereumProviderError<unknown> | EthereumRpcError<unknown>;