# Basekey Misconfiguration Bug

[This project](https://github.com/nibsbin/opentdf-basekey-bug) contains a minimal reproduction of a potential bug regarding the documented code in the [opentdf/web-sdk](https://github.com/opentdf/web-sdk/blob/49798854abf0663b2c29848adc2ca3cba3eddf67/README.md).

When calling `NanoTDFClient.encrypt()`, I encountered a `NetworkError` indicating that the KAS is misconfigured due to a missing `BaseKey` in the `WellKnownConfiguration`. Interestingly, Ciphertext still returns a value.

```log
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

The following log on the platform occurs when the client script executes:

```log
time=2025-09-23T23:55:21.542-04:00 level=DEBUG msg="wellknown configuration contents" namespace=wellknown config="map[base_key:map[] health:map[endpoint:/healthz] idp:map[authorization_endpoint:http://localhost:8888/auth/realms/opentdf/protocol/openid-connect/auth id_token_signing_alg_values_supported:[PS384 RS384 EdDSA ES384 HS256 HS512 ES256 RS256 HS384 ES512 PS256 PS512 RS512] issuer:http://localhost:8888/auth/realms/opentdf jwks_uri:http://localhost:8888/auth/realms/opentdf/protocol/openid-connect/certs require_request_uri_registration:true response_types_supported:[code none id_token token id_token token code id_token code token code id_token token] subject_types_supported:[public pairwise] token_endpoint:http://localhost:8888/auth/realms/opentdf/protocol/openid-connect/token userinfo_endpoint:http://localhost:8888/auth/realms/opentdf/protocol/openid-connect/userinfo] key_managers:map[] platform_issuer:http://localhost:8888/auth/realms/opentdf]"
```

## Specs

- Docker Desktop: 4.46.0 (204649)
- OS: Tahoe 26.0
- go: 1.25.1 darwin/arm64
- opentdf/platform: commit [`6f575b2`](https://github.com/opentdf/platform/tree/6f575b2e9f9001b177cdca3a68fc88513cb85f01) (release/protocol/go/v0.11)
- opentdf/web-sdk: 0.4.0 [from npm](https://www.npmjs.com/package/@opentdf/sdk)

## Reproduction Steps

### Set up the local platform

1. Clone and checkout the correct release branch of the platform repo:

    ```bash
    git clone https://github.com/opentdf/platform.git platform.issue734
    cd platform.issue734
    git checkout protocol/go/v0.11.0
    ```

2. Follow the instructions in [Consuming.md](https://github.com/opentdf/platform/blob/release/protocol/go/v0.11/docs/Consuming.md). These commands are provided in [startup.sh](https://github.com/nibsbin/opentdf-basekey-bug/blob/main/startup.sh) for convenience.

### Use web-sdk to attempt encryption

1. Run `npm install` from the repo root.
2. Run `npm run dev` to execute the code in [hello_world.js](https://github.com/nibsbin/opentdf-basekey-bug/blob/main/hello_world.js).

## Notes

This error does not occur when using the [otdfctl](https://www.google.com/search?q=otdfctl&rlz=1C5CHFA_enUS1179US1180&oq=otdfctl&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgYIARBFGDwyBggCEEUYPDIGCAMQRRg80gEHODA4ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8) tool with the following command: `otdfctl encrypt hello.txt --out hello.txt.tdf --host http://localhost:8080 --with-client-creds  '{"clientId": "opentdf", "clientSecret": "secret"}'`

Full platform logs are included in [platform.log](https://github.com/nibsbin/opentdf-basekey-bug/blob/main/platform.log).

## Attachments
- [opentdf.yaml](https://github.com/nibsbin/opentdf-basekey-bug/blob/main/opentdf.yaml)
- [hello_world.js](https://github.com/nibsbin/opentdf-basekey-bug/blob/main/hello_world.js)
- [startup.sh](https://github.com/nibsbin/opentdf-basekey-bug/blob/main/startup.sh)
- [platform.log](https://github.com/nibsbin/opentdf-basekey-bug/blob/main/platform.log)
- [Consuming.md](https://github.com/opentdf/platform/blob/release/protocol/go/v0.11/docs/Consuming.md)