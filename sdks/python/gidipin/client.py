import requests
from typing import Optional, List, Dict, Any

class GidiPINError(Exception):
    def __init__(self, message: str, code: str = None):
        super().__init__(message)
        self.code = code

class GidiPIN:
    def __init__(self, api_key: str, base_url: str = "https://api.gidipin.com/api/v1"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        })

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            error_data = {}
            try:
                error_data = e.response.json()
            except:
                pass
            
            message = error_data.get("error") or str(e)
            code = error_data.get("error_code")
            raise GidiPINError(message, code)
        except requests.exceptions.RequestException as e:
            raise GidiPINError(f"Request failed: {str(e)}")

    def verify(self, pin: str) -> Dict[str, Any]:
        """
        Verify a professional PIN/Phone Number
        """
        return self._request("POST", "/verify", json={"pin": pin})

    def get_professional(self, pin: str) -> Dict[str, Any]:
        """
        Get public details of a professional
        """
        return self._request("GET", f"/professional/{pin}")

    def initiate_signin(self, pin: str, redirect_uri: str, state: str = None, scopes: List[str] = None) -> Dict[str, Any]:
        """
        Initiate the Instant Sign-In flow
        """
        payload = {
            "pin": pin,
            "redirect_uri": redirect_uri
        }
        if state:
            payload["state"] = state
        if scopes:
            payload["scopes"] = scopes
            
        return self._request("POST", "/signin/initiate", json=payload)

    def exchange_code(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token
        """
        return self._request("POST", "/signin/exchange", json={"code": code})
