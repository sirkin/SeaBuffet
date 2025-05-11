// Pelican Buffet! is a Flappy Birds inspired game controlled by mouse or usb serial
// Original game is yoruk's instructable plus graphics from http://www.vecteezy.com/
// https://www.instructables.com/How-to-control-a-simple-Processing-game-with-Ardui/
// wannapa kaewluan's artwork https://www.vecteezy.com/members/110443970420071647799

// ---------------------------------------------------------------------------------
// Game states
// ---------------------------------------------------------------------------------

const GameState = {
  WELCOME: 'welcome',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameOver'
};
let gameState = GameState.WELCOME;

// ---------------------------------------------------------------------------------
// Global variables
// ---------------------------------------------------------------------------------

let virtualWidth = 800;
let virtualHeight = 450;
let scaleFactor;

let motionAllowed = false;
let isPressed;

let bgCloudCt = 2;
let fgCloudCt = 2;

let bgCloudX = new Array(bgCloudCt);
let bgCloudY = new Array(bgCloudCt);
let bgCloudAlpha = new Array(bgCloudCt);
let fgCloudX = new Array(fgCloudCt);
let fgCloudY = new Array(fgCloudCt);
let fgCloudAlpha = new Array(fgCloudCt);

let fish;
let puffer;
let angel;
let fishX;
let fishY;
let fishSpeed;

let bird;
let birdX;
let birdY;
let birdSpeed; 
let birdVisible;
let birdCooldown = 300;

let hitOffset = 0;
let targetHitOffset = 0;

let pelican;
let pelicanX;
let pelicanY;
let pitch; 
let pitchRad;
let pitchSin;
let pitchCos;

let oxygen = 1; 
let oxyLossRate = 0.003; 
let oxyGainRate = 0.01; 
let oxyDepleted; 
let oxyCooldown = 60; 
let oxyBarColor; 
let lowOxyColor; 

let sea; 
let seaX = 0; 

let motionX = 0;
let motionY = 0;
let score = 0; 

/////////////////

let y;
//let motionAllowed = false;
let motionButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  y = height / 2;
  background(220);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(0);

  createMotionButton(); // separate function to create the button
}

function draw() {
  background(220);

  if (motionAllowed) {
    let tilt = rotationX || 0;
    y = map(tilt, -90, 90, 0, height);
  }

  fill(100, 200, 255);
  ellipse(width / 2, y, 50);
  fill(0);
  text("rotationX: " + nf(rotationX, 1, 2), width / 2, 30);
}

function createMotionButton() {
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    motionButton = createButton('Enable Motion');
    motionButton.position(width / 2 - 60, height / 2);
    motionButton.mousePressed(requestMotionPermission);
  } else {
    motionAllowed = true;
  }
}

function requestMotionPermission() {
  DeviceMotionEvent.requestPermission()
    .then(response => {
      if (response === 'granted') {
        motionAllowed = true;
        motionButton.remove();
      } else {
        alert('Permission denied');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error requesting motion permission');
    });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/////////////////

/*
// ---------------------------------------------------------------------------------
// Setup & initialize
// ---------------------------------------------------------------------------------

function preload() { 
  cloud = loadImage("assets/cloud.png"); 
  pelican = loadImage("assets/pelican.png"); 
  bird = loadImage("assets/bird.png"); 
  puffer = loadImage("assets/puffer.png"); 
  angel = loadImage("assets/angel.png"); 
  sea = loadImage("assets/sea.png"); 
  arrow = loadImage("assets/arrow.png"); 
} 

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);

  imageMode(CENTER); 
  noStroke(); 

  oxyBarColor = color(109, 172, 204); 
  lowOxyColor = color(215, 120, 120); 

  for (let i = 0; i < bgCloudCt; i++) resetCloud(i, true, true); 
  for (let i = 0; i < fgCloudCt; i++) resetCloud(i, true, false); 
  
  setupGame(); 
} 

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function stopMotion() {
  pitch = 0; 
  pitchCos = 0; 
  pitchSin = 0;
}

function setupGame() { 
  pelicanX = virtualWidth / 3; 
  pelicanY = virtualHeight / 2; 

  oxygen = 1; 
  oxyDepleted = false; 
  oxyCooldown = 60; 
  
  resetBird(); 
  resetFish(); 

  stopMotion();
  score = 0; 
}

// ---------------------------------------------------------------------------------
// Main state machine
// ---------------------------------------------------------------------------------

window.addEventListener('deviceorientation', (event) => {
  if (motionAllowed) {
    rotationX = event.beta; // Or event.gamma, depending on device orientation
  }
});

function draw() {
  background(0);

  // Determine scale factor
  scaleFactor = min(width / virtualWidth, height / virtualHeight);
  translate((width - virtualWidth * scaleFactor) / 2, (height - virtualHeight * scaleFactor) / 2);
  scale(scaleFactor);
  
  // Apply clipping to virtual screen bounds
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, virtualWidth, virtualHeight);
  drawingContext.clip();

  if (motionAllowed) {
    let tiltY = rotationX || 0;
    posY = map(tiltY, -90, 90, 0, height);
  } else {
    posY = mouseY;
  }

  // if (frameCount % 60 == 0) println(frameRate);
  switch (gameState) {
    case GameState.WELCOME: 
      drawWelcomeScene();
      break; 
    case GameState.PLAYING: 
      drawGameScene(); 
      break; 
    case GameState.PAUSED:
      drawPauseScene(); 
      break; 
    case GameState.GAMEOVER: 
      drawGameOverScene(); 
      break;
  }
  drawingContext.restore();
}

// ---------------------------------------------------------------------------------
// Mobile permission
// ---------------------------------------------------------------------------------

function requestMotion() {
  if (typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function') {
  DeviceMotionEvent.requestPermission()
    .then(response => {
      if (response === 'granted') {
        //alert('Permission granted');
        //console.log('Motion permission granted');
        motionAllowed = true;
      } else {
        console.warn('Motion permission denied');
        //alert('Permission denied');
        motionAllowed = false;
      }
    })
    .catch(err => {
      console.error(err);
      //alert('Error requesting motion permission');
    });
  } else {
    motionAllowed = true;
  }
}

function requestFullscreen() {
  let canvas = document.querySelector('canvas');
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen().catch(err => {
      console.warn('Fullscreen request failed:', err);
    });
  }
}

// ---------------------------------------------------------------------------------
// User interaction
// ---------------------------------------------------------------------------------

function mousePressed() { 
  isPressed = true; 
} 

function mouseReleased() {
  switch (gameState) {  
    case GameState.WELCOME:
      if (isInsideButton(mouseX, mouseY, virtualWidth / 2, virtualHeight / 2 + 50)) {
        if (!motionAllowed) {
          requestMotion();
        }
        gameState = GameState.PLAYING;
      }
      break;
    case GameState.PLAYING:
      //gameState = GameState.PAUSED;
      break;
    case GameState.PAUSED:
      if (isInsideButton(mouseX, mouseY, virtualWidth / 2, virtualHeight / 2 + 50)) {
        gameState = GameState.PLAYING;
      }
      break;
    case GameState.GAMEOVER:
      if (isInsideButton(mouseX, mouseY, virtualWidth / 2, virtualHeight / 2 + 50)) {
        gameState = GameState.WELCOME;
        setupGame();
      }
      break;
  }
} 

function touchStarted() {
  mousePressed();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}

function isInsideButton(mx, my, centerX, topY, btnW = 150, btnH = 50) {
  let sx = (windowWidth - virtualWidth * scaleFactor) / 2 + (centerX - btnW / 2) * scaleFactor;
  let sy = (windowHeight - virtualHeight * scaleFactor) / 2 + topY * scaleFactor;
  let sw = btnW * scaleFactor;
  let sh = btnH * scaleFactor;
  return mx >= sx && mx <= sx + sw && my >= sy && my <= sy + sh;
}

function drawButton(label, centerX, topY, btnW = 150, btnH = 50) {
  let isHovering = isInsideButton(mouseX, mouseY, centerX, topY, btnW, btnH);
  let baseColor = color(255, 75);
  let hoverColor = color(255, 125);
  let pressedColor = color(255, 175);

  if (isHovering && isPressed) {
    fill(pressedColor);
  } else if (isHovering) {
    fill(hoverColor);
  } else {
    fill(baseColor);
  }
  rect(centerX - btnW / 2, topY, btnW, btnH, 5);

  textSize(20);
  fill(255);
  textAlign(CENTER, CENTER);
  text(label, centerX, topY + btnH / 2);
}

// ---------------------------------------------------------------------------------
// Draw states' scenes
// ---------------------------------------------------------------------------------

function drawWelcomeScene() {
  drawSkyGradient(); // background(135, 206, 235);
  textAlign(CENTER); 

  drawBgClouds(false); 
  drawFgClouds(false); 
  drawSea(125); 

  fill(0, 85); 
  rect(50, 50, virtualWidth - 100, virtualHeight - 100, 10); 

  textSize(64); 
  fill(255, 215, 0); 
  text("pelican buffet!", virtualWidth / 2, virtualHeight / 4); 

  textSize(32); 
  fill(255); 
  text("eat fish, breathe, avoid birds", virtualWidth / 2, virtualHeight / 3 + 15); 

  textSize(24); 
  fill(255); 
  text("game ends when you're out of breath", virtualWidth / 2, virtualHeight / 2); 
  
  drawButton("start", virtualWidth / 2, virtualHeight / 2 + 50);
  textAlign(LEFT);
} 

function drawGameScene() {
  drawSkyGradient(); // background(135, 206, 235);
 
  pitch = constrain(posY - height / 2, - 75, 75); 
  pitchRad = radians(pitch); 
  pitchSin = sin(pitchRad); 
  pitchCos = cos(pitchRad); 

  hitOffset = lerp(hitOffset, targetHitOffset, 0.05); 
  targetHitOffset = lerp(targetHitOffset, 0, 0.02); 

  if (pelicanY > virtualHeight / 3 + pelican.height / 4) { 
    oxygen = max(oxygen - oxyLossRate, 0); 
  } else { 
    oxygen = min(oxygen + oxyGainRate, 1); 
  } 

  if (!oxyDepleted && oxygen <= 0) { 
    oxyDepleted = true; oxyCooldown = 60; 
  } 
  if (oxyDepleted) { 
    oxyCooldown--; 
    if (oxyCooldown <= 0) { 
      gameState = GameState.GAMEOVER; 
    } 
  } 
  drawSea(125); 
  drawBgClouds(false); 

  drawFish(); 
  drawPelican(); 
  drawBird(); 

  drawSea(100); 
  drawFgClouds(false); 

  drawProgress();
} 

function drawPauseScene() {
  drawSkyGradient(); // background(135, 206, 235);
  textAlign(CENTER);

  drawSea(125); 
  drawBgClouds(false); 
  
  drawFish(); 
  drawPelican(); 
  drawBird(); 
  
  drawSea(100); 
  drawFgClouds(false); 
  
  drawProgress(); 
  
  fill(0, 85); 
  rect(50, 50, virtualWidth - 100, virtualHeight - 100, 10); 

  textSize(24);
  fill(255);
  drawButton("resume", virtualWidth / 2, virtualHeight / 2 + 50);
  textAlign(LEFT); 

  stopMotion();
} 

function drawGameOverScene() {
  drawSkyGradient(); // background(135, 206, 235);
  textAlign(CENTER); 
  
  drawBgClouds(false); 
  drawFgClouds(false); 
  drawSea(125);
  
  fill(0, 85); 
  rect(50, 50, virtualWidth - 100, virtualHeight - 100, 10); 
  
  textSize(64); 
  fill(255, 215, 0); 
  text("game over", virtualWidth / 2, virtualHeight / 4); 
  
  textSize(32); 
  fill(255);
  let point = score == 1 ? " point" : " points"; 
  text("your score is " + score + point, virtualWidth / 2, virtualHeight / 3 + 15); 

  textSize(24); 
  fill(255); 
  drawButton("restart", virtualWidth / 2, virtualHeight / 2 + 50);
  textAlign(LEFT); 

  stopMotion();
}

// ---------------------------------------------------------------------------------
// Draw individual features
// ---------------------------------------------------------------------------------

function drawSkyGradient() {
  let skyGradient = drawingContext.createLinearGradient(0, 0, 0, virtualHeight);
  skyGradient.addColorStop(0, "rgb(120, 190, 225)");
  skyGradient.addColorStop(0.5, "rgb(155, 206, 255)");
  skyGradient.addColorStop(1, "rgb(135, 135, 135)");
  drawingContext.fillStyle = skyGradient;
  rect(0, 0, virtualWidth, virtualHeight);
}

function resetBird() {
  birdX = virtualWidth + bird.width / 2;
  birdY = random(bird.height / 2, virtualHeight / 3 - bird.height / 2);
  birdSpeed = random(4, 6) + score / 4;
}

function drawBird() {
  if (!birdVisible) {
    birdCooldown--; if (birdCooldown <= 0) {
      birdVisible = true; resetBird();
    } return;
  }
  let d = dist(virtualWidth / 3 + 20, pelicanY, birdX, birdY);

  if (d < bird.width && hitOffset <= 1) {
    targetHitOffset = 100; score = max(score - 1, 0);
  }

  birdX -= pitchCos * birdSpeed;
  let freq = 0.1 + sin(frameCount * 0.005) * 0.05; // Frequency
  let amp = 1.5 + cos(frameCount * 0.007) * 0.5; // Amplitude
  birdY += sin(frameCount * freq) * amp; 
  birdY = constrain(birdY, bird.height / 2, virtualHeight / 3 - bird.height / 2); 
  
  if (birdX < - bird.width / 2) {
    birdVisible = false; // Adjust cooldown based on score up to 10
    let upper = map(score, 0, 10, 600, 300); 
    let lower = map(score, 0, 10, 300, 0); 
    upper = constrain(upper, 300, 600); 
    lower = constrain(lower, 0, 300); 
    birdCooldown = int(random(lower, upper));
  } 
  image(bird, birdX, birdY);
} 

function resetFish() { 
  fish = random(1) < 0.5 ? angel : puffer; fishX = virtualWidth + fish.width / 2; 
  fishY = random(virtualHeight / 2, virtualHeight - fish.height / 2); 
  fishSpeed = random(4, 6) + score / 3; 
} 

function drawFish() {
  let d = dist(virtualWidth / 3 + 20, pelicanY, fishX, fishY); 
  if (d < fish.width / 2) { 
    resetFish(); 
    score++; 
  } 
  fishX -= pitchCos * fishSpeed; 
  if (fishX < - fish.width / 2) { 
    resetFish(); 
  } 
  let wobble = sin(frameCount * 0.2 + fishX * 0.05) * 3; 
  //float input = frameCount * 0.02 + fishX * 0.01;
  //float wobble = (noise(input) - 0.5) * 20;  // Range about -3 to +3 px
  image(fish, fishX, fishY + wobble);
}

function drawPelican() {
  let accel = pitch > 0 ? pitch * 0.1 : 0;
  pelicanY += pitchSin * 5 + accel;
  pelicanY = constrain(pelicanY, 0, virtualHeight);

  push();
  translate(pelicanX - hitOffset, pelicanY);
  rotate(pitchRad);
  image(pelican, 0, 0);
  pop();
}

function resetCloud(i, initial, isBg) {
  let resetX = initial ? random(virtualWidth) : virtualWidth + cloud.width / 2;
  if (isBg) {
    bgCloudX[i] = resetX;
    bgCloudY[i] = random(virtualHeight / 5);
    bgCloudAlpha[i] = random(100, 150);
  } else {
    fgCloudX[i] = resetX;
    fgCloudY[i] = random(virtualHeight / 5);
    fgCloudAlpha[i] = random(200, 255);
  }
}

function drawBgClouds(initial) {
  for (let i = 0; i < bgCloudCt; i++) {
    tint(255, bgCloudAlpha[i] - (initial ? 100 : 0));
    image(cloud, bgCloudX[i], bgCloudY[i], cloud.width / 2, cloud.height / 2);
    bgCloudX[i] -= (gameState != GameState.PLAYING ? 0.05 : pitchCos) * (2 + i);
    if (bgCloudX[i] < - cloud.width / 4) {
      resetCloud(i, initial, true);
    }
  } noTint();
}

function drawFgClouds(initial) {
  for (let i = 0; i < fgCloudCt; i++) {
    tint(255, fgCloudAlpha[i] - (initial ? 100 : 0));
    image(cloud, fgCloudX[i], fgCloudY[i]);
    fgCloudX[i] -= (gameState != GameState.PLAYING ? .05 : pitchCos) * (5 + i);
    if (fgCloudX[i] < - cloud.width / 2) {
      resetCloud(i, initial, false);
    }
  }
  noTint();
}

function drawSeas(alpha) {
  let seaHeight = virtualHeight / 3;
  let seaWidth = (sea.width / sea.height) * seaHeight; // maintain image aspect ratio

  seaX = (seaX - pitchCos * 3) % seaWidth;

  tint(255, alpha);
  for (let i = 0; i < 2; i++) {
    image(
      sea,
      seaX + seaWidth * i + seaWidth / 2,
      virtualHeight - seaHeight / 2,
      seaWidth,
      seaHeight
    );
  }
  noTint();
}

function drawSea(alpha) {
  // Scroll and wrap 2 instances of the sea
  seaX = (seaX - pitchCos * 3) % sea.width;

  // Draw 2 instances to wrap horizontally
  tint(255, alpha);
  for (let i = 0; i < 2; i++) {
    image(sea, seaX + sea.width * i + sea.width / 2, virtualHeight - sea.height / 2);
  }
  noTint();
}

function drawOxygenBar(x, y) {
  let fillColor;
  let barWidth = 200;
  let barHeight = 10;

  fill(255, 150);
  rect(x - 1, y - 1, barWidth + 2, barHeight + 2);
  if (oxygen >= 0.5) {
    fillColor = oxyBarColor;
  } else {
    let t = map(oxygen, 0.35, 0.25, 0, 1);
    fillColor = lerpColor(oxyBarColor, lowOxyColor, t);
  }
  fill(fillColor);
  rect(x, y, barWidth * oxygen, barHeight);
}

function drawProgress() {
  fill(0, 25);
  rect(0, 0, virtualWidth, 30);

  fill(255);
  textSize(16);
  text("oxygen:", 10, 20);

  drawOxygenBar(75, 10);

  fill(255);
  textSize(16);
  text("score: " + score, virtualWidth - 70, 20);
}
*/