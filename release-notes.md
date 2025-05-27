# UniSat Wallet Release Notes

## v1.7.0

New Features

- Added support for Alkanes.

## v1.6.3

New Features

- Added sidebar

- Added method: unisat.multiSignMessage([{text:'example',type:'ecdsa'}])

Bug Fixes

- Fixed an issue with parameters when signing P2TR scripts (most for CAT20 txns).
  For script path inputs, the default behavior is to use the original public key for signing. You can explicitly specify whether to use the TweakedSigner by setting the useTweakedSigner option. If not explicitly set, the signer will automatically determine which key to use based on the presence of a tapLeafScript in the input. If the tapLeafScript contains the original public key, the original key will be used for signing; otherwise, the TweakedSigner will be used. In most cases, the signing method can be automatically determined without needing to pass additional parameters.

## v1.6.2

New Features

- Support for multiple languages\n
- Fractal testnet now supports single-step transfer

## v1.6.1

New Features

- Added address book
- Added feedback entrance
- Support Babylon mainnet

Improvements

- Restructure Settings Tab

## v1.6.0

Changes

- Remove atomicals token support.

Bug Fixes

- Fixed Keystone signing bugs.

- Fixed potential vulnerabilities.

Improvements

- Improve wallet loading speed.

## v1.5.9

New Features

- Added UTXO management tool entry on the homepage.

Bug Fixes

- Updated outdated phishing website list.

- Fixed text overflow in purchase popup.

- Fixed amount modification issue when going back in the Transfer page.

- Fixed gas fee selection not applying when sending tBABY.

Improvements

- Optimized performance for the homepage inscription list.

## v1.5.8

New Features

- Added Phishing Website Detection: Implemented a new feature to detect and warn users about potential phishing websites.

Improvements

- Error Page Handling: Improved user experience by displaying an error page instead of a black bar when a page encounters an exception.

- BABY Transfer Interface: Added a gas fee modification option to the BABY transfer interface (previously, gas fees were fixed).

- Window Object Conflict Prevention: Introduced window.unisat_wallet object to prevent conflicts with other existing plugins that might interfere with Unisat.

Bug Fixes

- Fixed a signing issue introduced in version 1.5.7

Other Changes

- Removed the Telegram group contact information from the project.

## v1.5.7

- Fix Keystone Babylon integration

## v1.5.6

- Fix Babylon RPC

## v1.5.5

- Integration of Babylon Bitcoin Staking Phase 2

## v1.5.4

1. Added an Unlock button on the Fractal mainnet to navigate to the UTXO management tool.
2. In advanced settings, added a toggle for Atomicals, allowing users to disable ARC20 and free up the unavailable balance.
3. Adjusted the user interface.

## v1.5.3

- Support CAT721
- Support purchasing FB through AlchemyPay

## v1.5.2

- Added display of USD prices for FB, BRC20, Runes, CAT20 in fractal
- New discovery page
- Fix the issue where signing individually in a batch may result in a 'network not match' error.

## v1.5.1

- During batch signing, for whitelisted websites, one-click signing is allowed.
- Merged keystone's PR, supports USB mode.
- Added the optional parameter useTweakedSigner to the methods signPsbt/signPsbts. This allows for the use of a tweaked signer to sign non-Taproot addresses, which is required for CAT721's lock to mint.
- When switching wallets and switching accounts, it will automatically scroll to the corresponding row and display the scrollbar.

## v1.5.0

- Support CAT20

## v1.4.10

- Add address tips. (It is not recommended to use legacy addresses on Fractal.)

## v1.4.9

- Display short names for bool bridge and simple bridge ticks
- Support for .fb domain on fractal
- Fix the issue where batch signing PSBT can get stuck when there are too many transactions
- Fix fractal browser link.

## v1.4.8

- Allow passing in tapLeafHashToSign when calling signPsbt

## v1.4.7

- Remove the maximum fee rate limit

## v1.4.6

- Enable Fractal Bitcoin Mainnet
- Fix Address QRCode

## v1.4.5

- Add Fractal Bitcoin Testnet
- Add password strength detection.
- Add automatic lock time in Advanced
- Fix `networkChanged` for issue#211
- Add `unisat.disconnect` for issue#204

## v1.4.2

- Support Testnet4
- Support Signet
- Fixed the issue of the app crashing when transferring Runes with multiple UTXOs
- Fixed the issue with the display of the available balance of partially-colored funds during an ARC20 transfer
- Fixed the issue with the incorrect display of HdPath in Keystone
- Audit fix: Removed private methods from the browser plugin object to enhance security
- Audit fix: Methods such as getPublicKey, getNetwork, switchNetwork are now only accessible after authorization for improved security.

## v1.4.1

- Support for setting transfer fees with one decimal place
- Added display of USD prices for BTC、BRC20 and Runes
- Real-time fee displays for various buy BTC options
- Fix unisat.sendRunes
- Fix unisat.multiSginPsbt

## v1.4.0

- Support fractalbitcoin

## v1.3.4

- Compatible with partial token coloring for ARC20

## v1.3.3

- Support keystone

## v1.3.2

- Support cursed inscription
- Optimized the UTXO selection strategy of runes to reduce gas fees
- Add runes logo
- Add AlchemyPay
- Fix Runes details

## v1.3.1

- Fixed the bug of runes constructing a burn transaction
- Fixed the bug of "can not convert 1+21 to bigint" appearing during transfer

## v1.3.0

- Support Runes
- Add a toggle for enabling unconfirmed balances.
- No longer forcing pop-up warnings for transactions with high or low fee rates.
- Reverted the default inscribe outputValue to 546 sats for simplified operations.
- Fix MultiSignPsbt

## v1.2.10

- Support 5-byte BRC20
- Improve the display of BRC20

## v1.2.9

- Added `memos` parameter to `unisat.sendBitcoin` method, for constructing runes transactions (github #164 and #167)
- Fixed a bug in the `unisat.sendInscription` method (github #159)
- Fixed the problem where an order could not succeed when the wallet balance and the payment amount were exactly equal when inscribe a TRANSFER inscription
- Improved balance display, showing both available and unavailable balances
- Improved the asset display during transaction signing, added BRC20 display
- Improved risk warnings during transaction signing, and now requires the input of CONFIRM to proceed when warnings appear.

## v1.2.8

- The unisat.sendBitcoin method has added a memo parameter, increasing OP_RETURN output when sending btc.
- A new unisat.getBitcoinUtxos method has been added, through which the developers can get users UTXO without inscription assets.
- A new unisat.signData method has been added, through which the developers can have users participate in multi-signature.

## v1.2.7

- Allowing decimal inputs when inscribing BRC20 TRANSFER.
- Support more precise inscription outputValue, reduced to 294 for P2WPKH addresses.
- Use deterministic ECDSA signatures in `unisat.signMessage`.

## v1.2.6

- Mixed inscriptions can now be sent without splitting
- Fixed an issue with the address amount input box restrictions:
  - Limited BTC input to a maximum of 8 decimal places.
  - Spaces are now ignored when entering an address.
  - Restricted ARC20 input amount.

## v1.2.5

- Minimum output amount for inscriptions can now be set to 330.
- Added the ability to disable Atomicals (only when there are no Atomicals assets).
- Added the API `isAtomicalsEnabled` to determine if the user has enabled the Atomicals feature.
- Implemented version checking to prompt for upgrades when a new version is available.
- Fixed an issue where transferring inscriptions and ARC20 without available BTC would result in an error.

## v1.2.4

- Fixed an issue where exporting private keys was not possible.

## v1.2.3

- Replaced secp256k1 to maintain the signature logic of v1.1.33.
- Added the `getVersion` method to retrieve the wallet version.

## v1.2.2

- Fixed an issue where the fee rate would decrease during transfers.

## v1.2.1

- Fixed the issue of failed P2TR signature.

## v1.2.0

- Added support for Atomicals.
- Refactored underlying code using @unisat/wallet-sdk.

## v1.1.33

- Fix changing address type of simple keyring

## v1.1.32

- Support .btc as recipient address
- Support recovery from OrdinalsWallet

## v1.1.31

- Support .x as recipient address
- Fix the signature error of P2TR #86
- Restrict the input field's content

## v1.1.30

- Added the parameter "toSignInputs" to the "signPsbt" method

## v1.1.29

- Update app summary
- Change api url

## v1.1.28

- Patch the vulnerability CVE-2022-32969

## v1.1.27

- Fix typo error

## v1.1.26

In this version, we focused on security upgrades and introduced several new features and enhancements. Here are the updates:

1. Manual Wallet Locking

- Users now have the ability to manually lock their wallets for added security.

2. Protection against Phishing Websites

- To protect users from potential phishing attacks, the wallet will now block connections to suspicious websites during wallet access and transaction signing.

3. Blacklist Address Blocking

- Transactions containing addresses on the blacklist will be blocked during the signing process to prevent potential security risks.

4. Risk Warning on Transaction Signing Exceptions

- Users will receive a risk warning if any abnormal behavior is detected while signing transactions. Currently, abnormal behavior is identified by the loss of plaintext.

5. Risk Warning during Batch Transaction Signing

- A risk warning will be displayed when performing batch transaction signing, ensuring users are aware of potential risks.

6. Improved Inscription Splitting

- We have improved the process of inscription spliting, allowing users to choose a minimum amount of satoshis for each split inscription, providing greater flexibility. For individual inscription balances exceeding 10,000 satoshis, users can split the balance for better management.

## v1.1.25

**Major changes**

- Scan more addresses when restoring wallet
- Disable mnemonic translation
- Fix a issue that selecting an account do not take effect
- Fix a issue that fails to sign PSBT with M44_P2TR address

## v1.1.24

**Major changes**

- Support restoring wallet by 24-words
- Support spliting UTXO that contains multiple inscriptions

## v1.1.23

**Major changes**

- Support exporting Hex Private Key
- Add risk warnings when exporting Private Key and Secret Recovery Phrase
- Fix a issue that when exporting a non-active wallet, incorrectly exports the Secret Recovery Phrase of the active wallet
- Fix a display issue of "Failed to fetch."
- Fix a issue that "getBalance " API returns incorrect unconfirmed balance

## v1.1.22

**Major changes**

- Extend the maintenance time of the plugin

## v1.1.21

**Major changes**

- Fix the issue that all wallet's names become wrong after deleting a wallet
- Adjust the process of inscribing a TRANSFER
- Add MV2 in github release

## v1.1.20

**Major changes**

- Support purchasing BTC through MoonPay
- Disable RBF to prevent accidental triggering
- Display the output value of inscription by default
- Display balance details when hovering over the balance
- Use mempool.space to display transaction history
- Add a prompt to wait for BRC20 updates after inscribing a TRANSFER

## v1.1.19

**Minor changes**

- Fix error of BRC-20 with special characters

## v1.1.18

**Minor changes**

- Optimize the display of PSBT

## v1.1.17

**Major changes**

- Feature
  - Add API unisat.inscribeTransfer(ticker:string, amount:string)

**Minor changes**

- Add sentry to trace bugs

## v1.1.16

**Major changes**

- Feature
  - Support BIP322
  - Sign multiple PSBT in one time
- Adjust
  - Use mempool.space data as fee options
  - Show 100 inscriptions per page
- Fix
  - Fix display error of pagination
  - Fix a issue that addresses holding too many UTXOs cannot construct transactions
  - Fix a issue that changing wallet/account name sometimes does not take effect
  - Fix a issue that N/A problem occurs because the input amount is not legal

## v1.1.15

**Major changes**

- BRC-20 related
  - Add BRC-20 transfer and inscribing functions
- Account related
  - Add support for modifying account name
  - Display both BTC balance and inscription count of different address type.
- Domain resolution related
  - Add domain name resolution of .unisat
  - After a domain name is resolved successfully, the corresponding inscription number will be displayed
  - Fixed the problem that the parsing of special symbols failed
- Transaction related
  - Optimize the display of SignPSBT page
  - When the payment fails, a specific error message will be displayed
- Unisat Api related
  - Add getInscriptions method
  - Add sendInscription method
- Others
  - Fixed text issue

## v1.1.14

**Major changes**

- Change logo
- Add activeTab permission

## v1.1.13

**Major changes**

- Fix issue in v1.1.12

## v1.1.12

**Major changes**

- Fix some error of creating transactions

**Minor changes**

- Can choose P2TR address type when restoring from Xverse Wallet
- Hide Inscription Number when unconfirmed
- Remove .btc text

## v1.1.11

**Major changes**

- Remove .btc domain

## v1.1.10

**Major changes**

- Support customization of outputValue

## v1.1.9

**Minor changes**

- Disable in iframes
- Keep unlocked for longer
- Fix duplicate pop-up windows

## v1.1.8

**Major changes**

- Remove the "activeTab" and "notifications" permissions

## v1.1.7

**Major changes**

- Support .sats, .btc as recipient address
- Support customizing network fee rate
- Fix the signature error of P2TR

**Minor changes**

- Support to view the detail of address in signing page

## v1.1.6

**Major changes**

- Support custom hdPath

**Minor changes**

- Unify and extend the abbreviation length of address
- Complete the display of hdPath

## v1.1.5

**Major changes**

- Wallet account structure changes, support multiple HD wallets, each wallet supports multiple accounts
- Support recovery from wallets such as Sparrow, Xverse, etc.
- Support P2SH-P2WPKH address format

**Minor changes**

- The wallet will wait for the website to load and then inject, up to 60s
- Automatically reject approvals when window loses focus

## v1.0.3

**Major changes**

- The displaying layout of NFTs in the extension is updated to match the layout on https://unisat.io/
- The default focus is set into the input field for easier keyboard input as needed

**Minor changes**

- Prevent the inscription script from executing on its own
- Removed temporary data stored in local storage
- Fixed some script errors
