
# UniSat Wallet Release Notes

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
