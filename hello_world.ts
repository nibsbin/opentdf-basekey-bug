import { AuthProviders, OpenTDF, CreateZTDFOptions, DecoratedStream, ReadOptions } from '@opentdf/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const clientId = "opentdf";
const clientSecret = "secret";
const oidcOrigin = "http://localhost:8888/auth/realms/opentdf";
const kasEndpoint = "http://localhost:8080/kas";
const platformEndpoint = "http://localhost:8080";

// Create the AuthProvider using client credentials
const authProvider = await AuthProviders.clientSecretAuthProvider({
    clientId,
    clientSecret,
    oidcOrigin,
    exchange: 'client',
});
console.log("✅ Authentication provider created");

// Create OpenTDF client
console.log("🔧 Creating OpenTDF client...");
const client = new OpenTDF({
    authProvider: authProvider,
    platformUrl: platformEndpoint,
});
console.log("✅ Client created");
// ABAC - Attribute-Based Access Control
// Option 1: No attributes (simplest for demonstration)
const attributes: string[] = []; 

// Option 2: With attributes (requires proper attribute configuration on platform)
// const attributes = ["http://example.com/attr/classification/value/secret"];

// Create temporary files
const tempDir = os.tmpdir();
const inputFile = path.join(tempDir, 'opentdf-input.txt');
const encryptedFile = path.join(tempDir, 'opentdf-encrypted.tdf');
const decryptedFile = path.join(tempDir, 'opentdf-decrypted.txt');

// client.dataAttributes = ["http://opentdf.io/attr/class/value/secret"];
console.log(`📁 Using temp files:`);
console.log(`   Input: ${inputFile}`);
console.log(`   Encrypted: ${encryptedFile}`);
console.log(`   Decrypted: ${decryptedFile}`);

// Write input data to temporary file
const inputData = "This is sensitive data that will be encrypted with OpenTDF!";
console.log("📝 Preparing sensitive data for encryption...");
fs.writeFileSync(inputFile, inputData, 'utf8');
console.log(`✅ Input file written: ${inputData}`);

// Encrypt using OpenTDF client
console.log("🔒 Starting encryption...");
console.log("📖 Reading input file for encryption...");

// Read the file and create a Web ReadableStream
console.log("📡 Calling client.encrypt...");
let opts: CreateZTDFOptions = {
    source: { type: 'buffer', location: new TextEncoder().encode(fs.readFileSync(inputFile).toString()) },
}
let tdf = await client.createZTDF(opts);

// Save encrypted stream to file
console.log(`💾 Saving encrypted data to temp file ${encryptedFile}`);

const encrypted = await new Response(tdf).bytes()
fs.writeFileSync(encryptedFile, encrypted);

console.log('✅ Data encrypted and saved to file!');


// Decrypt ZTDF
console.log("🔓 Decrypting data...");

const fileBuffer: Buffer = fs.readFileSync(encryptedFile);
const byteArray: Uint8Array = new Uint8Array(fileBuffer);

const decoratedStream: DecoratedStream = await client.read({
    source: { type: 'buffer', location: byteArray },
} as ReadOptions);

const decrypted = await new Response(decoratedStream).text();

// Save decrypted stream to file
console.log("💾 Saving decrypted data to temp file...");
fs.writeFileSync(decryptedFile, decrypted);

// Read and display the decrypted content
const decryptedContent = fs.readFileSync(decryptedFile, 'utf8');
console.log('✅ Data decrypted and saved to file!');
console.log(`📤 Decrypted content: \n\n"${decryptedContent}"\n\n`);

// Copy 'encryptedFile' to CWD
fs.copyFileSync(encryptedFile, path.join(process.cwd(), 'opentdf-encrypted.tdf'));

process.exit(0);
