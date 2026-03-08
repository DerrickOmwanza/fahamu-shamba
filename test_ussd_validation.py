#!/usr/bin/env python3
"""
Test USSD Code Validation
Tests that *123# is the only valid USSD code
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000/api/ussd"

def test_invalid_code(code):
    """Test that invalid codes are rejected"""
    payload = {
        "sessionId": f"test-invalid-{code}",
        "phoneNumber": "254712345678",
        "text": "",
        "serviceCode": code
    }
    
    try:
        response = requests.post(BASE_URL, json=payload, timeout=5)
        content = response.text
        
        if "Invalid USSD code" in content or "END" in content:
            return True, content
        else:
            return False, content
    except Exception as e:
        return False, str(e)

def test_valid_code(code):
    """Test that valid codes are accepted"""
    payload = {
        "sessionId": f"test-valid-{code}",
        "phoneNumber": "254712345678",
        "text": "",
        "serviceCode": code
    }
    
    try:
        response = requests.post(BASE_URL, json=payload, timeout=5)
        content = response.text
        
        if "CON" in content or "Choose" in content or "language" in content.lower():
            return True, content
        else:
            return False, content
    except Exception as e:
        return False, str(e)

def main():
    print("\n" + "="*50)
    print("USSD Code Validation Tests")
    print("="*50 + "\n")
    
    # Test 1: Invalid codes should be rejected
    invalid_codes = ["*999#", "*456#", "*111#", "999"]
    print("[TEST GROUP 1] Invalid Codes - Should be REJECTED")
    print("-" * 50)
    
    for code in invalid_codes:
        success, response = test_invalid_code(code)
        status = "[PASS]" if success else "[FAIL]"
        print(f"Code: {code:15} {status}")
        if not success:
            print(f"  Response preview: {response[:100]}...")
    
    print("\n[TEST GROUP 2] Valid Codes - Should be ACCEPTED")
    print("-" * 50)
    
    # Test 2: Valid codes should be accepted
    valid_codes = ["*123#", "123", ""]
    for code in valid_codes:
        success, response = test_valid_code(code)
        status = "[PASS]" if success else "[FAIL]"
        code_display = code if code else "(empty)"
        print(f"Code: {code_display:15} {status}")
        if not success:
            print(f"  Response preview: {response[:100]}...")
    
    print("\n" + "="*50)
    print("Summary:")
    print("- Valid codes: *123#, 123, or empty")
    print("- All other codes are REJECTED")
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
