# GidiPIN Node.js SDK

Official Node.js SDK for the GidiPIN Platform.

## Installation

```bash
npm install @gidipin/node-sdk
```

## Usage

```typescript
import { GidiPIN } from '@gidipin/node-sdk';

// Initialize the client
const client = new GidiPIN({
    apiKey: 'your_api_key_here'
});

// 1. Verify a PIN
async function checkPin() {
    const result = await client.verify('123456');
    if (result.valid) {
        console.log('Professional:', result.professional);
    }
}

// 2. Instant Sign-In Flow
async function handleSignIn() {
    // Step 1: Initiate
    const { consent_url } = await client.initiateSignIn({
        pin: '123456',
        redirect_uri: 'https://yourapp.com/callback',
        state: 'xyz123'
    });
    
    // Redirect user to consent_url...
    
    // Step 2: Exchange Code (on callback)
    const { access_token, professional } = await client.exchangeCode({
        code: 'auth_code_from_callback'
    });
    
    console.log('Logged in user:', professional.name);
}
```
