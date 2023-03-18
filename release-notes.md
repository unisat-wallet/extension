
# UniSat Wallet Release Notes

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
