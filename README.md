# Video Preloader App

A React application that efficiently preloads and plays videos with a clean, modern UI built using TypeScript, React Router, Context API, and Tailwind CSS.

![Video Preloader App Screenshot](https://via.placeholder.com/800x450)

## Features

- 📱 Mobile-first responsive design
- 🔄 Efficient video preloading with progress tracking
- 🧭 React Router for seamless navigation
- 🌐 Context API for global state management

## Project Structure

```
video-preloader-app/
├── public/
├── src/
│   ├── context/
│   │   └── VideoContext.tsx    # Global video state and loading logic
│   ├── pages/
│   │   ├── Landing.tsx         # Initial page with loading interface
│   │   └── Player.tsx          # Video player page
│   ├── App.tsx                 # Main app component with routing
│   ├── index.tsx               # Entry point
│   ├── index.css               # Global styles and Tailwind imports
│   └── types.ts                # TypeScript interfaces
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## How It Works

### Video Loading and Management

The application uses a centralized Context API approach to manage video loading and playback state:

1. **Video Context Provider**: Manages the application's video state including:

   - List of videos with their loading status
   - Current video index
   - Overall loading progress
   - Methods to control loading and playback

2. **Video Preloading**:

   - Videos are preloaded in parallel using HTML5 Video elements
   - Loading progress is tracked and displayed to the user
   - AbortController API is used to properly abort fetch operations

3. **Loading Feedback**:
   - Visual progress bar shows loading percentage
   - Loading state prevents navigation to player until videos are ready

### User Interface

The app consists of two main pages:

1. **Landing Page**:

   - Displays a welcome screen with a start button
   - Shows loading progress during video preloading
   - Automatically navigates to player when loading completes

2. **Player Page**:
   - Displays the current video with playback controls
   - Provides navigation between videos (previous/next)
   - Shows current position in the video playlist
   - Supports keyboard navigation (left/right arrows)

### Routing and Navigation

React Router manages navigation between pages:

- `/` - Landing page for starting the process
- `/player` - Video player interface
- Route guards prevent accessing the player before videos are loaded

## Technical Implementation Details

### Video Preloading Mechanism

The video preloading system:

1. Creates multiple HTML5 Video elements in memory
2. Sets them to preload mode
3. Attaches event listeners to track loading progress
4. Uses both 'canplaythrough' and 'loadeddata' events for reliable loading detection
5. Implements abort capabilities to cancel loading

### State Management with Context API

The application uses React's Context API to:

1. Share video state across components
2. Prevent prop drilling
3. Centralize loading and playback logic

### Responsive Design with Tailwind CSS

The UI is built with Tailwind CSS for:

1. Mobile-first approach
2. Consistent styling
3. Rapid development
4. Easy customization

## Getting Started

### Prerequisites

- Node.js 20+ and yarn

### Installation

1. Install dependencies:

```bash
yarn install
```

2. Start the development server:

```bash
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Building for Production

```bash
yarn build
```
