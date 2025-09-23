import { AuthProviders } from '@opentdf/sdk';
import { NanoTDFClient } from '@opentdf/sdk/nano';

const clientId = "opentdf";
const clientSecret = "secret";
const oidcOrigin = "http://localhost:8888/auth/realms/opentdf";
const kasEndpoint = "http://localhost:8080/kas";

// Create the AuthProvider using client credentials
const authProvider = await AuthProviders.clientSecretAuthProvider({
  clientId,
  clientSecret,
  oidcOrigin,
  exchange: 'client',
});

// Create the NanoTDFClient
const client = new NanoTDFClient({
  authProvider,
  kasEndpoint,
});

client.dataAttributes = ["http://opentdf.io/attr/class/value/secret"];

const plaintext = new TextEncoder().encode("Hello, World!");
const ciphertext = await client.encrypt(plaintext);
console.log("Ciphertext:", new Uint8Array(ciphertext));

// // To decrypt:
// const cleartext = await client.decrypt(ciphertext);
// console.log("Cleartext:", new TextDecoder().decode(cleartext));