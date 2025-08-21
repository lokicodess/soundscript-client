# SoundScript - Client-Side 

This directory contains the React frontend application for SoundScript, a web-based tool for audio transcription and summarization.

## Technologies Used

**React**: A JavaScript library for building dynamic user interfaces.

**CSS**: For custom styling, animations, and responsive layout.

**React Icons (react-icons)**: For scalable vector icons, enhancing visual clarity and branding.

## Setup and Installation

Follow these steps to get the SoundScript frontend running on your local machine.

### Navigate to the Client Directory:

```bash
cd mvp/SoundScript/Client/
```

### Install Dependencies:

```bash
npm install # or yarn install
```

If you don't have npm or yarn installed, please install Node.js (which includes npm) or Yarn first.

### Ensure Backend is Running:

The frontend communicates with a backend API (Flask server). Make sure your backend server is running, typically on http://127.0.0.1:5000, before starting the frontend. Refer to the Server/README.md for backend setup instructions.

### Start the Development Server:

```bash
npm start # or yarn start
```

This will open the application in your default web browser, usually at http://localhost:3000.

## Usage

**Select Audio File**: Click the "Choose an audio file" area and select an audio file (e.g., MP3, WAV).

**Transcribe Audio**: Click the "Transcribe Audio" button. The application will send the audio to the backend for transcription. Once complete, the transcribed text will appear.

**Generate Summary**: After the transcription is displayed, click the "Generate Summary" button. The application will send the transcribed text to the backend to create a summary, which will then appear in the summary text area.
