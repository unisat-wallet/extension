const PHISHING_LIST_URL = 'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json';

export const fetchPhishingList = async () => {
  const response = await fetch(PHISHING_LIST_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch phishing list');
  }
  return response.json();
};
