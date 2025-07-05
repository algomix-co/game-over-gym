console.log('Game.js loaded successfully');

let gameCanvas, gameCtx;
let webcamElement, canvasElement, canvasCtx;
let pose;
let gameRunning = false;
let score = 0;
let pushupCount = 0;
let level = 1;
let gameSpeed = 3.5;

// Game variables
let bird = {
    x: 100,
    y: 200,
    velocity: 0,
    radius: 20,
    flapPower: -8
};

let pipes = [];
let pipeGap = 150;
let pipeWidth = 60;
let lastPipeX = 400;

// Stage progression system - evolving challenges based on score
const gameStages = {
    stage1: { minScore: 0, name: "Warm-up", modifier: 1.0, description: "Getting started" },
    stage2: { minScore: 5, name: "Building momentum", modifier: 1.1, description: "Slightly faster pace" },
    stage3: { minScore: 10, name: "Finding rhythm", modifier: 1.2, description: "Steady challenge" },
    stage4: { minScore: 20, name: "Flow state", modifier: 1.3, description: "In the zone" },
    stage5: { minScore: 30, name: "Elite performance", modifier: 1.4, description: "Master level" }
};

function getCurrentStage() {
    for (let i = 5; i >= 1; i--) {
        const stage = gameStages[`stage${i}`];
        if (score >= stage.minScore) {
            return stage;
        }
    }
    return gameStages.stage1;
}

// Timer variables
let gameStartTime = 0;
let gameElapsedTime = 0;


// Difficulty-based exercise timing (in milliseconds)
const exerciseTimings = {
    pushups: {
        beginner: { downHold: 2500, upHold: 2000, transitionTime: 1500 },
        intermediate: { downHold: 2000, upHold: 1500, transitionTime: 1000 },
        advanced: { downHold: 1500, upHold: 1000, transitionTime: 800 }
    },
    squats: {
        beginner: { downHold: 3000, upHold: 2000, transitionTime: 1500 },
        intermediate: { downHold: 2500, upHold: 1500, transitionTime: 1200 },
        advanced: { downHold: 2000, upHold: 1000, transitionTime: 1000 }
    },
    jumpingjacks: {
        beginner: { openHold: 1000, closedHold: 1000, transitionTime: 500 },
        intermediate: { openHold: 800, closedHold: 800, transitionTime: 400 },
        advanced: { openHold: 600, closedHold: 600, transitionTime: 300 }
    },
    lunges: {
        beginner: { lungeHold: 4000, standHold: 2500, transitionTime: 2000 },
        intermediate: { lungeHold: 3500, standHold: 2000, transitionTime: 1500 },
        advanced: { lungeHold: 3000, standHold: 1500, transitionTime: 1200 }
    },
    plank: {
        beginner: { holdTime: 8000, checkInterval: 2000 },
        intermediate: { holdTime: 10000, checkInterval: 2500 },
        advanced: { holdTime: 12000, checkInterval: 3000 }
    }
};

// Visual obstacle difficulty multipliers - Improved balance
const difficultyMultipliers = {
    beginner: {
        speedMultiplier: 0.6,  // Slightly slower for beginners
        gapSizeMultiplier: 1.8,  // Larger gaps (80% increase - more reasonable)
        spacingMultiplier: 1.8,  // 80% more time between obstacles
        holdTimeMultiplier: 1.5  // 50% longer hold times for learning
    },
    intermediate: {
        speedMultiplier: 1.0,
        gapSizeMultiplier: 1.0,
        spacingMultiplier: 1.0,  // Normal spacing
        holdTimeMultiplier: 1.0  // Normal hold times
    },
    advanced: {
        speedMultiplier: 1.4,  // Faster for challenge
        gapSizeMultiplier: 0.75,  // Smaller gaps (25% reduction)
        spacingMultiplier: 0.6,  // 40% less time between obstacles
        holdTimeMultiplier: 0.7  // 30% shorter hold times for speed
    }
};

// Exercise-specific game settings - focused on natural exercise rhythm
const exerciseGameSettings = {
    pushups: {
        gapPosition: 0.65, // 65% from top (encourage going down)
        gapSize: 150,
        obstacleSpeed: 1.5, // Slower for exercise pacing
        obstacleSpacing: 400, // 4-5 second rhythm for proper form
        holdTime: 1500, // 1.5 seconds hold in each position
        description: 'Follow the rhythm: UP - hold - DOWN - hold - repeat!'
    },
    squats: {
        gapPosition: 0.75, // 75% from top (encourage squatting low)
        gapSize: 140,
        obstacleSpeed: 1.8, // Slower for exercise pacing
        obstacleSpacing: 450, // 5-6 second rhythm for proper squats
        holdTime: 2000, // 2 seconds hold in squat position
        description: 'Squat rhythm: STAND - SQUAT - hold - STAND - hold!'
    },
    jumpingjacks: {
        gapPosition: 0.5, // Middle gaps with alternating pattern
        gapSize: 160,
        obstacleSpeed: 2.5, // Moderate pace for jumping
        obstacleSpacing: 300, // 3-4 second rhythm
        holdTime: 800, // Short hold for explosive movement
        description: 'Jump rhythm: SPREAD - CLOSE - SPREAD - CLOSE!'
    },
    lunges: {
        gapPosition: 0.6, // Alternating gap positions
        gapSize: 145,
        obstacleSpeed: 1.2, // Very slow for controlled lunges
        obstacleSpacing: 500, // 6-7 second rhythm for deep lunges
        holdTime: 2500, // 2.5 seconds hold in lunge position
        description: 'Lunge rhythm: STEP - hold - RETURN - hold - switch legs!'
    },
    plank: {
        gapPosition: 0.5, // Middle (straight body position)
        gapSize: 180,
        obstacleSpeed: 0.8, // Very slow for static hold
        obstacleSpacing: 600, // Wide spacing for endurance hold
        holdTime: 5000, // 5 seconds continuous hold
        description: 'Hold steady plank position - endurance challenge!'
    },
    random_fun: {
        gapPosition: 0.5, // Variable positioning for mixed movements
        gapSize: 160, // Moderate gap size for varied movements
        obstacleSpeed: 2.0, // Moderate speed for fun mode
        obstacleSpacing: 350, // Balanced spacing for variety
        holdTime: 1000, // Short hold for dynamic movement
        description: 'Mix it up! Follow the random instructions for each obstacle!'
    }
};





// Push-up detection variables
let isDown = false;
let lastPosition = 'up';
let noseY = 0;
let pushupThreshold = 0.08; // Further reduced threshold for much easier detection
let faceDetected = false; // Flag to control when gravity starts
let faceY = 0; // Current face Y position for bird tracking

// Exercise rhythm tracking
let lastPositionChangeTime = 0;
let currentPositionStartTime = 0;
let exercisePhase = 'ready'; // 'ready', 'hold_up', 'transitioning_down', 'hold_down', 'transitioning_up'

// Exercise-driven obstacle system
let exerciseState = {
    currentPhase: 'up', // 'up', 'down', 'transition', 'ready'
    phaseStartTime: Date.now(),
    phaseCompletedCount: 0,
    nextObstacleType: 'down', // 'up', 'down', 'mixed'
    waitingForPhaseCompletion: false,
    lastObstacleCreated: 0,
    exerciseMode: 'guided' // 'guided' or 'random_fun'
};

// Exercise System
let currentExercise = 'pushups';
let difficultyLevel = 'intermediate'; // beginner, intermediate, advanced
let targetReps = 5;
let currentReps = 0;
let totalPoints = 0;
let workoutStreak = 0;
let exerciseStartTime = 0;

// Exercise definitions with different difficulty levels
const exercises = {
    pushups: {
        name: 'Push-ups',
        icon: '💪',
        description: 'Lower your chest towards the ground, then push back up',
        difficulties: {
            beginner: { reps: 5, points: 10 },
            intermediate: { reps: 10, points: 25 },
            advanced: { reps: 20, points: 50 }
        },
        detectMovement: 'pushupDetection'
    },
    squats: {
        name: 'Squats',
        icon: '🦵',
        description: 'Lower your body by bending knees, then stand back up',
        difficulties: {
            beginner: { reps: 8, points: 12 },
            intermediate: { reps: 15, points: 30 },
            advanced: { reps: 25, points: 60 }
        },
        detectMovement: 'squatDetection'
    },
    jumpingjacks: {
        name: 'Jumping Jacks',
        icon: '🤸',
        description: 'Jump while spreading legs and raising arms overhead',
        difficulties: {
            beginner: { reps: 10, points: 8 },
            intermediate: { reps: 20, points: 20 },
            advanced: { reps: 40, points: 45 }
        },
        detectMovement: 'jumpingJackDetection'
    },
    lunges: {
        name: 'Lunges',
        icon: '🚶',
        description: 'Step forward and lower your body until both knees are bent',
        difficulties: {
            beginner: { reps: 6, points: 15 },
            intermediate: { reps: 12, points: 35 },
            advanced: { reps: 20, points: 70 }
        },
        detectMovement: 'lungeDetection'
    },
    plank: {
        name: 'Plank Hold',
        icon: '🏋️',
        description: 'Hold a plank position for the target duration',
        difficulties: {
            beginner: { reps: 30, points: 20 }, // 30 seconds
            intermediate: { reps: 60, points: 45 }, // 1 minute
            advanced: { reps: 120, points: 90 } // 2 minutes
        },
        detectMovement: 'plankDetection'
    },
    random_fun: {
        name: 'Random Fun',
        icon: '🎲',
        description: 'Mixed movements from all exercises - chaos mode!',
        difficulties: {
            beginner: { reps: 15, points: 30 },
            intermediate: { reps: 25, points: 50 },
            advanced: { reps: 40, points: 80 }
        },
        detectMovement: 'mixedDetection'
    }
};

console.log('Exercises object:', exercises);
console.log('Available exercises:', Object.keys(exercises));

// Initialize MediaPipe Pose
function initializePoseDetection() {
    console.log('Initializing pose detection...');
    
    try {
        // Check if MediaPipe Pose is loaded
        if (typeof Pose === 'undefined') {
            console.error('window.Pose is:', window.Pose);
            console.error('Available global objects:', Object.keys(window).filter(k => k.includes('ose') || k.includes('amera')));
            throw new Error('MediaPipe Pose library not loaded. Please check your internet connection and refresh the page.');
        }
        
        if (typeof Camera === 'undefined') {
            console.error('window.Camera is:', window.Camera);
            throw new Error('MediaPipe Camera Utils library not loaded. Please check your internet connection and refresh the page.');
        }
        
        const poseConfig = {
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        };

        pose = new window.Pose(poseConfig);
    
    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onPoseResults);

    // Set up camera
    webcamElement = document.getElementById('webcam');
    canvasElement = document.getElementById('pose-overlay');
    canvasCtx = canvasElement.getContext('2d');

    const camera = new window.Camera(webcamElement, {
        onFrame: async () => {
            await pose.send({image: webcamElement});
        },
        width: 640,
        height: 480
    });
    
    camera.start().then(() => {
        console.log('Camera started successfully');
    }).catch(error => {
        console.error('Camera start error:', error);
        alert('Unable to access camera. Please ensure:\n1. You are using HTTPS or localhost\n2. Camera permissions are granted\n3. No other application is using your camera');
    });
    
    } catch (error) {
        console.error('Pose detection initialization error:', error);
        alert('Failed to initialize pose detection. Please check your browser console for details.');
    }
}

function onPoseResults(results) {
    canvasElement.width = webcamElement.videoWidth;
    canvasElement.height = webcamElement.videoHeight;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    if (results.poseLandmarks) {
        // Only set face detected if we have a clear nose landmark
        const nosePoint = results.poseLandmarks[0];
        if (nosePoint && nosePoint.visibility > 0.5) {
            faceDetected = true;
            // Update face Y position for bird tracking
            faceY = nosePoint.y;
        }
        
        // Draw pose landmarks
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 2
        });
        
        drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: '#FF0000',
            lineWidth: 1,
            radius: 3
        });
        
        // Detect exercise movement and update status
        if (gameRunning) {
            detectExerciseMovement(results.poseLandmarks);
            updateExerciseStatus(results.poseLandmarks);
        }
        
        // Draw detection box around face
        const nose = results.poseLandmarks[0];
        if (nose) {
            const box = document.getElementById('detectionBox');
            const x = (1 - nose.x) * webcamElement.offsetWidth - 50;
            const y = nose.y * webcamElement.offsetHeight - 50;
            
            box.style.left = x + 'px';
            box.style.top = y + 'px';
            box.style.width = '100px';
            box.style.height = '100px';
            box.style.display = 'block';
        }
    } else {
        // No pose detected - update instructions to show waiting
        if (gameRunning && !faceDetected) {
            const instructionText = document.getElementById('instructionText');
            if (instructionText) {
                instructionText.textContent = '📸 Position yourself in camera view to start tracking';
            }
        }
        document.getElementById('detectionBox').style.display = 'none';
    }
    
    canvasCtx.restore();
}

function updateExerciseStatus(landmarks) {
    if (!gameRunning) return;
    
    const instructionText = document.getElementById('instructionText');
    if (!instructionText) return;
    
    const exercise = exercises[currentExercise];
    const progress = Math.floor((currentReps / targetReps) * 100);
    
    // Find the next pipe that hasn't been passed
    let nextPipe = null;
    for (let pipe of pipes) {
        if (!pipe.passed && pipe.x > bird.x - 100) {
            nextPipe = pipe;
            break;
        }
    }
    
    // Update instructions based on current exercise and movement state
    switch(currentExercise) {
        case 'pushups':
            const nose = landmarks[0];
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            
            if (nose && leftShoulder && rightShoulder) {
                const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
                const relativeNoseY = nose.y - shoulderY;
                
                // New exercise-driven instructions
                const currentlyUp = relativeNoseY <= pushupThreshold;
                const currentlyDown = relativeNoseY > pushupThreshold;
                const currentTime = Date.now();
                
                // Update exercise phase tracking
                if (currentlyUp && lastPosition === 'down') {
                    exerciseState.currentPhase = 'up';
                    exerciseState.phaseStartTime = currentTime;
                } else if (currentlyDown && lastPosition === 'up') {
                    exerciseState.currentPhase = 'down';
                    exerciseState.phaseStartTime = currentTime;
                }
                
                // Find the next obstacle and use its instruction
                let nextObstacle = null;
                for (let pipe of pipes) {
                    if (!pipe.passed && pipe.x > bird.x - 100) {
                        nextObstacle = pipe;
                        break;
                    }
                }
                
                if (nextObstacle && nextObstacle.instruction) {
                    // Use the obstacle's embedded instruction
                    const timeInPhase = currentTime - exerciseState.phaseStartTime;
                    const requiredTime = getRequiredHoldTime();
                    
                    if (exerciseState.waitingForPhaseCompletion && timeInPhase < requiredTime) {
                        const remaining = Math.ceil((requiredTime - timeInPhase) / 1000);
                        instructionText.textContent = `${nextObstacle.instruction} ${remaining}s (${currentReps}/${targetReps}) - ${progress}%`;
                    } else {
                        instructionText.textContent = `${nextObstacle.instruction} (${currentReps}/${targetReps}) - ${progress}%`;
                    }
                } else {
                    // Fallback instructions when no obstacle is present
                    if (currentlyUp) {
                        instructionText.textContent = `⬆️ UP position ready! (${currentReps}/${targetReps}) - ${progress}%`;
                    } else if (currentlyDown) {
                        instructionText.textContent = `⬇️ DOWN position ready! (${currentReps}/${targetReps}) - ${progress}%`;
                    } else {
                        instructionText.textContent = `💪 Get in position! (${currentReps}/${targetReps}) - ${progress}%`;
                    }
                }
            }
            break;
            
        case 'squats':
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            const leftKnee = landmarks[25];
            const rightKnee = landmarks[26];
            
            if (leftHip && rightHip && leftKnee && rightKnee) {
                const hipY = (leftHip.y + rightHip.y) / 2;
                const kneeY = (leftKnee.y + rightKnee.y) / 2;
                const hipKneeDiff = kneeY - hipY;
                
                // Show instructions based on upcoming pipe
                if (nextPipe) {
                    if (nextPipe.gapPosition === 'low') {
                        instructionText.textContent = `⬇️ SQUAT DOWN for red gap! (${currentReps}/${targetReps}) - ${progress}%`;
                    } else if (nextPipe.gapPosition === 'high') {
                        instructionText.textContent = `⬆️ STAND UP for green gap! (${currentReps}/${targetReps}) - ${progress}%`;
                    } else {
                        instructionText.textContent = `↔️ Get ready! (${currentReps}/${targetReps}) - ${progress}%`;
                    }
                } else {
                    // Default instruction when no pipe is near
                    if (hipKneeDiff < 0.1) {
                        instructionText.textContent = `⬇️ Squatting (${currentReps}/${targetReps}) - Hold it!`;
                    } else {
                        instructionText.textContent = `⬆️ Stand up (${currentReps}/${targetReps}) - ${progress}% Done`;
                    }
                }
            }
            break;
            
        case 'jumpingjacks':
            const leftWrist = landmarks[15];
            const rightWrist = landmarks[16];
            
            if (leftWrist && rightWrist) {
                const armSpread = Math.abs(leftWrist.x - rightWrist.x);
                
                // Show instructions based on upcoming pipe
                if (nextPipe) {
                    // For jumping jacks, gaps can be at various positions
                    const gapCenter = nextPipe.topHeight + ((nextPipe.bottomY - nextPipe.topHeight) / 2);
                    const relativePosition = gapCenter / gameCanvas.height;
                    
                    if (relativePosition < 0.4) {
                        instructionText.textContent = `⬆️ JUMP HIGH for this gap! (${currentReps}/${targetReps}) - ${progress}%`;
                    } else if (relativePosition > 0.6) {
                        instructionText.textContent = `⬇️ STAY LOW for this gap! (${currentReps}/${targetReps}) - ${progress}%`;
                    } else {
                        instructionText.textContent = `🤸 JUMP & SPREAD! (${currentReps}/${targetReps}) - ${progress}%`;
                    }
                } else {
                    // Default instruction when no pipe is near
                    if (armSpread > 0.4) {
                        instructionText.textContent = `🌟 Arms spread (${currentReps}/${targetReps}) - Perfect!`;
                    } else {
                        instructionText.textContent = `🤸 Jump & spread (${currentReps}/${targetReps}) - ${progress}% Complete`;
                    }
                }
            }
            break;
            
        case 'lunges':
            const lKnee = landmarks[25];
            const rKnee = landmarks[26];
            const lAnkle = landmarks[27];
            const rAnkle = landmarks[28];
            
            if (lKnee && rKnee && lAnkle && rAnkle) {
                const kneeAnkleDiff = Math.abs((lKnee.y - lAnkle.y) - (rKnee.y - rAnkle.y));
                
                // Show instructions based on upcoming pipe
                if (nextPipe) {
                    if (nextPipe.gapPosition === 'high') {
                        instructionText.textContent = `🦵 LEFT LUNGE for green gap! (${currentReps}/${targetReps}) - ${progress}%`;
                    } else if (nextPipe.gapPosition === 'low') {
                        instructionText.textContent = `🦵 RIGHT LUNGE for red gap! (${currentReps}/${targetReps}) - ${progress}%`;
                    } else {
                        instructionText.textContent = `↔️ Switch legs! (${currentReps}/${targetReps}) - ${progress}%`;
                    }
                } else {
                    // Default instruction when no pipe is near
                    if (kneeAnkleDiff > 0.15) {
                        instructionText.textContent = `🦵 Hold lunge (${currentReps}/${targetReps}) - Strong!`;
                    } else {
                        instructionText.textContent = `🚶 Step forward (${currentReps}/${targetReps}) - ${progress}% Done`;
                    }
                }
            }
            break;
            
        case 'plank':
            const timeRemaining = targetReps - currentReps;
            
            // Show instructions based on upcoming pipe
            if (nextPipe) {
                // For plank, all gaps are in the middle, focus on holding steady
                instructionText.textContent = `🏋️ HOLD PLANK POSITION! ${currentReps}s/${targetReps}s - Stay straight!`;
            } else {
                instructionText.textContent = `🏋️ Hold steady! ${currentReps}s/${targetReps}s - ${timeRemaining}s to go!`;
            }
            break;
    }
    
    // Add motivational messages based on progress
    if (progress >= 80 && progress < 100) {
        instructionText.textContent += ' 🔥 Almost there!';
    } else if (progress >= 50 && progress < 80) {
        instructionText.textContent += ' 💪 Keep going!';
    } else if (progress >= 25 && progress < 50) {
        instructionText.textContent += ' ⚡ Great pace!';
    }
}

function drawConnectors(ctx, landmarks, connections, style) {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    
    connections.forEach(([start, end]) => {
        const startLandmark = landmarks[start];
        const endLandmark = landmarks[end];
        
        if (startLandmark && endLandmark) {
            ctx.beginPath();
            ctx.moveTo(startLandmark.x * ctx.canvas.width, startLandmark.y * ctx.canvas.height);
            ctx.lineTo(endLandmark.x * ctx.canvas.width, endLandmark.y * ctx.canvas.height);
            ctx.stroke();
        }
    });
}

function drawLandmarks(ctx, landmarks, style) {
    ctx.fillStyle = style.color;
    
    landmarks.forEach(landmark => {
        if (landmark) {
            ctx.beginPath();
            ctx.arc(
                landmark.x * ctx.canvas.width,
                landmark.y * ctx.canvas.height,
                style.radius,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    });
}

// Game functions
function initializeGame() {
    gameCanvas = document.getElementById('gameCanvas');
    gameCtx = gameCanvas.getContext('2d');
    
    // Set canvas size properly
    const rect = gameCanvas.getBoundingClientRect();
    gameCanvas.width = rect.width;
    gameCanvas.height = rect.height;
    
    // Initialize bird position based on actual canvas size
    bird.x = gameCanvas.width * 0.2; // 20% from left
    bird.y = gameCanvas.height * 0.3; // 30% from top (safer position)
    
    console.log('Canvas size:', gameCanvas.width, 'x', gameCanvas.height);
    console.log('Bird position:', bird.x, bird.y);
    
    // Initialize pose detection
    initializePoseDetection();
}

function startGame() {
    if (!gameCanvas || gameCanvas.width === 0 || gameCanvas.height === 0) {
        console.error('Canvas not properly initialized');
        return;
    }
    
    gameRunning = true;
    score = 0;
    pushupCount = 0;
    level = 1;
    gameSpeed = 3.5;
    pipes = [];
    faceDetected = false; // Reset face detection to wait for camera
    gameStartTime = Date.now(); // Start the timer
    
    // Reset bird position and velocity
    bird.x = gameCanvas.width * 0.2;
    bird.y = gameCanvas.height * 0.25; // Even higher starting position
    bird.velocity = -3; // Start with upward velocity to give player time
    
    lastPipeX = gameCanvas.width + 200;
    
    console.log('Game started - Bird at:', bird.x, bird.y);
    console.log('Canvas size:', gameCanvas.width, 'x', gameCanvas.height);
    
    document.getElementById('gameOverlay').style.display = 'none';
    updateStats();
    updateTimer(); // Start updating the timer
    
    // Remove old pipe creation - using new exercise-driven system only
    console.log('Using exercise-driven obstacle system only');
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

function performFlap() {
    bird.velocity = bird.flapPower;
    console.log('Flap! Bird velocity now:', bird.velocity);
}

// Exercise-driven obstacle creation - Fixed timing to prevent overlaps
function shouldCreateNextObstacle() {
    const currentTime = Date.now();
    const difficultyMult = difficultyMultipliers[difficultyLevel];
    
    // CRITICAL: Minimum spacing to prevent overlaps
    const minimumInterval = 4000; // Absolute minimum 4 seconds between obstacles
    const baseInterval = 5000; // Base 5 second interval for safety
    const adjustedInterval = Math.max(minimumInterval, baseInterval * difficultyMult.spacingMultiplier);
    
    // Debug logging to track timing
    const timeSinceLastObstacle = currentTime - exerciseState.lastObstacleCreated;
    console.log(`🕐 TIMING CHECK - Time since last: ${timeSinceLastObstacle}ms, Required: ${adjustedInterval}ms, Can create: ${timeSinceLastObstacle >= adjustedInterval}`);
    
    // STRICT timing check - must wait full interval
    if (timeSinceLastObstacle < adjustedInterval) {
        return false;
    }
    
    // Only create if we haven't created one recently AND we're not waiting
    if (exerciseState.waitingForPhaseCompletion) {
        console.log(`⏳ Still waiting for phase completion, not creating obstacle`);
        return false;
    }
    
    console.log(`✅ CREATING NEW OBSTACLE - Safe to proceed`);
    return true;
}

function getRequiredHoldTime() {
    const timings = exerciseTimings[currentExercise][difficultyLevel];
    
    switch (currentExercise) {
        case 'pushups':
            return exerciseState.currentPhase === 'down' ? timings.downHold : timings.upHold;
        case 'squats':
            return exerciseState.currentPhase === 'down' ? timings.downHold : timings.upHold;
        case 'jumpingjacks':
            return exerciseState.currentPhase === 'open' ? timings.openHold : timings.closedHold;
        case 'lunges':
            return exerciseState.currentPhase === 'lunge' ? timings.lungeHold : timings.standHold;
        default:
            return 2000;
    }
}

function createNextExerciseObstacle() {
    const settings = exerciseGameSettings[currentExercise];
    const difficultyMult = difficultyMultipliers[difficultyLevel];
    const currentStage = getCurrentStage();
    
    // Apply both difficulty and stage modifiers
    const stageAdjustedGapSize = settings.gapSize * difficultyMult.gapSizeMultiplier;
    // Stage modifier slightly reduces gap size as player progresses (but difficulty is primary factor)
    const finalGapSize = Math.max(120, stageAdjustedGapSize * (1 - (currentStage.modifier - 1) * 0.1));
    
    console.log(`🔍 CREATING OBSTACLE - Exercise: ${currentExercise}, Difficulty: ${difficultyLevel}, Stage: ${currentStage.name}`);
    console.log(`🔍 Base gap: ${settings.gapSize}px, Difficulty mult: ${difficultyMult.gapSizeMultiplier}x, Stage mod: ${currentStage.modifier}x`);
    console.log(`🔍 Final gap: ${finalGapSize.toFixed(0)}px`);
    
    // Enhanced debugging for beginner difficulty
    if (difficultyLevel === 'beginner') {
        console.log('🔍 🟢 BEGINNER OBSTACLE BEING CREATED!');
        console.log(`🔍 🟢 Stage: ${currentStage.name} (Score: ${score})`);
        console.log(`🔍 🟢 Final Gap: ${finalGapSize.toFixed(0)}px`);
    }
    
    let gapY, obstacleType;
    
    if (exerciseState.exerciseMode === 'random_fun') {
        // Random fun mode - mix all exercise types
        obstacleType = createRandomFunObstacle();
        gapY = obstacleType.gapY;
    } else {
        // Guided exercise mode - follow proper exercise rhythm
        switch (currentExercise) {
            case 'pushups':
                obstacleType = createPushupObstacle();
                break;
            case 'squats':
                obstacleType = createSquatObstacle();
                break;
            case 'jumpingjacks':
                obstacleType = createJumpingJackObstacle();
                break;
            case 'lunges':
                obstacleType = createLungeObstacle();
                break;
            default:
                obstacleType = { gapY: gameCanvas.height * 0.5, type: 'middle', instruction: 'Get ready!' };
        }
        gapY = obstacleType.gapY;
    }
    
    // Ensure gap doesn't go beyond canvas bounds
    const minGapY = 50;
    const maxGapY = gameCanvas.height - finalGapSize - 50;
    gapY = Math.max(minGapY, Math.min(maxGapY, gapY));
    
    // Apply both difficulty and stage modifiers to speed
    const baseSpeed = settings.obstacleSpeed || 2.0; // Fallback to 2.0 if not defined
    const finalSpeed = baseSpeed * difficultyMult.speedMultiplier * currentStage.modifier;
    
    console.log(`Creating ${obstacleType.type} obstacle for ${currentExercise} - Phase: ${exerciseState.currentPhase}`);
    console.log(`Final pipe data - topHeight: ${gapY}, bottomY: ${gapY + finalGapSize}, gap size: ${finalGapSize}, speed: ${finalSpeed.toFixed(2)}`);
    
    pipes.push({
        x: gameCanvas.width + 100,
        topHeight: gapY,
        bottomY: gapY + finalGapSize,
        passed: false,
        exerciseType: currentExercise,
        gapPosition: obstacleType.type,
        instruction: obstacleType.instruction,
        speed: finalSpeed,
        stage: currentStage.name
    });
    
    exerciseState.lastObstacleCreated = Date.now();
    exerciseState.waitingForPhaseCompletion = false; // Don't wait immediately - let player react
    lastPipeX = gameCanvas.width + 100;
    
    console.log(`🏗️ OBSTACLE CREATED - Next obstacle blocked for ${(Math.max(4000, 5000 * difficultyMultipliers[difficultyLevel].spacingMultiplier)/1000).toFixed(1)}s`);
}

function createPushupObstacle() {
    // Create obstacles that guide proper push-up rhythm
    if (exerciseState.nextObstacleType === 'down') {
        exerciseState.nextObstacleType = 'up';
        exerciseState.currentPhase = 'down';
        return {
            gapY: gameCanvas.height * 0.78,
            type: 'low',
            instruction: 'GO DOWN & HOLD!'
        };
    } else {
        exerciseState.nextObstacleType = 'down';
        exerciseState.currentPhase = 'up';
        return {
            gapY: gameCanvas.height * 0.22,
            type: 'high',
            instruction: 'PUSH UP & HOLD!'
        };
    }
}

function createSquatObstacle() {
    if (exerciseState.nextObstacleType === 'down') {
        exerciseState.nextObstacleType = 'up';
        exerciseState.currentPhase = 'down';
        return {
            gapY: gameCanvas.height * 0.82,
            type: 'low',
            instruction: 'SQUAT DOWN & HOLD!'
        };
    } else {
        exerciseState.nextObstacleType = 'down';
        exerciseState.currentPhase = 'up';
        return {
            gapY: gameCanvas.height * 0.25,
            type: 'high',
            instruction: 'STAND UP & HOLD!'
        };
    }
}

function createJumpingJackObstacle() {
    if (exerciseState.nextObstacleType === 'open') {
        exerciseState.nextObstacleType = 'closed';
        exerciseState.currentPhase = 'open';
        return {
            gapY: gameCanvas.height * (0.3 + Math.random() * 0.4),
            type: 'spread',
            instruction: 'JUMP & SPREAD!'
        };
    } else {
        exerciseState.nextObstacleType = 'open';
        exerciseState.currentPhase = 'closed';
        return {
            gapY: gameCanvas.height * 0.5,
            type: 'closed',
            instruction: 'ARMS & LEGS TOGETHER!'
        };
    }
}

function createLungeObstacle() {
    if (exerciseState.nextObstacleType === 'lunge') {
        exerciseState.nextObstacleType = 'stand';
        exerciseState.currentPhase = 'lunge';
        const side = exerciseState.phaseCompletedCount % 2 === 0 ? 'LEFT' : 'RIGHT';
        return {
            gapY: gameCanvas.height * 0.75,
            type: 'low',
            instruction: `${side} LUNGE & HOLD!`
        };
    } else {
        exerciseState.nextObstacleType = 'lunge';
        exerciseState.currentPhase = 'stand';
        return {
            gapY: gameCanvas.height * 0.3,
            type: 'high',
            instruction: 'STAND UP & HOLD!'
        };
    }
}

function createRandomFunObstacle() {
    const randomExercises = ['pushups', 'squats', 'jumpingjacks', 'lunges'];
    const randomExercise = randomExercises[Math.floor(Math.random() * randomExercises.length)];
    const randomMovements = [
        { gapY: gameCanvas.height * 0.8, type: 'low', instruction: 'GO DOWN!' },
        { gapY: gameCanvas.height * 0.2, type: 'high', instruction: 'GO UP!' },
        { gapY: gameCanvas.height * 0.3, type: 'high', instruction: 'JUMP HIGH!' },
        { gapY: gameCanvas.height * 0.7, type: 'low', instruction: 'SQUAT LOW!' },
        { gapY: gameCanvas.height * 0.5, type: 'middle', instruction: 'SPREAD ARMS!' }
    ];
    
    return randomMovements[Math.floor(Math.random() * randomMovements.length)];
}

// Legacy function for compatibility
function createPipe() {
    createNextExerciseObstacle();
}

function updateGame() {
    // Make bird follow face movement directly instead of gravity
    if (faceDetected && faceY > 0) {
        // Map face Y position (0-1) to canvas Y position
        const targetY = faceY * gameCanvas.height;
        
        // Much faster movement towards target position
        const diff = targetY - bird.y;
        bird.y += diff * 0.35; // Increased from 0.1 for faster response
        bird.velocity = diff * 0.15; // Increased velocity effect
    }
    
    // Prevent bird from going too fast down
    if (bird.velocity > 8) {
        bird.velocity = 8;
    }
    
    // Update pipes only after face is detected
    if (faceDetected) {
        pipes.forEach((pipe, index) => {
            // Use individual pipe speed or default
            const pipeSpeed = pipe.speed || 2.0;
            pipe.x -= pipeSpeed;
        
            // Check if pipe passed the bird
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                
                // Mark phase as completed when obstacle is passed
                if (exerciseState.waitingForPhaseCompletion) {
                    exerciseState.waitingForPhaseCompletion = false;
                    exerciseState.phaseCompletedCount++;
                    exerciseState.phaseStartTime = Date.now();
                    console.log(`Phase completed! Count: ${exerciseState.phaseCompletedCount}`);
                }
                
                // Level up every 5 successful passes
                if (score % 5 === 0) {
                    level++;
                    updateStats();
                }
            }
        
            // Remove off-screen pipes
            if (pipe.x + pipeWidth < 0) {
                pipes.splice(index, 1);
            }
        });
        
        // Create new obstacles based on exercise rhythm
        if (shouldCreateNextObstacle()) {
            createNextExerciseObstacle();
        }
    }
    
    // Check collisions only after face is detected
    if (faceDetected && checkCollision()) {
        endGame();
    }
    
    updateStats();
}

function checkCollision() {
    // Ground and ceiling collision with proper margin
    if (bird.y - bird.radius <= 5 || bird.y + bird.radius >= gameCanvas.height - 5) {
        console.log('Ground/ceiling collision at bird.y:', bird.y, 'canvas height:', gameCanvas.height, 'bird bottom:', bird.y + bird.radius);
        return true;
    }
    
    // Don't check pipe collisions if no pipes exist
    if (pipes.length === 0) {
        return false;
    }
    
    // Pipe collision - only check if pipes exist and are near the bird
    for (let pipe of pipes) {
        // Only check pipes that are close to the bird
        if (pipe.x + pipeWidth > bird.x - 50 && pipe.x < bird.x + 50) {
            if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth) {
                if (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > pipe.bottomY) {
                    console.log('Pipe collision detected');
                    return true;
                }
            }
        }
    }
    
    return false;
}

function drawGame() {
    // Clear canvas
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Draw background gradient
    const gradient = gameCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    gameCtx.fillStyle = gradient;
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Draw stage progression and motivational message overlay
    if (gameElapsedTime > 0) {
        gameCtx.save();
        gameCtx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        gameCtx.textAlign = 'center';
        gameCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        gameCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        gameCtx.lineWidth = 2;
        
        const currentStage = getCurrentStage();
        
        // Draw stage info at top center
        const stageText = `Stage: ${currentStage.name} (${score} pts)`;
        gameCtx.strokeText(stageText, gameCanvas.width / 2, 30);
        gameCtx.fillText(stageText, gameCanvas.width / 2, 30);
        
        // Draw motivational message based on stage and time
        gameCtx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
        let motivationalText = '';
        
        if (score < 5) {
            motivationalText = '🚀 Starting strong!';
        } else if (score < 10) {
            motivationalText = '💪 Building momentum!';
        } else if (score < 20) {
            motivationalText = '🔥 Finding your rhythm!';
        } else if (score < 30) {
            motivationalText = '⚡ In the flow state!';
        } else {
            motivationalText = '🏆 Elite performance!';
        }
        
        // Draw motivational text below stage info
        gameCtx.strokeText(motivationalText, gameCanvas.width / 2, 50);
        gameCtx.fillText(motivationalText, gameCanvas.width / 2, 50);
        gameCtx.restore();
    }
    
    // Draw pipes with gradient
    pipes.forEach(pipe => {
        // Create vertical gradient for pipes with color coding based on gap position
        const pipeGradient = gameCtx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        
        // Color pipes based on movement type
        if (pipe.gapPosition === 'high' || pipe.gapPosition === 'stand') {
            // Green tones for high gaps (stay up/stand)
            pipeGradient.addColorStop(0, '#10b981');  // Emerald
            pipeGradient.addColorStop(0.5, '#059669'); // Darker emerald
            pipeGradient.addColorStop(1, '#047857');  // Dark emerald
        } else if (pipe.gapPosition === 'low' || pipe.gapPosition === 'lunge') {
            // Red/orange tones for low gaps (go down/lunge)
            pipeGradient.addColorStop(0, '#f59e0b');  // Amber
            pipeGradient.addColorStop(0.5, '#dc2626'); // Red
            pipeGradient.addColorStop(1, '#b91c1c');  // Dark red
        } else if (pipe.gapPosition === 'spread' || pipe.gapPosition === 'open') {
            // Yellow/orange for spread/jump movements
            pipeGradient.addColorStop(0, '#fbbf24');  // Yellow
            pipeGradient.addColorStop(0.5, '#f59e0b'); // Amber
            pipeGradient.addColorStop(1, '#d97706');  // Dark amber
        } else if (pipe.gapPosition === 'closed') {
            // Cyan for closed positions
            pipeGradient.addColorStop(0, '#06b6d4');  // Cyan
            pipeGradient.addColorStop(0.5, '#0891b2'); // Darker cyan
            pipeGradient.addColorStop(1, '#0e7490');  // Dark cyan
        } else {
            // Blue/purple for middle/transition gaps
            pipeGradient.addColorStop(0, '#8b5cf6');  // Purple
            pipeGradient.addColorStop(0.5, '#6366f1'); // Indigo
            pipeGradient.addColorStop(1, '#3b82f6');  // Blue
        }
        
        gameCtx.fillStyle = pipeGradient;
        
        // Top pipe
        gameCtx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Bottom pipe
        gameCtx.fillRect(pipe.x, pipe.bottomY, pipeWidth, gameCanvas.height - pipe.bottomY);
        
        // Pipe caps with darker gradient matching the pipe color
        const capGradient = gameCtx.createLinearGradient(pipe.x - 5, 0, pipe.x + pipeWidth + 5, 0);
        
        if (pipe.gapPosition === 'high' || pipe.gapPosition === 'stand') {
            capGradient.addColorStop(0, '#047857');  // Dark emerald
            capGradient.addColorStop(0.5, '#065f46'); // Darker emerald
            capGradient.addColorStop(1, '#064e3b');  // Darkest emerald
        } else if (pipe.gapPosition === 'low' || pipe.gapPosition === 'lunge') {
            capGradient.addColorStop(0, '#b91c1c');  // Dark red
            capGradient.addColorStop(0.5, '#991b1b'); // Darker red
            capGradient.addColorStop(1, '#7f1d1d');  // Darkest red
        } else if (pipe.gapPosition === 'spread' || pipe.gapPosition === 'open') {
            capGradient.addColorStop(0, '#d97706');  // Dark amber
            capGradient.addColorStop(0.5, '#92400e'); // Darker amber
            capGradient.addColorStop(1, '#78350f');  // Darkest amber
        } else if (pipe.gapPosition === 'closed') {
            capGradient.addColorStop(0, '#0e7490');  // Dark cyan
            capGradient.addColorStop(0.5, '#155e75'); // Darker cyan
            capGradient.addColorStop(1, '#164e63');  // Darkest cyan
        } else {
            capGradient.addColorStop(0, '#7c3aed');  // Darker purple
            capGradient.addColorStop(0.5, '#5b21b6'); // Darker indigo
            capGradient.addColorStop(1, '#2563eb');  // Darker blue
        }
        
        gameCtx.fillStyle = capGradient;
        gameCtx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipeWidth + 10, 30);
        gameCtx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 30);
    });
    
    // Draw bird with radial gradient
    gameCtx.beginPath();
    gameCtx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    
    // Create radial gradient for bird
    const birdGradient = gameCtx.createRadialGradient(
        bird.x - 5, bird.y - 5, 0,  // Inner circle (highlight)
        bird.x, bird.y, bird.radius  // Outer circle
    );
    birdGradient.addColorStop(0, '#10b981');  // Bright green center
    birdGradient.addColorStop(0.5, '#06b6d4'); // Cyan middle
    birdGradient.addColorStop(1, '#3b82f6');  // Blue edge
    
    gameCtx.fillStyle = birdGradient;
    gameCtx.fill();
    
    // Add vibrant stroke
    gameCtx.strokeStyle = '#059669'; // Darker green
    gameCtx.lineWidth = 3;
    gameCtx.stroke();
    
    // Add glow effect
    gameCtx.shadowColor = '#10b981';
    gameCtx.shadowBlur = 10;
    gameCtx.stroke();
    gameCtx.shadowBlur = 0; // Reset shadow
    
    // Draw bird eye
    gameCtx.beginPath();
    gameCtx.arc(bird.x + 8, bird.y - 5, 5, 0, Math.PI * 2);
    gameCtx.fillStyle = '#1f2937'; // Dark gray instead of pure black
    gameCtx.fill();
    
    // Add eye highlight
    gameCtx.beginPath();
    gameCtx.arc(bird.x + 10, bird.y - 7, 2, 0, Math.PI * 2);
    gameCtx.fillStyle = '#ffffff';
    gameCtx.fill();
    
    // Draw bird beak
    gameCtx.beginPath();
    gameCtx.moveTo(bird.x + bird.radius, bird.y);
    gameCtx.lineTo(bird.x + bird.radius + 10, bird.y);
    gameCtx.lineTo(bird.x + bird.radius, bird.y + 5);
    gameCtx.closePath();
    gameCtx.fillStyle = '#f97316'; // Vibrant orange
    gameCtx.fill();
}

function gameLoop() {
    if (!gameRunning) return;
    
    updateGame();
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

function endGame() {
    console.log('Game ended - Score:', score, 'Push-ups:', pushupCount, 'Current reps:', currentReps);
    gameRunning = false;
    gameElapsedTime = Math.floor((Date.now() - gameStartTime) / 1000); // Final time
    
    // Complete the workout if any reps were done
    if (currentReps > 0) {
        completeWorkout();
    } else {
        // Show game over screen without workout completion
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalPushups').textContent = pushupCount;
    }
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('pushupCount').textContent = pushupCount;
    document.getElementById('level').textContent = level;
    document.getElementById('speed').textContent = gameSpeed.toFixed(1);
}

function updateTimer() {
    if (!gameRunning) return;
    
    gameElapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(gameElapsedTime / 60);
    const seconds = gameElapsedTime % 60;
    const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('gameTimer');
    if (timerElement) {
        timerElement.textContent = timeDisplay;
        
        // Add motivational color changes based on time
        if (gameElapsedTime < 30) {
            timerElement.style.color = '#10b981'; // Green
        } else if (gameElapsedTime < 60) {
            timerElement.style.color = '#06b6d4'; // Cyan
        } else if (gameElapsedTime < 120) {
            timerElement.style.color = '#3b82f6'; // Blue
        } else {
            timerElement.style.color = '#8b5cf6'; // Purple for endurance!
        }
    }
    
    // Continue updating timer
    if (gameRunning) {
        setTimeout(updateTimer, 100); // Update every 100ms for smooth display
    }
}

// MediaPipe pose connections
const POSE_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5],
    [5, 6], [6, 8], [9, 10], [11, 12], [11, 13],
    [13, 15], [12, 14], [14, 16], [11, 23], [12, 24],
    [23, 24], [23, 25], [24, 26], [25, 27], [26, 28],
    [27, 29], [28, 30], [29, 31], [30, 32]
];

// Exercise Detection Functions
function pushupDetection(landmarks) {
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    if (!nose || !leftShoulder || !rightShoulder) {
        console.log('Missing landmarks for push-up detection');
        return false;
    }
    
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const relativeNoseY = nose.y - shoulderY;
    
    // Enhanced debug logging - always show for testing
    console.log('🔍 Push-up detection - Relative nose Y:', relativeNoseY.toFixed(3), 
                'Threshold:', pushupThreshold, 
                'Last position:', lastPosition,
                'Current reps:', currentReps);
    
    // More sensitive detection with better thresholds
    const isCurrentlyDown = relativeNoseY > (pushupThreshold + 0.02); // Smaller buffer for easier detection
    const isCurrentlyUp = relativeNoseY < (pushupThreshold - 0.02); // Smaller buffer for easier detection
    
    if (isCurrentlyDown && lastPosition === 'up') {
        lastPosition = 'down';
        console.log('🔽 Detected DOWN position - Hold it!');
        return false;
    } else if (isCurrentlyUp && lastPosition === 'down') {
        lastPosition = 'up';
        console.log('🔼 Detected UP position - REP COMPLETE! 🎉');
        console.log('💪 Rep count increased from', currentReps, 'to', currentReps + 1);
        return true; // Complete rep
    }
    return false;
}

function squatDetection(landmarks) {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    
    if (!leftHip || !rightHip || !leftKnee || !rightKnee) return false;
    
    const hipY = (leftHip.y + rightHip.y) / 2;
    const kneeY = (leftKnee.y + rightKnee.y) / 2;
    const hipKneeDiff = kneeY - hipY;
    
    if (hipKneeDiff < 0.1 && lastPosition === 'up') {
        lastPosition = 'down';
        return false;
    } else if (hipKneeDiff >= 0.1 && lastPosition === 'down') {
        lastPosition = 'up';
        return true; // Complete rep
    }
    return false;
}

function jumpingJackDetection(landmarks) {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    
    if (!leftWrist || !rightWrist || !leftAnkle || !rightAnkle) return false;
    
    const armSpread = Math.abs(leftWrist.x - rightWrist.x);
    const legSpread = Math.abs(leftAnkle.x - rightAnkle.x);
    
    if (armSpread > 0.4 && legSpread > 0.3 && lastPosition === 'closed') {
        lastPosition = 'open';
        return false;
    } else if (armSpread < 0.2 && legSpread < 0.2 && lastPosition === 'open') {
        lastPosition = 'closed';
        return true; // Complete rep
    }
    return false;
}

function lungeDetection(landmarks) {
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    
    if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return false;
    
    const kneeAnkleDiff = Math.abs((leftKnee.y - leftAnkle.y) - (rightKnee.y - rightAnkle.y));
    
    if (kneeAnkleDiff > 0.15 && lastPosition === 'standing') {
        lastPosition = 'lunging';
        return false;
    } else if (kneeAnkleDiff < 0.08 && lastPosition === 'lunging') {
        lastPosition = 'standing';
        return true; // Complete rep
    }
    return false;
}

function plankDetection(landmarks) {
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) return false;
    
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipY = (leftHip.y + rightHip.y) / 2;
    const bodyAlignment = Math.abs(shoulderY - hipY);
    
    return bodyAlignment < 0.1; // Good plank position
}

function mixedMovementDetection(landmarks) {
    // For random fun mode - detect any significant movement
    // Combine multiple movement types for variety
    
    // Try push-up detection
    if (pushupDetection(landmarks)) return true;
    
    // Try squat detection  
    if (squatDetection(landmarks)) return true;
    
    // Try jumping jack detection
    if (jumpingJackDetection(landmarks)) return true;
    
    // Try lunge detection
    if (lungeDetection(landmarks)) return true;
    
    // Additional simple movement detection for any missed movements
    const nose = landmarks[0];
    if (!nose) return false;
    
    // Detect any significant vertical movement
    const currentNoseY = nose.y;
    if (!mixedMovementDetection.lastNoseY) {
        mixedMovementDetection.lastNoseY = currentNoseY;
        return false;
    }
    
    const verticalMovement = Math.abs(currentNoseY - mixedMovementDetection.lastNoseY);
    if (verticalMovement > 0.1) { // Significant movement threshold
        mixedMovementDetection.lastNoseY = currentNoseY;
        console.log('🎲 Mixed movement detected! Vertical change:', verticalMovement.toFixed(3));
        return true;
    }
    
    return false;
}

// Exercise Management Functions
function initializeExerciseUI() {
    console.log('Initializing exercise UI...');
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        populateExerciseGrid();
        setupDifficultyButtons();
        updateWorkoutInfo();
        updateStats();
        console.log('Exercise UI initialization complete');
    }, 100);
}

function populateExerciseGrid() {
    console.log('🔄 populateExerciseGrid called');
    const grid = document.getElementById('exerciseGrid');
    if (!grid) {
        console.error('❌ Exercise grid element not found - DOM may not be ready');
        console.log('Available elements:', document.querySelectorAll('*[id]'));
        // Try again after a short delay
        setTimeout(() => {
            console.log('🔄 Retrying populateExerciseGrid...');
            populateExerciseGrid();
        }, 500);
        return;
    }
    
    console.log('✅ Exercise grid found, populating...');
    
    grid.innerHTML = '';
    
    Object.keys(exercises).forEach((key, index) => {
        const exercise = exercises[key];
        const card = document.createElement('div');
        card.className = `exercise-card ${key === currentExercise ? 'active' : ''}`;
        card.setAttribute('data-exercise', key);
        card.onclick = () => selectExercise(key);
        
        card.innerHTML = `
            <span class="exercise-icon">${exercise.icon}</span>
            <div class="exercise-name">${exercise.name}</div>
        `;
        
        grid.appendChild(card);
    });
    
    console.log('Exercise grid populated with', Object.keys(exercises).length, 'exercises');
}

function selectExercise(exerciseKey) {
    if (!exercises[exerciseKey]) {
        console.error('Invalid exercise key:', exerciseKey);
        return;
    }
    
    currentExercise = exerciseKey;
    
    // Set exercise mode based on selection
    if (exerciseKey === 'random_fun') {
        exerciseState.exerciseMode = 'random_fun';
        console.log('🎲 Random Fun Mode selected!');
    } else {
        exerciseState.exerciseMode = 'guided';
        console.log('💪 Guided Exercise Mode selected for:', exerciseKey);
    }
    
    // Update active states
    document.querySelectorAll('.exercise-card').forEach(card => {
        card.classList.remove('active');
        if (card.getAttribute('data-exercise') === exerciseKey) {
            card.classList.add('active');
        }
    });
    
    updateWorkoutInfo();
    
    console.log('Selected exercise:', exerciseKey);
}

function setupDifficultyButtons() {
    console.log('🔄 setupDifficultyButtons called');
    const buttons = document.querySelectorAll('.difficulty-btn');
    console.log('🔍 Found', buttons.length, 'difficulty buttons');
    if (buttons.length === 0) {
        console.error('❌ No difficulty buttons found in DOM');
        console.log('Available buttons:', document.querySelectorAll('button'));
        return;
    }
    
    buttons.forEach(btn => {
        btn.onclick = (event) => {
            event.preventDefault();
            const level = btn.dataset.level;
            if (!level) {
                console.error('Button missing data-level attribute');
                return;
            }
            
            // Enhanced debugging for difficulty selection
            console.log('🎯 DIFFICULTY BUTTON CLICKED:', level);
            console.log('🎯 Button text:', btn.textContent);
            console.log('🎯 Previous difficulty:', difficultyLevel);
            
            difficultyLevel = level;
            
            // Enhanced debugging after setting difficulty
            console.log('🎯 NEW difficulty set to:', difficultyLevel);
            console.log('🎯 Difficulty multipliers for', level, ':', difficultyMultipliers[level]);
            
            // Enhanced debugging for beginner selection
            if (level === 'beginner') {
                console.log(`🎯 BEGINNER DIFFICULTY SELECTED!`);
                console.log(`🎯 Gap Size Multiplier: ${difficultyMultipliers[level].gapSizeMultiplier}`);
                console.log(`🎯 Speed Multiplier: ${difficultyMultipliers[level].speedMultiplier}`);
                console.log(`🎯 Spacing Multiplier: ${difficultyMultipliers[level].spacingMultiplier}`);
            }
            
            // Update active states
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            updateWorkoutInfo();
            console.log('🎯 Updated workout info for difficulty:', level);
        };
    });
    
    // Set default selection
    difficultyLevel = 'intermediate';
    const defaultBtn = document.querySelector('.difficulty-btn[data-level="intermediate"]');
    if (defaultBtn) {
        defaultBtn.classList.add('active');
    }
    
    console.log('Difficulty buttons setup complete');
}

function updateWorkoutInfo() {
    const exercise = exercises[currentExercise];
    if (!exercise) {
        console.error('Exercise not found:', currentExercise);
        return;
    }
    
    const difficulty = exercise.difficulties[difficultyLevel];
    if (!difficulty) {
        console.error('Difficulty not found:', difficultyLevel, 'for exercise:', currentExercise);
        return;
    }
    
    const gameSettings = exerciseGameSettings[currentExercise];
    
    targetReps = difficulty.reps;
    
    // Update UI elements
    const elements = {
        selectedExercise: exercise.name,
        selectedReps: difficulty.reps,
        selectedPoints: difficulty.points,
        targetRepsDisplay: difficulty.reps,
        instructionText: gameSettings.description
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        } else {
            console.warn('Element not found:', id);
        }
    });
    
    console.log('Workout info updated:', exercise.name, difficulty.reps, 'reps,', difficulty.points, 'points');
}

function updateStats() {
    // Debug logging to ensure this function is called
    console.log('📊 Updating stats - Current reps:', currentReps, 'Target reps:', targetReps);
    
    const currentRepsEl = document.getElementById('currentRepsDisplay');
    const targetRepsEl = document.getElementById('targetRepsDisplay');
    const totalPointsEl = document.getElementById('totalPointsStats');
    const workoutStreakEl = document.getElementById('workoutStreakDisplay');
    
    if (currentRepsEl) currentRepsEl.textContent = currentReps;
    if (targetRepsEl) targetRepsEl.textContent = targetReps;
    if (totalPointsEl) totalPointsEl.textContent = totalPoints;
    if (workoutStreakEl) workoutStreakEl.textContent = workoutStreak;
    
    // Log what we're setting for debugging
    console.log('📊 Stats display updated:', {
        currentReps: currentReps,
        targetReps: targetReps,
        totalPoints: totalPoints,
        workoutStreak: workoutStreak
    });
}

function detectExerciseMovement(landmarks) {
    const exercise = exercises[currentExercise];
    let repCompleted = false;
    
    switch(exercise.detectMovement) {
        case 'pushupDetection':
            repCompleted = pushupDetection(landmarks);
            break;
        case 'squatDetection':
            repCompleted = squatDetection(landmarks);
            break;
        case 'jumpingJackDetection':
            repCompleted = jumpingJackDetection(landmarks);
            break;
        case 'lungeDetection':
            repCompleted = lungeDetection(landmarks);
            break;
        case 'plankDetection':
            if (plankDetection(landmarks)) {
                // For plank, count time instead of reps
                const currentTime = Date.now();
                if (currentTime - exerciseStartTime >= 1000) { // Every second
                    currentReps++;
                    exerciseStartTime = currentTime;
                    updateStats();
                }
            }
            break;
        case 'mixedDetection':
            // For random fun mode, accept any significant movement as a rep
            repCompleted = mixedMovementDetection(landmarks);
            break;
    }
    
    if (repCompleted) {
        currentReps++;
        pushupCount++; // Also update pushupCount for game stats
        console.log('🎉 REP COMPLETED! Current reps:', currentReps, 'Push-ups:', pushupCount);
        console.log('🎯 Progress:', Math.floor((currentReps / targetReps) * 100) + '%');
        updateStats();
        
        // Force update the instruction display immediately
        const progress = Math.floor((currentReps / targetReps) * 100);
        const instructionText = document.getElementById('instructionText');
        if (instructionText) {
            instructionText.textContent = `💪 Great rep! (${currentReps}/${targetReps}) - ${progress}%`;
        }
        
        // Check if workout is complete
        if (currentReps >= targetReps) {
            console.log('🏆 WORKOUT COMPLETE!');
            completeWorkout();
        }
    }
}

function completeWorkout() {
    const exercise = exercises[currentExercise];
    const difficulty = exercise.difficulties[difficultyLevel];
    
    // Calculate earned points based on completion percentage
    const completionPercent = Math.min(100, (currentReps / targetReps) * 100);
    const earnedPoints = Math.floor((difficulty.points * completionPercent) / 100);
    const workoutTime = Math.floor((Date.now() - exerciseStartTime) / 1000);
    
    totalPoints += earnedPoints;
    if (currentReps >= targetReps) {
        workoutStreak++; // Only increment streak if target was met
    }
    
    // Update UI
    document.getElementById('gameOverlay').style.display = 'flex';
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    
    document.getElementById('completedExercise').textContent = exercise.name;
    document.getElementById('finalReps').textContent = currentReps;
    document.getElementById('earnedPoints').textContent = earnedPoints;
    document.getElementById('totalPointsDisplay').textContent = totalPoints;
    document.getElementById('workoutTime').textContent = workoutTime;
    
    // Update stats displays
    updateStats();
    
    // Check for achievements
    checkAchievements();
}

function checkAchievements() {
    const achievementDisplay = document.getElementById('achievementDisplay');
    const achievementText = document.getElementById('achievementText');
    
    if (workoutStreak === 5) {
        achievementDisplay.style.display = 'block';
        achievementText.textContent = 'Consistency Champion - 5 workouts in a row!';
    } else if (totalPoints >= 100) {
        achievementDisplay.style.display = 'block';
        achievementText.textContent = 'Century Club - 100+ total points!';
    } else if (currentReps > targetReps * 1.5) {
        achievementDisplay.style.display = 'block';
        achievementText.textContent = 'Overachiever - 150% of target reps!';
    }
}


function startWorkout() {
    console.log('🚀 STARTING WORKOUT FUNCTION CALLED!');
    console.log('🚀 Current difficulty level:', difficultyLevel);
    console.log('🚀 Current exercise:', currentExercise);
    console.log('🚀 Difficulty multipliers:', difficultyMultipliers[difficultyLevel]);
    
    // Add visual feedback that button was clicked
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        startBtn.textContent = 'Starting...';
        setTimeout(() => {
            if (startBtn.textContent === 'Starting...') {
                startBtn.style.background = 'linear-gradient(135deg, #00ff88, #00b4d8)';
                startBtn.textContent = 'Start Workout';
            }
        }, 2000);
    }
    
    // Enhanced debugging for beginner difficulty
    if (difficultyLevel === 'beginner') {
        console.log(`🚀 STARTING BEGINNER WORKOUT!`);
        console.log(`🚀 Exercise: ${currentExercise}`);
        console.log(`🚀 Gap Size will be: ${difficultyMultipliers[difficultyLevel].gapSizeMultiplier}x larger`);
        console.log(`🚀 Speed will be: ${difficultyMultipliers[difficultyLevel].speedMultiplier}x slower`);
        console.log(`🚀 Spacing will be: ${difficultyMultipliers[difficultyLevel].spacingMultiplier}x more time between obstacles`);
    }
    
    currentReps = 0;
    exerciseStartTime = Date.now();
    lastPosition = currentExercise === 'jumpingjacks' ? 'closed' : 'up';
    faceDetected = false;
    gameStartTime = Date.now(); // Initialize game timer
    gameElapsedTime = 0;
    
    // Initialize exercise state for new workout
    const startTime = Date.now();
    exerciseState = {
        currentPhase: 'up',
        phaseStartTime: startTime,
        phaseCompletedCount: 0,
        nextObstacleType: 'down', // Start with asking to go down
        waitingForPhaseCompletion: false,
        lastObstacleCreated: startTime, // CRITICAL: Set to current time to prevent immediate creation
        exerciseMode: 'guided' // Default to guided mode
    };
    
    document.getElementById('gameOverlay').style.display = 'none';
    const instructionText = document.getElementById('instructionText');
    if (instructionText) {
        instructionText.textContent = '📸 Position yourself in camera view - Let\'s do this! 💪';
    }
    
    updateStats();
    updateTimer(); // Start the timer
    gameRunning = true;
    startGame(); // Call startGame instead of just gameLoop
}

// Function to toggle between guided and random fun mode
function toggleExerciseMode() {
    if (exerciseState.exerciseMode === 'guided') {
        exerciseState.exerciseMode = 'random_fun';
        console.log('Switched to Random Fun Mode! 🎉');
    } else {
        exerciseState.exerciseMode = 'guided';
        console.log('Switched to Guided Exercise Mode 💪');
    }
    
    // Reset obstacle state when switching modes
    exerciseState.waitingForPhaseCompletion = false;
    exerciseState.lastObstacleCreated = 0;
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing...');
    
    // Add visual feedback for camera status
    const instructionText = document.getElementById('instructionText');
    if (instructionText) {
        instructionText.textContent = '🔄 Initializing camera and pose detection...';
    }
    
    // Wait a bit for MediaPipe libraries to fully load
    setTimeout(() => {
        try {
            initializeGame();
            initializeExerciseUI();
            console.log('All systems initialized successfully');
            
            if (instructionText) {
                instructionText.textContent = '✅ Camera ready! Select an exercise to begin';
            }
        } catch (error) {
            console.error('Error during initialization:', error);
            if (instructionText) {
                instructionText.textContent = '❌ Camera initialization failed. Check console for details.';
            }
            // Try to at least get the UI working
            try {
                initializeExerciseUI();
            } catch (uiError) {
                console.error('Failed to initialize UI:', uiError);
            }
        }
    }, 1000); // Give MediaPipe libs time to load
});

// Also try DOMContentLoaded in case load event has issues
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking initialization...');
    try {
        // Force UI initialization regardless
        initializeExerciseUI();
        
        // Double check after delay
        setTimeout(() => {
            const exerciseGrid = document.getElementById('exerciseGrid');
            if (exerciseGrid && exerciseGrid.children.length === 0) {
                console.log('Exercise grid empty, forcing re-initialization...');
                initializeExerciseUI();
            }
        }, 1000);
    } catch (error) {
        console.error('Error during DOM initialization:', error);
    }
});

// Force initialization on any interaction
document.addEventListener('click', (e) => {
    const exerciseGrid = document.getElementById('exerciseGrid');
    if (exerciseGrid && exerciseGrid.children.length === 0) {
        console.log('Click detected with empty grid, initializing...');
        initializeExerciseUI();
    }
}, { once: true });

// Debug function to check current difficulty level
window.checkDifficulty = function() {
    console.log('🎯 CURRENT DIFFICULTY CHECK:');
    console.log('🎯 difficultyLevel variable:', difficultyLevel);
    console.log('🎯 Current exercise:', currentExercise);
    console.log('🎯 Difficulty multipliers:', difficultyMultipliers[difficultyLevel]);
    
    // Check which button is active
    const activeBtn = document.querySelector('.difficulty-btn.active');
    console.log('🎯 Active button:', activeBtn ? activeBtn.textContent : 'None');
    console.log('🎯 Active button data-level:', activeBtn ? activeBtn.dataset.level : 'None');
    
    console.log(`Current Difficulty Status:`);
    console.log(`Variable: ${difficultyLevel}`);
    console.log(`Active Button: ${activeBtn ? activeBtn.textContent : 'None'}`);
    console.log(`Button data-level: ${activeBtn ? activeBtn.dataset.level : 'None'}`);
    console.log(`Multipliers:`);
    console.log(`Gap Size: ${difficultyMultipliers[difficultyLevel].gapSizeMultiplier}x`);
    console.log(`Speed: ${difficultyMultipliers[difficultyLevel].speedMultiplier}x`);
    console.log(`Spacing: ${difficultyMultipliers[difficultyLevel].spacingMultiplier}x`);
};

// Debug function to test button functionality
window.testButtons = function() {
    console.log('🧪 TESTING BUTTON FUNCTIONALITY');
    
    // Test exercise buttons
    const exerciseCards = document.querySelectorAll('.exercise-card');
    console.log('📋 Exercise cards found:', exerciseCards.length);
    exerciseCards.forEach((card, index) => {
        console.log(`  Card ${index}:`, card.dataset.exercise, card.onclick ? 'Has onclick' : 'No onclick');
    });
    
    // Test difficulty buttons
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    console.log('🎯 Difficulty buttons found:', difficultyBtns.length);
    difficultyBtns.forEach((btn, index) => {
        console.log(`  Button ${index}:`, btn.dataset.level, btn.onclick ? 'Has onclick' : 'No onclick');
    });
    
    // Test start button
    const startBtn = document.querySelector('.start-btn');
    console.log('🚀 Start button:', startBtn ? 'Found' : 'Not found');
    if (startBtn) {
        console.log('  Start button onclick:', startBtn.onclick ? 'Has onclick' : 'No onclick');
        console.log('  Start button text:', startBtn.textContent);
    }
    
    // Test overlay visibility
    const overlay = document.getElementById('gameOverlay');
    const startScreen = document.getElementById('startScreen');
    console.log('🎭 Overlay display:', overlay ? overlay.style.display : 'Element not found');
    console.log('🎬 Start screen display:', startScreen ? startScreen.style.display : 'Element not found');
};

// Force button reinitialization
window.forceButtonInit = function() {
    console.log('🔄 FORCING BUTTON REINITIALIZATION');
    try {
        initializeExerciseUI();
        console.log('✅ Button reinitialization complete');
    } catch (error) {
        console.error('❌ Error during reinitialization:', error);
    }
};

