export const bbnTestnet5 = {
  chainId: 'bbn-test-5',
  chainName: 'Babylon Phase-2 Testnet',
  chainSymbolImageUrl:
    'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png',
  rpc: 'https://babylon-testnet-rpc.nodes.guru',
  rest: 'https://babylon-testnet-api.nodes.guru',
  nodeProvider: {
    name: 'Babylonlabs',
    email: 'contact@babylonlabs.io',
    website: 'https://babylonlabs.io/'
  },
  bip44: {
    coinType: 118
  },
  bech32Config: {
    bech32PrefixAccAddr: 'bbn',
    bech32PrefixAccPub: 'bbnpub',
    bech32PrefixValAddr: 'bbnvaloper',
    bech32PrefixValPub: 'bbnvaloperpub',
    bech32PrefixConsAddr: 'bbnvalcons',
    bech32PrefixConsPub: 'bbnvalconspub'
  },
  currencies: [
    {
      coinDenom: 'tBABY',
      coinMinimalDenom: 'ubbn',
      coinDecimals: 6,
      coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png'
    }
  ],
  feeCurrencies: [
    {
      coinDenom: 'tBABY',
      coinMinimalDenom: 'ubbn',
      coinDecimals: 6,
      coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png',
      gasPriceStep: {
        low: 0.005,
        average: 0.007,
        high: 0.01
      }
    }
  ],
  stakeCurrency: {
    coinDenom: 'tBABY',
    coinMinimalDenom: 'ubbn',
    coinDecimals: 6,
    coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png'
  },
  features: ['cosmwasm'],
  explorer: 'https://testnet.babylon.explorers.guru'
};

export const bbnDevnet = {
  chainId: 'devnet-9',
  chainName: 'Babylon Devnet 9',
  chainSymbolImageUrl:
    'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png',
  rpc: 'https://rpc-dapp.devnet.babylonlabs.io',
  rest: 'https://lcd-dapp.devnet.babylonlabs.io',
  nodeProvider: {
    name: 'Babylonlabs',
    email: 'contact@babylonlabs.io',
    website: 'https://babylonlabs.io/'
  },
  bip44: {
    coinType: 118
  },
  bech32Config: {
    bech32PrefixAccAddr: 'bbn',
    bech32PrefixAccPub: 'bbnpub',
    bech32PrefixValAddr: 'bbnvaloper',
    bech32PrefixValPub: 'bbnvaloperpub',
    bech32PrefixConsAddr: 'bbnvalcons',
    bech32PrefixConsPub: 'bbnvalconspub'
  },
  currencies: [
    {
      coinDenom: 'BABY',
      coinMinimalDenom: 'ubbn',
      coinDecimals: 6,
      coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png'
    }
  ],
  feeCurrencies: [
    {
      coinDenom: 'BABY',
      coinMinimalDenom: 'ubbn',
      coinDecimals: 6,
      coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png',
      gasPriceStep: {
        low: 0.005,
        average: 0.007,
        high: 0.01
      }
    }
  ],
  stakeCurrency: {
    coinDenom: 'BABY',
    coinMinimalDenom: 'ubbn',
    coinDecimals: 6,
    coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png'
  },
  features: ['cosmwasm'],
  explorer: '',
  stakingUrl: ''
};

export const bbnMainnet = {
  chainId: 'bbn-1',
  chainName: 'Babylon Genesis Network',
  chainSymbolImageUrl:
    'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png',
  rpc: 'https://babylon.nodes.guru/rpc',
  rest: 'https://babylon.nodes.guru/api',
  nodeProvider: {
    name: 'Babylonlabs',
    email: 'contact@babylonlabs.io',
    website: 'https://babylonlabs.io/'
  },
  bip44: {
    coinType: 118
  },
  bech32Config: {
    bech32PrefixAccAddr: 'bbn',
    bech32PrefixAccPub: 'bbnpub',
    bech32PrefixValAddr: 'bbnvaloper',
    bech32PrefixValPub: 'bbnvaloperpub',
    bech32PrefixConsAddr: 'bbnvalcons',
    bech32PrefixConsPub: 'bbnvalconspub'
  },
  currencies: [
    {
      coinDenom: 'BABY',
      coinMinimalDenom: 'ubbn',
      coinDecimals: 6,
      coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png'
    }
  ],
  feeCurrencies: [
    {
      coinDenom: 'BABY',
      coinMinimalDenom: 'ubbn',
      coinDecimals: 6,
      coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png',
      gasPriceStep: {
        low: 0.005,
        average: 0.007,
        high: 0.01
      }
    }
  ],
  stakeCurrency: {
    coinDenom: 'BABY',
    coinMinimalDenom: 'ubbn',
    coinDecimals: 6,
    coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-test/chain.png'
  },
  features: ['cosmwasm'],
  explorer: 'https://babylon.explorers.guru'
};

export const COSMOS_CHAINS = ['bbn-test-5', 'devnet-9', 'bbn-1'];

export type CosmosChainInfo = typeof bbnTestnet5;

export const COSMOS_CHAINS_MAP: {
  [key: string]: CosmosChainInfo;
} = {
  'bbn-test-5': bbnTestnet5,
  'devnet-9': bbnDevnet,
  'bbn-1': bbnMainnet
};
