# Video Processing and Conversion Project

## Introduction

This project provides a robust solution for uploading, processing, and converting videos from their original format into HLS format, optimized for streaming. The project is built with a microservice architecture, utilizing Angular for the frontend and NestJS for the backend.

## Architecture

![Hello World]([[https://api.gateway.overate-vntech.com/short/-i2xtG1OD9_XTRyx3ewob](https://lh3.googleusercontent.com/d/1ERgEKw24HLtiV3l8VyiTtm-VziekaRiF)](https://lh3.googleusercontent.com/d/1ERgEKw24HLtiV3l8VyiTtm-VziekaRiF))

## Key Features

- **Fragmented video upload:** The Angular frontend splits videos into chunks for efficient uploading.
- **Video merging and conversion:** The NestJS backend receives the video chunks, merges them, and uses FFmpeg to convert them into HLS format.
- **Video storage:** HLS videos are stored on Object Storage (e.g., Amazon S3, Google Cloud Storage) for easy distribution.
- **Streaming:** Supports smooth streaming of HLS video across multiple devices and platforms.

## Technologies Used

- **Frontend:** Angular, TypeScript, RxJS
- **Backend:** NestJS, TypeScript, FFmpeg
- **Storage:** Object Storage (choose your provider)
- **Other:** Docker (optional)

## Installation and Running

1. **Installation:**

   - Clone the repository: `git clone https://github.com/lkduy2602/Large-File-Uploads.git`
   - Install frontend dependencies: `cd frontend && npm install`
   - Install backend dependencies: `cd backend && npm install`

2. **Configuration:**

   - Update the Object Storage connection details in the backend configuration file.

3. **Running:**
   - Start frontend: `cd frontend && npm start`
   - Start backend: `cd backend && npm start`

## Usage

1. Access the frontend application in your browser.
2. Select a video to upload.
3. Monitor the upload, processing, and conversion progress.
4. Upon completion, you will receive the HLS video URL for embedding in a video player or using for streaming purposes.

## Notes

- Ensure you have FFmpeg installed on your system or within the Docker container.
- Configure the connection to your Object Storage correctly.
