# Basekey Misconfiguration Bug

This project contains a minimal reproduction of a potential bug using the documented code in the [OpenTDF web-sdk README](https://github.com/opentdf/web-sdk/blob/49798854abf0663b2c29848adc2ca3cba3eddf67/README.md).

When calling `NanoTDFClient.encrypt()`, I encountered a `NetworkError` indicating that the KAS is misconfigured due to a missing `BaseKey` in the `WellKnownConfiguration`. Interestingly, Ciphertext still returns a value.

```bash
<*>@Mac opentdf-basekey-bug % npm run dev

> bug-repro@0.0.1 dev
> node hello_world.js

Development URL detected: [http://localhost:8080/kas]
Development URL detected: [http://localhost:8080/kas]
NetworkError: [http://localhost:8080] [PublicKey] Invalid Platform Configuration: [http://localhost:8080/kas] is missing BaseKey in WellKnownConfiguration
    at fetchKasBasePubKey (file:///<*>/opentdf-basekey-bug/node_modules/@opentdf/sdk/dist/web/src/access/access-rpc.js:122:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async fetchKasPubKey (file:///<*>/opentdf-basekey-bug/node_modules/@opentdf/sdk/dist/web/src/access.js:104:16)
    at async NanoTDFClient.encrypt (file:///<*>/opentdf-basekey-bug/node_modules/@opentdf/sdk/dist/web/src/nanoclients.js:72:30)
    at async file:///<*>/opentdf-basekey-bug/hello_world.js:26:20
Development URL detected: [http://localhost:8080/kas]
Ciphertext: Uint8Array(490) [
   76,  49,  76,  16,  18, 108, 111,  99,  97, 108, 104, 111,
  115, 116,  58,  56,  48,  56,  48,  47, 107,  97, 115, 101,
   49,   0,   1,   2,   1, 132, 118, 185, 235, 139,  91,  29,
  101, 143, 195, 254,  81,  67, 225, 205, 234,  39, 124,  17,
   91,  62,   2,   9, 170, 214, 193, 171, 235, 220, 251, 143,
  221, 165, 250, 221,  76,  53,  30, 176, 124, 170,  12, 121,
  177, 100,  81,  87,  41,  20,  20,   9, 169, 136,  60,  60,
   60,  87,   7, 216, 240,  92, 100, 104, 116, 209, 109,  76,
   66, 174, 119, 152,
  ... 390 more items
]
```

## Reproduction Steps

### Set up the local platform

1. Clone https://github.com/opentdf/platform.git

2. Checkout the recommended branch:

    ```bash
    git checkout origin/release/protocol/go/v0.11
    ```

3. Follow the instructions in [Consuming.md](https://github.com/opentdf/platform/blob/release/protocol/go/v0.11/docs/Consuming.md). These commands are provided in [startup.sh](./startup.sh) for convenience.

### Use web-sdk to attempt encryption

1. Run `npm install` from the repo root.
2. Run `npm run dev` to execute the code in [hello_world.js](./hello_world.js).

## Note

This error does not occur when using the [otdfctl](https://www.google.com/search?q=otdfctl&rlz=1C5CHFA_enUS1179US1180&oq=otdfctl&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgYIARBFGDwyBggCEEUYPDIGCAMQRRg80gEHODA4ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8) tool with the following command: `otdfctl encrypt hello.txt --out hello.txt.tdf --host http://localhost:8080 --with-client-creds  '{"clientId": "opentdf", "clientSecret": "secret"}'`