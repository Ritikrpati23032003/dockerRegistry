const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const privateKeyPath = path.join(__dirname, '../certs/auth.key');
const privateKey = fs.readFileSync(privateKeyPath);

// Generate a random Key ID (kid) or use a static one. Registry 2.0 requires a kid header 
// that matches the public key libtrust fingerprint, but often for simple setups we can just sign.
// However, proper implementation usually requires calculating the kid from the key.
// For self-signed simplicity, we'll try standard signing first. If Registry complains about kid, we'll need to compute it.
// Standard `jsonwebtoken` allows setting header.
// To generate a valid libtrust fingerprint (kid), we would need `libtrust` equivalent or `base32(sha256(der))`.
// Let's rely on standard x509 mounting in registry side which usually matches simply by public key if only one is present?
// Actually, Registry requires the `kid` in the token header to match the `kid` of the public key it loaded.
// If we execute `openssl x509 -in auth.cert -noout -pubkey | openssl pkey -pubin -outform DER | openssl dgst -sha256 -binary | base32` (roughly) we get the KID.
// A simpler way for this task: The registry loads the bundle.
// Let's implement signing without explicit KID first. If it fails, we know why.

const signToken = (account, access) => {
    const payload = {
        iss: 'my-auth-server',
        sub: account,
        aud: 'registry',
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
        nbf: Math.floor(Date.now() / 1000) - 10,
        iat: Math.floor(Date.now() / 1000),
        jti: uuidv4(),
        access: access
    };

    const signOptions = {
        algorithm: 'RS256',
        header: { kid: 'G3NL:FTVA:P6Z6:M277:EAKC:TU5U:SZYT:QXQO:PNOE:C4YH:3KGY:4VCV' }
    };

    return jwt.sign(payload, privateKey, signOptions);
};

module.exports = { signToken };
