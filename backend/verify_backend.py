
import requests
import time
import os
import sys

BASE_URL = "http://localhost:8000/api/v1"
VIDEO_PATH = "test_video.mp4"

def create_dummy_video():
    """Create a small dummy MP4 file if it doesn't exist."""
    if not os.path.exists(VIDEO_PATH):
        print(f"Creating dummy video file: {VIDEO_PATH}")
        with open(VIDEO_PATH, "wb") as f:
            f.write(os.urandom(1024 * 1024)) # 1MB dummy file

def test_backend_flow():
    print("=== Starting Backend Verification Flow ===")
    
    # Check Health
    try:
        resp = requests.get("http://localhost:8000/health")
        if resp.status_code == 200:
            print(f"✅ Health Check Passed: {resp.json()}")
        else:
            print(f"❌ Health Check Failed: {resp.status_code}")
            return
    except Exception as e:
        print(f"❌ Transformation Service not running? {e}")
        return

    create_dummy_video()

    # 1. Upload Video
    print("\n--- 1. Testing Upload ---")
    files = {'file': ('test_video.mp4', open(VIDEO_PATH, 'rb'), 'video/mp4')}
    resp = requests.post(f"{BASE_URL}/upload", files=files)
    
    if resp.status_code != 201:
        print(f"❌ Upload Failed: {resp.text}")
        return
    
    upload_data = resp.json()
    video_id = upload_data["video_id"]
    print(f"✅ Upload Success. Video ID: {video_id}")
    
    # 2. Start Clipper Job
    print("\n--- 2. Testing Clipper Job Start ---")
    payload = {
        "video_id": video_id,
        "config": {
            "include_actions": ["GOL"],
            "export_format": "mp4"
        }
    }
    resp = requests.post(f"{BASE_URL}/clipper/start", json=payload)
    
    if resp.status_code != 202:
        print(f"❌ Clipper Start Failed: {resp.text}")
        return
        
    job_data = resp.json()
    job_id = job_data["job_id"]
    print(f"✅ Clipper Job Started. Job ID: {job_id}")
    
    # 3. Poll Job Status
    print("\n--- 3. Polling Job Status (Mock Mode) ---")
    max_retries = 30
    for i in range(max_retries):
        resp = requests.get(f"{BASE_URL}/clipper/jobs/{job_id}")
        data = resp.json()
        status = data["status"]
        progress = data["progress_percentage"]
        
        print(f"   [{i+1}/{max_retries}] Status: {status}, Progress: {progress}%", end='\r')
        
        if status == "COMPLETED":
            print(f"\n✅ Job Completed!")
            break
        elif status == "ERROR":
            print(f"\n❌ Job Failed: {data.get('error')}")
            return
            
        time.sleep(1)
    else:
        print("\n❌ Timeout waiting for job completion")
        return

    # 4. Cleanup
    try:
        os.remove(VIDEO_PATH)
        print("\n✅ Verification Flow Completed Successfully")
    except:
        pass

if __name__ == "__main__":
    time.sleep(2) # Give server time to start
    test_backend_flow()
