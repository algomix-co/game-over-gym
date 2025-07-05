# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fitness game called "Game Over Gym" that combines a Flappy Bird-style game with push-up detection using computer vision. Players perform push-ups in front of their webcam to control a bird in the game, creating an interactive workout experience.

## Architecture

### Core Technologies
- **MediaPipe Pose**: Computer vision library for pose detection and push-up recognition
- **HTML5 Canvas**: Game rendering and webcam overlay for pose visualization
- **WebRTC**: Camera access for real-time pose detection
- **Vanilla JavaScript**: No framework dependencies, pure JS implementation

### Key Components

#### Pose Detection System (`game.js:30-145`)
- Uses MediaPipe Pose for real-time body pose estimation
- Detects push-up movements by analyzing nose-to-shoulder relative positioning
- Threshold-based detection system (`pushupThreshold = 0.3`)
- Visual feedback through pose landmark overlay on webcam feed

#### Game Engine (`game.js:182-414`)
- Physics-based bird movement with gravity and flap mechanics
- Procedural pipe generation system with collision detection
- Progressive difficulty scaling (speed increases every 10 points)
- Game state management (start, running, game over)

#### UI/UX System
- Real-time stats tracking (score, push-ups, level, speed)
- Position indicator for push-up guidance
- Responsive design with mobile support
- Modern glassmorphism design aesthetic

## File Structure

- `index.html`: Main application layout and UI structure
- `game.js`: Complete game logic, pose detection, and canvas rendering
- `styles.css`: Modern UI styling with animations and responsive design
- `README.md`: Currently empty

## Development Commands

**Note**: This project has no build system, package.json, or dependency management. It's a client-side-only application that runs directly in the browser.

### Running the Application
- Open `index.html` directly in a modern web browser
- **IMPORTANT**: Camera access requires HTTPS or localhost due to browser security
  - For local development: Use `http://localhost` or a local web server
  - For production: Must be served over HTTPS
  - Direct file:// URLs will NOT work for camera access
- Chrome/Firefox recommended for MediaPipe compatibility
- To run locally with camera access:
  ```bash
  # Python 3
  python -m http.server 8000
  # Then navigate to http://localhost:8000
  
  # Or use Node.js
  npx http-server -p 8000
  # Then navigate to http://localhost:8000
  ```

### Testing
- No automated testing framework is configured
- Manual testing required through browser interaction
- Camera permission required for full functionality

## Key Configuration

### Game Physics (`game.js:11-28`)
- Bird properties: position, velocity, radius, flap power
- Pipe spacing and gap configuration
- Game speed progression system

### Pose Detection Settings (`game.js:40-45`)
- Model complexity: 1 (balanced performance/accuracy)
- Detection confidence: 0.5
- Tracking confidence: 0.5
- Landmark smoothing enabled

### Push-up Detection Logic (`game.js:105-145`)
- Uses nose-to-shoulder relative positioning
- Threshold-based state detection (up/down positions)
- Flap trigger on down-to-up transitions during gameplay

## External Dependencies

All dependencies are loaded via CDN:
- `@mediapipe/pose`: Core pose detection library
- `@mediapipe/camera_utils`: Camera handling utilities

## Browser Compatibility

- Requires modern browser with WebRTC support
- Camera access permission required
- WebGL support recommended for optimal MediaPipe performance

## Self-Improvement Guidelines

- Any important instruction should be added to CLAUDE.md file to self-improve on every instruction
- Continuously update this file with new insights, best practices, and coding guidelines
- Maintain a clear, concise, and structured approach to documentation
- Ensure all critical knowledge is captured and easily accessible