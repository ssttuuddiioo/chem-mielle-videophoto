# Photo Booth App

A modern web application for taking videos and photo strips using your device's camera.

## Features

- 📹 Video Recording
  - Live camera preview
  - 3-2-1 countdown before recording
  - Video review and download
  - Share via email or QR code

- 📷 Photo Strip
  - Take 4 photos in sequence
  - 3-2-1 countdown between photos
  - Photo strip preview
  - Download or share your strip

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd photo-booth
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. On the home screen, choose between "Take a Video" or "Photo Strip"
2. Follow the on-screen instructions
3. Review your content
4. Download or share your creation

## Development

- Built with React + TypeScript
- Styled with Tailwind CSS
- Uses react-webcam for camera functionality
- React Router for navigation
- Headless UI for accessible components

## License

MIT
