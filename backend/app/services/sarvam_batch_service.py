import requests
import aiofiles
import asyncio
import os
import json
from typing import Optional
from azure.storage.blob import BlobClient, ContainerClient, ContentSettings
from urllib.parse import urlparse, parse_qs
import mimetypes

class SarvamBatchService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {"API-Subscription-Key": self.api_key}

    def initialize_job(self) -> Optional[dict]:
        url = "https://api.sarvam.ai/speech-to-text/job/init"
        response = requests.post(url, headers=self.headers)
        if response.status_code == 202:
            return response.json()
        return None

    def start_job(self, job_id: str, language_code: str) -> Optional[dict]:
        url = "https://api.sarvam.ai/speech-to-text/job"
        headers = {**self.headers, "Content-Type": "application/json"}
        data = {"job_id": job_id, "job_parameters": {"language_code": language_code}}
        response = requests.post(url, headers=headers, data=json.dumps(data))
        if response.status_code == 200:
            return response.json()
        print(f"Failed to start job: {response.status_code} {response.text}")  # Debug print
        return None

    def check_job_status(self, job_id: str) -> Optional[dict]:
        url = f"https://api.sarvam.ai/speech-to-text/job/{job_id}/status"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            return response.json()
        return None

    def _get_blob_info(self, sas_url: str):
        parsed = urlparse(sas_url)
        account_url = f"{parsed.scheme}://{parsed.netloc}"
        container_name = parsed.path.split('/')[1]
        # Directory path after container
        dir_path = '/'.join(parsed.path.split('/')[2:])
        sas_token = parsed.query
        return account_url, container_name, dir_path, sas_token

    def upload_file_to_azure(self, input_storage_path: str, local_file_path: str):
        account_url, container_name, dir_path, sas_token = self._get_blob_info(input_storage_path)
        # The dir_path is the directory, we need to upload to dir_path/filename
        filename = os.path.basename(local_file_path)
        blob_path = f"{dir_path}/{filename}" if dir_path else filename
        blob = BlobClient(account_url=account_url, container_name=container_name, blob_name=blob_path, credential=sas_token)
        # Guess the MIME type
        mime_type, _ = mimetypes.guess_type(filename)
        if not mime_type:
            mime_type = "application/octet-stream"
        with open(local_file_path, "rb") as data:
            blob.upload_blob(
                data,
                overwrite=True,
                content_settings=ContentSettings(content_type=mime_type)
            )
        print(f"✅ Uploaded {filename} to Azure Blob Storage at {blob_path} with content type {mime_type}")

    def list_blobs(self, output_storage_path: str):
        account_url, container_name, dir_path, sas_token = self._get_blob_info(output_storage_path)
        container = ContainerClient(account_url=account_url, container_name=container_name, credential=sas_token)
        blob_list = container.list_blobs(name_starts_with=dir_path)
        return [blob.name for blob in blob_list]

    def download_result_json(self, output_storage_path: str, destination_dir: str) -> Optional[str]:
        account_url, container_name, dir_path, sas_token = self._get_blob_info(output_storage_path)
        container = ContainerClient(account_url=account_url, container_name=container_name, credential=sas_token)
        blobs = list(container.list_blobs(name_starts_with=dir_path))
        json_blob = next((b for b in blobs if b.name.endswith('.json')), None)
        if not json_blob:
            print("No result JSON found in output storage.")
            return None
        blob_client = container.get_blob_client(json_blob.name)
        os.makedirs(destination_dir, exist_ok=True)
        local_path = os.path.join(destination_dir, os.path.basename(json_blob.name))
        with open(local_path, "wb") as f:
            data = blob_client.download_blob().readall()
            f.write(data)
        print(f"✅ Downloaded result JSON to {local_path}")
        return local_path

    async def batch_transcribe(self, local_file_path: str, language_code: str = "ta-IN", destination_dir: str = "downloads", diarization: bool = False) -> Optional[tuple]:
        # Step 1: Initialize the job
        job_info = self.initialize_job()
        if not job_info:
            print("Job initialization failed")
            return None, None
        job_id = job_info["job_id"]
        input_storage_path = job_info["input_storage_path"]
        output_storage_path = job_info["output_storage_path"]

        # Step 2: Upload file to Azure
        self.upload_file_to_azure(input_storage_path, local_file_path)
        print("File upload step complete. Waiting before starting job...")
        await asyncio.sleep(5)  # Wait 5 seconds to ensure file is available

        # Step 3: Start the job
        job_parameters = {"language_code": language_code}
        if diarization:
            job_parameters["with_diarization"] = "true"
        job_start_response = self.start_job_with_params(job_id, job_parameters)
        if not job_start_response:
            print("Failed to start job (see above for details)")
            return None, None

        # Step 4: Poll for job status
        print("Polling for job status...")
        while True:
            job_status = self.check_job_status(job_id)
            if not job_status:
                print("Failed to get job status")
                return None, None
            status = job_status["job_state"]
            if status == "Completed":
                print("Job completed successfully!")
                break
            elif status == "Failed":
                print("Job failed!")
                return None, None
            else:
                print(f"Current status: {status}")
                await asyncio.sleep(10)

        # Step 5: Download results from Azure
        result_json_path = self.download_result_json(output_storage_path, destination_dir)
        if not result_json_path:
            print("No result JSON found.")
            return None, None
        # Step 6: Extract transcript and diarized_transcript
        with open(result_json_path, "r", encoding="utf-8") as f:
            result_data = json.load(f)
        transcript = result_data.get("transcript") or result_data.get("text") or str(result_data)
        diarized_transcript = result_data.get("diarized_transcript")
        print(f"Transcript: {transcript[:200]}..." if transcript else "No transcript found.")
        return transcript, diarized_transcript

    def start_job_with_params(self, job_id: str, job_parameters: dict) -> Optional[dict]:
        url = "https://api.sarvam.ai/speech-to-text/job"
        headers = {**self.headers, "Content-Type": "application/json"}
        data = {"job_id": job_id, "job_parameters": job_parameters}
        response = requests.post(url, headers=headers, data=json.dumps(data))
        if response.status_code == 200:
            return response.json()
        print(f"Failed to start job: {response.status_code} {response.text}")  # Debug print
        return None 