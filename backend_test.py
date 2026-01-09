#!/usr/bin/env python3
"""
Backend API Testing for Health Records Blockchain Application
Tests all API endpoints and blockchain functionality
"""

import requests
import sys
import json
from datetime import datetime
import time

class HealthRecordsAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_record_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, timeout=10)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if 'success' in response_data:
                        print(f"   Success: {response_data['success']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoint"""
        return self.run_test("Health Check", "GET", "", 200)

    def test_api_health(self):
        """Test API health endpoint"""
        return self.run_test("API Health Check", "GET", "api/health", 200)

    def test_get_records_empty(self):
        """Test getting records (may be empty initially)"""
        success, data = self.run_test("Get All Records", "GET", "api/records", 200)
        if success and 'records' in data:
            print(f"   Found {len(data['records'])} existing records")
        return success, data

    def test_blockchain_stats(self):
        """Test blockchain statistics endpoint"""
        success, data = self.run_test("Blockchain Stats", "GET", "api/blockchain/stats", 200)
        if success and 'stats' in data:
            stats = data['stats']
            print(f"   Total blocks: {stats.get('total_blocks', 'N/A')}")
            print(f"   Total records: {stats.get('total_records', 'N/A')}")
            print(f"   Latest block hash: {stats.get('latest_block_hash', 'N/A')[:16]}...")
        return success, data

    def test_create_health_record(self):
        """Test creating a new health record"""
        test_record = {
            "type": "checkup",
            "title": "Automated Test Record",
            "description": "Testing blockchain health record creation",
            "date": "2026-01-10",
            "doctor": "Dr. Automation",
            "metadata": {
                "weight": "75",
                "height": "180",
                "bloodPressure": "120/80",
                "heartRate": "72",
                "notes": "Test notes for blockchain verification"
            }
        }
        
        success, data = self.run_test("Create Health Record", "POST", "api/records", 200, test_record)
        
        if success and 'record' in data:
            record = data['record']
            self.created_record_id = record.get('id')
            print(f"   Created record ID: {self.created_record_id}")
            print(f"   Blockchain hash: {record.get('blockchain_hash', 'N/A')[:16]}...")
            print(f"   Blockchain index: {record.get('blockchain_index', 'N/A')}")
            
            # Verify blockchain proof
            if 'blockchain_proof' in data:
                proof = data['blockchain_proof']
                print(f"   Blockchain proof - Block #{proof.get('index')}")
                hash_val = proof.get('hash', '')
                if hash_val.startswith('00'):
                    print(f"   ✅ Proof-of-work hash verified (starts with '00')")
                else:
                    print(f"   ⚠️  Hash doesn't show proof-of-work: {hash_val[:16]}...")
        
        return success, data

    def test_get_specific_record(self):
        """Test getting a specific record by ID"""
        if not self.created_record_id:
            print("⚠️  Skipping - No record ID available")
            return True, {}
        
        return self.run_test("Get Specific Record", "GET", f"api/records/{self.created_record_id}", 200)

    def test_verify_record(self):
        """Test blockchain verification of a record"""
        if not self.created_record_id:
            print("⚠️  Skipping - No record ID available")
            return True, {}
        
        success, data = self.run_test("Verify Record", "GET", f"api/blockchain/verify/{self.created_record_id}", 200)
        
        if success and 'verified' in data:
            verified = data['verified']
            print(f"   Verification result: {'✅ VERIFIED' if verified else '❌ NOT VERIFIED'}")
            if 'blockchain_hash' in data:
                print(f"   Blockchain hash: {data['blockchain_hash'][:16]}...")
        
        return success, data

    def test_file_upload(self):
        """Test file upload functionality"""
        # Create a small test file
        test_content = b"This is a test file for health record attachment"
        files = {'file': ('test_document.txt', test_content, 'text/plain')}
        
        success, data = self.run_test("File Upload", "POST", "api/upload", 200, files=files)
        
        if success:
            print(f"   File name: {data.get('file_name', 'N/A')}")
            print(f"   File size: {data.get('file_size', 'N/A')} bytes")
            print(f"   File hash: {data.get('file_hash', 'N/A')[:16]}...")
        
        return success, data

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Health Records Blockchain API Tests")
        print("=" * 60)
        
        # Basic connectivity tests
        self.test_health_check()
        self.test_api_health()
        
        # Data retrieval tests
        self.test_get_records_empty()
        self.test_blockchain_stats()
        
        # File upload test
        self.test_file_upload()
        
        # Record creation and verification tests
        self.test_create_health_record()
        
        # Wait a moment for blockchain processing
        time.sleep(1)
        
        self.test_get_specific_record()
        self.test_verify_record()
        
        # Final blockchain stats
        print(f"\n📊 Final blockchain status:")
        self.test_blockchain_stats()
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed.")
            return 1

def main():
    """Main test execution"""
    tester = HealthRecordsAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())