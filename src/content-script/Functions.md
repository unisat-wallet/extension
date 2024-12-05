# Functions Documentation

This document provides a detailed overview of the public functions exposed by the `OpnetProvider` injected into the webpage. Each function includes information about the parameters you need to pass and the expected return values.

For full documentation, visit [docs.opnet.org](https://docs.opnet.org).

---

## **General Methods**

### **`requestAccounts()`**
Requests the user's wallet accounts.

- **Parameters:**  
  None.
  
- **Returns:**  
  A `Promise<string[]>` resolving to an array of account addresses.

---

### **`disconnect()`**
Disconnects the wallet from the current dApp session.

- **Parameters:**  
  None.
  
- **Returns:**  
  A `Promise<void>` indicating the operation's completion.

---

### **`getNetwork()`**
Retrieves the current network details.

- **Parameters:**  
  None.
  
- **Returns:**  
  A `Promise<string>` resolving to the network name (e.g., `"mainnet"`, `"testnet"`, `"regtest"`).

---

### **`switchNetwork(network: string)`**
Switches the wallet to a different network.

- **Parameters:**  
  - `network`: A string representing the target network name.
  
- **Returns:**  
  A `Promise<void>` indicating the operation's completion.

---

### **`getChain()`**
Retrieves detailed information about the current blockchain chain.

- **Parameters:**  
  None.

- **Returns:**  
  A `Promise<{ enum: string, name: string, network: string }>` resolving to an object containing:  
  - `enum`: The chain type as a string.  
  - `name`: The label of the chain.  
  - `network`: The network name associated with the chain.

---

### **`switchChain(chain: string)`**
Switches the wallet to a different blockchain chain.

- **Parameters:**  
  - `chain`: A string representing the target chain name.
  
- **Returns:**  
  A `Promise<void>` indicating the operation's completion.

---

## **Account and Wallet Information**

### **`getAccounts()`**
Returns the accounts available in the wallet.

- **Parameters:**  
  None.
  
- **Returns:**  
  A `Promise<string[]>` resolving to an array of account addresses.

---

### **`getPublicKey()`**
Retrieves the public key of the selected account.

- **Parameters:**  
  None.
  
- **Returns:**  
  A `Promise<string>` resolving to the public key.

---

### **`getBalance()`**
Retrieves the balance of the selected account.

- **Parameters:**  
  None.
  
- **Returns:**  
  A `Promise<number>` resolving to the account balance in Satoshis.

---

### **`getInscriptions(cursor = 0, size = 20)`**
Retrieves inscriptions associated with the wallet by offering pagination support.

- **Parameters:**  
  - `cursor`: *(optional)* A number indicating the starting index for pagination (default is `0`).
  - `size`: *(optional)* A number indicating the number of inscriptions to fetch (default is `20`).
  
- **Returns:**  
  A `Promise<any[]>` resolving to an array of inscription objects.

---

## **Signing and Verification**

### **`signMessage(text: string, type: string)`**
Signs a given message with the selected account.

- **Parameters:**  
  - `text`: The message string to sign.
  - `type`: The signature type (e.g., `"bip322-simple"`, `"ecdsa"`, `"schnorr"`).
  
- **Returns:**  
  A `Promise<string>` resolving to the signature.

---

### **`verifyMessageOfBIP322Simple(address: string, message: string, signature: string, network?: number)`**
Verifies a message signature using BIP322 simple format.

- **Parameters:**  
  - `address`: The address to verify against.
  - `message`: The signed message.
  - `signature`: The signature to verify.
  - `network`: *(optional)* The network identifier (e.g., `1` for mainnet).
  
- **Returns:**  
  A `Promise<boolean>` resolving to `true` if the signature is valid.

---

### **`signData(data: string, type: string)`**
Signs raw data.

- **Parameters:**  
  - `data`: The raw data to sign.
  - `type`: The signature type.
  
- **Returns:**  
  A `Promise<string>` resolving to the signature.

---

## **Bitcoin Transactions**

### **`sendBitcoin(toAddress: string, satoshis: number, options?: { feeRate: number; memo?: string; memos?: string[] })`**
Sends Bitcoin to a specified address.

- **Parameters:**  
  - `toAddress`: The recipient's Bitcoin address.
  - `satoshis`: The amount to send in Satoshis.
  - `options`: *(optional)* An object containing:  
    - `feeRate`: Fee rate for the transaction (in Satoshis per byte).  
    - `memo`: *(optional)* A memo string.  
    - `memos`: *(optional)* An array of memo strings.

- **Returns:**  
  A `Promise<string>` resolving to the transaction hash.

---

### **`getBitcoinUtxos(cursor = 0, size = 20)`**
Retrieves Bitcoin UTXOs with pagination support.

- **Parameters:**  
  - `cursor`: *(optional)* A number indicating the starting index for pagination (default is `0`).
  - `size`: *(optional)* A number indicating the number of UTXOs to fetch (default is `20`).

- **Returns:**  
  A `Promise<UTXO[]>` resolving to an array of UTXO objects.

---

## **Contract Interactions**

### **`deployContract(params: IDeploymentParametersWithoutSigner)`**
Deploys a smart contract to the blockchain.

- **Parameters:**  
  - `params`: An object containing contract deployment parameters.
  
- **Returns:**  
  A `Promise<DeploymentResult>` resolving to the deployment result.

---

### **`signInteraction(interactionParameters: InteractionParametersWithoutSigner)`**
Signs an interaction with a contract.

- **Parameters:**  
  - `interactionParameters`: An object containing interaction details (e.g., calldata, contract address).
  
- **Returns:**  
  A `Promise<[string, string, UTXO[]]>` resolving to the interaction result.

---

### **`signAndBroadcastInteraction(interactionParameters: InteractionParametersWithoutSigner)`**
Signs and broadcasts a contract interaction to the network.

- **Parameters:**  
  - `interactionParameters`: An object containing interaction details.

- **Returns:**  
  A `Promise<[BroadcastedTransaction, BroadcastedTransaction, UTXO[]]>` resolving to the broadcast result.

---

### **`broadcast(transactions: BroadcastTransactionOptions[])`**
Broadcasts raw transaction data to the network.

- **Parameters:**  
  - `transactions`: An array of transaction objects, each containing:  
    - `raw`: The raw transaction string.  
    - `psbt`: A boolean indicating whether the transaction is a PSBT.

- **Returns:**  
  A `Promise<BroadcastedTransaction[]>` resolving to the broadcasted transactions.

---

## **PSBT Operations**

### **`signPsbt(psbtHex: string, options?: SignPsbtOptions)`**
Signs a PSBT.

- **Parameters:**  
  - `psbtHex`: The PSBT in hexadecimal format.
  - `options`: *(optional)* Signing options.

- **Returns:**  
  A `Promise<string>` resolving to the signed PSBT.

---

### **`signPsbts(psbtHexs: string[], options?: SignPsbtOptions[])`**
Signs multiple PSBTs.

- **Parameters:**  
  - `psbtHexs`: An array of PSBTs in hexadecimal format.
  - `options`: *(optional)* An array of signing options for each PSBT.

- **Returns:**  
  A `Promise<string[]>` resolving to the signed PSBTs.

---

### **`pushPsbt(psbtHex: string)`**
Pushes a signed PSBT to the network.

- **Parameters:**  
  - `psbtHex`: The signed PSBT in hexadecimal format.

- **Returns:**  
  A `Promise<string>` resolving to the transaction hash.

---

## **Others**

### **`pushTx(rawtx: string)`**
Pushes a raw Bitcoin transaction to the network.

- **Parameters:**  
  - `rawtx`: The raw transaction string.

- **Returns:**  
  A `Promise<string>` resolving to the transaction hash.

---

### **`getVersion()`**
Retrieves the current version of the wallet extension.

- **Parameters:**  
  None.
  
- **Returns:**  
  A `Promise<string>` resolving to the wallet version.

---

## **Event Handling**
The following events are emitted by the provider:
- **`connect`**: Triggered when the wallet connects to a dApp.
- **`disconnect`**: Triggered when the wallet disconnects.
- **`accountsChanged`**: Triggered when wallet accounts change.
- **`networkChanged`**: Triggered when the network configuration changes.

---

This document serves as a quick reference for developers exploring the repository. For more details, visit [docs.opnet.org](https://docs.opnet.org).
