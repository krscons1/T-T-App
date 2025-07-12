#!/usr/bin/env python3
"""
Test script for Sarvam API connectivity and configuration
"""

import os
import sys
import requests

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_sarvam_config():
    """Test Sarvam configuration"""
    print("🔍 Testing Sarvam configuration...")
    
    try:
        from app.core.config import settings
        
        print(f"🔑 SARVAM_API_KEY: {'Set' if settings.SARVAM_API_KEY else 'NOT SET'}")
        if settings.SARVAM_API_KEY:
            print(f"🔑 API Key preview: {settings.SARVAM_API_KEY[:10]}...")
        else:
            print("❌ Please set SARVAM_API_KEY in your environment or .env file")
            return False
            
        print(f"🌐 SARVAM_BASE_URL: {settings.SARVAM_BASE_URL}")
        return True
        
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def test_sarvam_api_connectivity():
    """Test basic Sarvam API connectivity"""
    print("\n🔍 Testing Sarvam API connectivity...")
    
    try:
        from app.core.config import settings
        
        if not settings.SARVAM_API_KEY:
            print("❌ No API key available")
            return False
        
        # Test basic API call
        url = "https://api.sarvam.ai/speech-to-text/job/init"
        headers = {"API-Subscription-Key": settings.SARVAM_API_KEY}
        
        print(f"🌐 Testing connection to: {url}")
        response = requests.post(url, headers=headers, timeout=10)
        
        print(f"📡 Response status: {response.status_code}")
        print(f"📡 Response headers: {dict(response.headers)}")
        
        if response.status_code == 202:
            print("✅ API connectivity successful")
            result = response.json()
            print(f"✅ Job initialization successful: {result}")
            return True
        else:
            print(f"❌ API connectivity failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API connectivity error: {e}")
        return False

def test_batch_service():
    """Test the batch service"""
    print("\n🔍 Testing batch service...")
    
    try:
        from app.services.sarvam_batch_service import SarvamBatchService
        from app.core.config import settings
        
        if not settings.SARVAM_API_KEY:
            print("❌ No API key available")
            return False
        
        service = SarvamBatchService(settings.SARVAM_API_KEY)
        
        # Test job initialization
        job_info = service.initialize_job()
        if job_info:
            print(f"✅ Job initialization successful: {job_info}")
            return True
        else:
            print("❌ Job initialization failed")
            return False
            
    except Exception as e:
        print(f"❌ Batch service error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Sarvam API tests...")
    
    # Test 1: Configuration
    config_ok = test_sarvam_config()
    
    if not config_ok:
        print("\n❌ Configuration test failed. Please check your .env file or environment variables.")
        print("Create a .env file with:")
        print("SARVAM_API_KEY=your_api_key_here")
        return
    
    # Test 2: API connectivity
    api_ok = test_sarvam_api_connectivity()
    
    if not api_ok:
        print("\n❌ API connectivity test failed. Please check:")
        print("1. Your internet connection")
        print("2. Your API key is valid")
        print("3. The Sarvam API is accessible")
        return
    
    # Test 3: Batch service
    batch_ok = test_batch_service()
    
    if batch_ok:
        print("\n✅ All tests passed! Sarvam API is working correctly.")
    else:
        print("\n❌ Batch service test failed. This might be due to:")
        print("1. Invalid API key")
        print("2. API rate limits")
        print("3. Service availability issues")

if __name__ == "__main__":
    main() 