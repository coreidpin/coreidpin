# GidiPIN Python SDK

Official Python SDK for the GidiPIN Platform.

## Installation

```bash
pip install gidipin-python-sdk
```

## Usage

```python
from gidipin import GidiPIN, GidiPINError

# Initialize the client
client = GidiPIN(api_key="your_api_key_here")

# 1. Verify a PIN
try:
    result = client.verify("123456")
    if result.get("valid"):
        print("Professional:", result.get("professional"))
except GidiPINError as e:
    print(f"Error: {e}")

# 2. Instant Sign-In Flow
def handle_signin():
    # Step 1: Initiate
    init_data = client.initiate_signin(
        pin="123456",
        redirect_uri="https://yourapp.com/callback",
        state="xyz123"
    )
    
    consent_url = init_data["consent_url"]
    # Redirect user to consent_url...
    
    # Step 2: Exchange Code (on callback)
    auth_data = client.exchange_code("auth_code_from_callback")
    
    token = auth_data["access_token"]
    user = auth_data["professional"]
    print(f"Logged in user: {user['name']}")
```
