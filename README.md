# OP_WALLET

## How to build

-   Install [Node.js](https://nodejs.org) version >= 18.x
-   Install [Yarn](https://yarnpkg.com/en/docs/install)
-   Install dependencies: `yarn`
-   Build the project to the `./dist/` folder for the desired browser using one of the following commands:

    -   **Firefox:** `npm run build:firefox`
    -   **Brave:** `npm run build:brave`
    -   **Edge:** `npm run build:edge`
    -   **Opera:** `npm run build:opera`
    -   **Chrome (production):** `npm run build:chrome`
    -   **Chrome (development):** `npm run build:chrome:dev`

# Installing the OP_WALLET Extension

### 1. Download the OP_WALLET Prebuilt Files

-   Go to the [OP_WALLET GitHub repository](https://github.com/btc-vision/opwallet).
-   Download the latest prebuilt extension zip file from the [releases](https://github.com/btc-vision/opwallet/releases).

### 2. Unzip the Prebuilt Extension

-   Locate the downloaded ZIP file on your computer.
-   Right-click the ZIP file and select "Extract All..." or use your preferred unzipping tool to unzip the file.
-   Extract the contents to a folder of your choice. Remember the location of this folder as you will need it in the next steps.

### 3. Load the Extension for Your Browser

#### For Firefox

-   Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
-   Click **"Load Temporary Add-on..."**.
-   In the file dialog, navigate to the folder where you extracted the OP_WALLET files, select the `manifest.json` file, and click **Open**.

#### For Chrome, Brave, Edge, and Opera

1. Open the browser of your choice and go to the Extensions page:

    - **Chrome**: `chrome://extensions/`
    - **Brave**: `brave://extensions/`
    - **Edge**: `edge://extensions/`
    - **Opera**: `opera://extensions/`

2. Enable **Developer Mode** (usually found in the top right corner of the Extensions page).
3. Click **"Load unpacked"**.
4. In the file dialog, navigate to the folder where you extracted the OP_WALLET files and select the folder.

### 4. Verify the Installation

-   The OP_WALLET extension should now appear in your list of extensions on the Extensions page.
-   You should see the OP_WALLET icon in your browser's toolbar, indicating that the extension has been successfully installed.

## Conclusion

You have successfully installed the OP_WALLET extension. You can now use it to manage your OP_NET tokens and interact with the Bitcoin blockchain.

## Updating/Upgrading the OP_WALLET Extension

1. Ensure you have your seed phrase handy.
2. Remove (or disable) the previously installed version of the extension.
3. Download and install the latest version following **Installing the OP_WALLET Extension** steps above.
