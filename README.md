# Game Over Gym =�

**Turn Your Laziness Into Fitness!**

A revolutionary fitness gamification web application that combines computer vision-powered exercise detection with engaging game mechanics to make working out fun and interactive.

![Game Over Gym](https://img.shields.io/badge/Fitness-Gaming-brightgreen) ![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose%20Detection-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## <� How to Play

### Quick Start
1. **Start the server** (required for camera access)
2. **Grant camera permissions** when prompted
3. **Select your exercise** and difficulty level
4. **Position yourself** in front of the camera
5. **Follow the color-coded obstacles** by performing exercises!

---

## =� Setup Instructions

### Prerequisites
- Modern web browser (Chrome/Firefox recommended)
- Webcam access
- Internet connection (for MediaPipe libraries)

### Running the Game

**� IMPORTANT**: The game requires a local server to access your camera. File:// URLs will NOT work.

#### Option 1: Python (Recommended)
```bash
# Navigate to the game directory
cd Game-Over-Gym

# Start the server
python -m http.server 8000

# Open your browser and go to:
# http://localhost:8000
```

#### Option 2: Node.js
```bash
# Navigate to the game directory
cd Game-Over-Gym

# Start the server
npx http-server -p 8000

# Open your browser and go to:
# http://localhost:8000
```

---

## <� Game Instructions

### Exercise Selection
Choose from **6 different exercises**:

| Exercise | Icon | Focus Area | Beginner | Intermediate | Advanced |
|----------|------|------------|----------|--------------|----------|
| **Push-ups** | =� | Upper Body | 5 reps | 10 reps | 20 reps |
| **Squats** | >� | Lower Body | 8 reps | 15 reps | 25 reps |
| **Jumping Jacks** | >8 | Cardio | 10 reps | 20 reps | 40 reps |
| **Lunges** | =� | Legs | 6 reps | 12 reps | 20 reps |
| **Plank Hold** | <� | Core | 30s | 60s | 120s |
| **Random Fun** | <� | Mixed | 15 reps | 25 reps | 40 reps |

### Difficulty Levels

#### =� Beginner
- **Larger gaps** in obstacles (easier to navigate)
- **Slower speed** for comfortable pacing
- **More time** between obstacles
- **Perfect for**: New to fitness or the game

#### =� Intermediate (Default)
- **Normal gap sizes** and speeds
- **Balanced challenge** for regular exercisers
- **Perfect for**: General fitness enthusiasts

#### =4 Advanced
- **Smaller gaps** requiring precise movement
- **Faster obstacles** for intense workouts
- **Tight timing** between exercises
- **Perfect for**: Fitness experts and gamers

---

## <� Gameplay Mechanics

### Camera Setup
1. **Position yourself** 3-4 feet from your camera
2. **Ensure good lighting** for best pose detection
3. **Face the camera** directly for optimal tracking
4. **Wait for the green detection box** around your face

### How Movement Works
- **Your face controls the bird** - the bird follows your head movement
- **Exercise movements trigger actions** - different exercises control the bird differently
- **Color-coded obstacles** guide your workout:

### Color-Coded Obstacle System

#### =� Green Pipes (High Gaps)
- **Action**: Stay in **UP position**
- **Push-ups**: Stay in plank position (arms extended)
- **Squats**: Stand up tall
- **Message**: "STAY UP for green gaps!"

#### =4 Red Pipes (Low Gaps)  
- **Action**: Go to **DOWN position**
- **Push-ups**: Lower your chest down
- **Squats**: Squat down low
- **Message**: "GO DOWN for red gaps!"

#### =5 Blue Pipes (Middle Gaps)
- **Action**: **Transition** between movements
- **Push-ups**: Mid-range position
- **Squats**: Partial squat
- **Message**: "TRANSITION through blue gaps!"

### Exercise-Specific Instructions

#### =� Push-ups
- **Up Position**: Arms extended, plank position � fly through green gaps
- **Down Position**: Chest lowered, bottom of push-up � fly through red gaps
- **Rep Count**: Complete up � down � up cycle
- **Tip**: Hold each position for 1-2 seconds for best detection

#### >� Squats  
- **Standing**: Upright position � fly through green gaps
- **Squatting**: Knees bent, low position � fly through red gaps
- **Rep Count**: Complete stand � squat � stand cycle
- **Tip**: Go low enough for your hips to be below your knees

#### >8 Jumping Jacks
- **Arms/Legs Spread**: Jump position � navigate through various gaps
- **Arms/Legs Together**: Starting position � adjust height
- **Rep Count**: Complete together � spread � together cycle
- **Tip**: Make explosive movements for better detection

#### =� Lunges
- **Standing**: Upright position � fly through green gaps
- **Lunging**: One leg forward, knee bent � fly through red gaps  
- **Rep Count**: Complete stand � lunge � stand cycle (alternate legs)
- **Tip**: Step forward into a deep lunge position

#### <� Plank Hold
- **Hold Position**: Straight body alignment � fly through middle gaps
- **Time Count**: Seconds held in proper plank position
- **Tip**: Keep your body straight from head to heels

---

## =� Scoring & Progress

### Stats Panel
Monitor your performance with real-time stats:

- **Current Reps**: Your progress toward the target
- **Target Reps**: Goal based on exercise and difficulty
- **Timer**: Elapsed workout time with motivational colors
- **Total Points**: Cumulative points across all workouts
- **Streak**: Consecutive workout counter

### Stage Progression
The game gets progressively challenging as you succeed:

| Stage | Score Needed | Name | Challenge Level |
|-------|--------------|------|-----------------|
| 1 | 0+ | Warm-up | Getting started |
| 2 | 5+ | Building momentum | Slightly faster |
| 3 | 10+ | Finding rhythm | Steady challenge |
| 4 | 20+ | Flow state | In the zone |
| 5 | 30+ | Elite performance | Master level |

### Points System
Earn points based on exercise difficulty and completion:

- **Beginner**: 8-20 points per workout
- **Intermediate**: 20-45 points per workout  
- **Advanced**: 45-90 points per workout
- **Bonus**: Extra points for completing full target reps

---

## <� Tips for Success

### Camera & Setup
-  **Use good lighting** - avoid backlighting
-  **Clear background** works best for pose detection
-  **Stable camera position** - don't move your device
-  **Wear contrasting clothes** to your background

### Exercise Form
-  **Go slow and controlled** - better detection than fast movements
-  **Hold positions briefly** - gives the system time to register
-  **Full range of motion** - complete the entire movement
-  **Face the camera** - side views don't work as well

### Gameplay Strategy
-  **Watch upcoming obstacles** - plan your movement ahead
-  **Follow the color system** - green = up, red = down
-  **Use the rest time** between obstacles to recover
-  **Start with beginner** if you're new to the game

### Troubleshooting
- L **Bird not moving?** Check that your face is detected (green box)
- L **Reps not counting?** Ensure full range of motion and proper form
- L **Camera not working?** Make sure you're using localhost, not file://
- L **Game too fast/slow?** Adjust difficulty level to match your fitness

---

## <� Achievements

Unlock achievements as you progress:

- <� **Consistency Champion**: Complete 5 workouts in a row
- =� **Century Club**: Earn 100+ total points
- P **Overachiever**: Complete 150% of your target reps
- =% **Flow State**: Reach Stage 4 in a single workout
- =Q **Elite Performer**: Reach Stage 5 and maintain it

---

## =� Technical Requirements

### Browser Compatibility
- **Chrome** (recommended) - best MediaPipe support
- **Firefox** - good compatibility
- **Safari** - limited support
- **Edge** - good compatibility

### System Requirements
- **Camera**: Any webcam (built-in or external)
- **Internet**: Required for MediaPipe libraries
- **RAM**: 4GB+ recommended for smooth performance
- **CPU**: Modern processor for real-time pose detection

---

## = Troubleshooting

### Common Issues

**"Camera access denied"**
- Grant camera permissions in your browser
- Make sure no other apps are using your camera
- Try refreshing the page and allowing permissions again

**"MediaPipe not loading"**
- Check your internet connection
- Try refreshing the page
- Ensure you're using a supported browser

**"Exercises not detecting"**
- Ensure good lighting and clear background
- Check that your full body is visible in the camera
- Try adjusting your distance from the camera
- Make sure you're doing full range of motion

**"Game running slowly"**
- Close other browser tabs and applications
- Try lowering the video quality if your browser allows
- Ensure stable internet connection

---

## <� Have Fun!

Game Over Gym is designed to make fitness fun and engaging. Don't worry about perfect form initially - focus on having fun and moving your body. The detection will improve as you get used to the system!

**Remember**: This is a game first, fitness second. Enjoy the experience and celebrate every rep! =�

---

## =� Credits

- **Pose Detection**: Powered by [MediaPipe](https://mediapipe.dev/)
- **Design**: Modern glassmorphism UI
- **Technology**: Pure vanilla JavaScript, HTML5 Canvas
- **Inspiration**: Making fitness accessible and fun for everyone

**Built for the fitness gaming community**