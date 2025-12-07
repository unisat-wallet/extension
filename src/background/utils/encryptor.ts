import * as browserPassworder from 'browser-passworder';

// Production-ready encryptor using browser-passworder

async function encrypt(password: string, data: any): Promise<string> {
  return await browserPassworder.encrypt(password, data);
}

async function decrypt(password: string, encryptedData: string): Promise<any> {
  return await browserPassworder.decrypt(password, encryptedData);
}

export const encryptor = {
  encrypt,
  decrypt
};
