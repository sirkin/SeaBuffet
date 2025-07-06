// Pelican Buffet! is a Flappy Birds inspired game controlled by mouse or usb serial

// Original game is yoruk's instructable with graphics from http://www.vecteezy.com/
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
let virtualHeight = 600;
let scaleFactor;

let isPressed;

let bgCloudCt = 3;
let fgCloudCt = 3;
let cloud;
let bgCloudX = new Array(bgCloudCt);
let bgCloudY = new Array(bgCloudCt);
let bgCloudAlpha = new Array(bgCloudCt);
let fgCloudX = new Array(fgCloudCt);
let fgCloudY = new Array(fgCloudCt);
let fgCloudAlpha = new Array(fgCloudCt);

let fish;
let puffer;
let angel;
let fishX
let fishY;
let fishSpeed;

let bird;
let birdX;
let birdY;
let birdSpeed;
let birdVisible;
let birdCooldown = 240;
let hitOffset = 0;
let targetHitOffset = 0;

let pelican;
let pelicanX;
let pelicanY;
let pitch;
let pitchRad;
let pitchSin;
let pitchCos;

let sea;
let seaX = 0;

let oxygen = 1;
let oxyLossRate = 0.003;
let oxyGainRate = 0.01;
let oxyDepleted = false;
let oxyCooldown = 60;
let barColor;
let lowOxyColor;

let flying;
let diving;
let hit;
let swallow;
let seagull;
let masterVol = 0.2;
let flyingVol = masterVol;
let divingVol = 0;
let volChgRate = 0.05;

let score; 

let ct = 0;

// ---------------------------------------------------------------------------------
// Setup & initialize
// ---------------------------------------------------------------------------------

function preload() {
  cloud = loadImage("assets/cloud.png");
  bird = loadImage("assets/bird.png");
  pelican = loadImage("assets/pelican.png");
  puffer = loadImage("assets/puffer.png");
  angel = loadImage("assets/angel.png");
  sea = loadImage("assets/sea.png");

  flying = loadSound("assets/flying.wav" );
  diving = loadSound("assets/diving.wav" );
  hit = loadSound("assets/hit.wav" );
  swallow = loadSound("assets/swallow.wav" );
  seagull = loadSound("assets/seagull.wav" );
}

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);

  background(0);
  imageMode(CENTER); 
  noStroke(); 

  for (let i = 0; i< bgCloudCt; i++) resetCloud(i, true, true);
  for (let i = 0; i< fgCloudCt; i++) resetCloud(i, true, false);
  
  pelicanX = virtualWidth / 3;
  pelicanY = virtualHeight / 2;

  barColor = color(109, 172, 204);
  lowOxyColor = color(215, 120, 120);
  
  resetGame();
}

function resetGame() {
  oxygen = 1;
  oxyDepleted = false;
  oxyCooldown = 60;

  resetBird();
  resetFish();

  stopMotion();
  score = 0;
}

function stopMotion() {
  pitch = 0 ;
  pitchCos = 0 ;
  pitchSin = 0 ;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ---------------------------------------------------------------------------------
// Main state machine
// ---------------------------------------------------------------------------------
function draw ( ) {
  // if (frameCount % 60 == 0) println(frameRate);

  // Determine scale factor
  scaleFactor = min(width / virtualWidth, height / virtualHeight);
  translate((width - virtualWidth * scaleFactor) / 2, (height - virtualHeight * scaleFactor) / 2);
  scale(scaleFactor);
  
  // Apply clipping to virtual screen bounds
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, virtualWidth, virtualHeight);
  drawingContext.clip();

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
// User interaction
// ---------------------------------------------------------------------------------

function keyPressed() {
  if (key === ' ') {
    switch (gameState) {  
      case GameState.WELCOME:
        gameState = GameState.PLAYING;
        break;
      case GameState.PLAYING:
        gameState = GameState.PAUSED;
        break;
      case GameState.PAUSED:
        gameState = GameState.PLAYING;
        break;
      case GameState.GAMEOVER:
        gameState = GameState.WELCOME;
        resetGame();
        break;
    }
  }
  if (key === 'q') {
    noLoop();
  }
}

function mousePressed() { 
  isPressed = true; 
} 

function mouseReleased() {
  switch (gameState) {  
    case GameState.WELCOME:
      if (isInsideButton(mouseX, mouseY, virtualWidth / 2, virtualHeight * 2 / 3)) {
        gameState = GameState.PLAYING;
        resetGame();
        loopAudio();
      }
      break;
    case GameState.PLAYING:
      gameState = GameState.PAUSED;
      break;
    case GameState.PAUSED:
      gameState = GameState.PLAYING;
      break;
    case GameState.GAMEOVER:
      if (isInsideButton(mouseX, mouseY, virtualWidth / 2, virtualHeight * 2 / 3)) {
        gameState = GameState.WELCOME;
        resetGame();
      }
      break;
  }
  isPressed = false;
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
// Draw 4 states' scenes
// ---------------------------------------------------------------------------------

function drawWelcomeScene() {
  drawSkyGradient(); // background(135, 206, 235);

  drawBgClouds(false); 
  drawFgClouds(false); 
  drawSea(250); // 150

  fill(0, 85); 
  rect(50, 50, virtualWidth - 100, virtualHeight - 100, 10); 

  textAlign(CENTER);
  textSize(64); 
  fill(255, 215, 0); 
  text("pelican buffet!", virtualWidth / 2, virtualHeight / 4); 

  textSize(32); 
  fill(255); 
  text("eat fish, breathe, avoid birds", virtualWidth / 2, virtualHeight / 3 + 15); 

  textSize(24); 
  fill(255); 
  text("game ends when you're out of breath", virtualWidth / 2, virtualHeight / 2); 
  
  drawButton("start game", virtualWidth / 2, virtualHeight * 2 / 3);
  textAlign(LEFT);
} 

function drawGameScene() {
  drawSkyGradient(); // background(135, 206, 235);
 
  pitch = constrain(mouseY - height / 2, - 75, 75); 
  pitchRad = radians(pitch); 
  pitchSin = sin(pitchRad); 
  pitchCos = cos(pitchRad); 

  // Bounce back and slower return after hitting bird
  hitOffset = lerp(hitOffset, targetHitOffset, 0.05); 
  targetHitOffset = lerp(targetHitOffset, 0, 0.02); 

  // Update oxygen and play ambient audio for flying vs diving
  if (pelicanY > virtualHeight - sea.height + pelican.height / 4) { 
    oxygen = max(oxygen - oxyLossRate, 0);
    playDivingAudio();
  } else { 
    oxygen = min(oxygen + oxyGainRate, 1);
    playFlyingAudio();
  } 

  // Check for oxygen depletion and manage cooldown
  if ( oxygen <= 0 ) {
    if (!oxyDepleted) {
      oxyDepleted = true;
      oxyCooldown = 60; // Start cooldown (1 sec at 60 fps)
    }
  } else {
    oxyDepleted= false; // Oxygen regained, reset depletion
  }
  if (oxyDepleted) { 
    oxyCooldown--; 
    if (oxyCooldown <= 0) { 
      gameState = GameState.GAMEOVER;
      seagull.play();
    } 
  } 
  drawSea(250); // 150 
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

  drawSea(250); // 150
  drawBgClouds(false); 
  
  drawFish(); 
  drawPelican(); 
  drawBird(); 
  
  drawSea(100); 
  drawFgClouds(false); 
  
  drawProgress(); 
  
  fill(0, 85); 
  rect(50, 50, virtualWidth - 100, virtualHeight - 100, 10); 

  textAlign(CENTER);
  textSize(32); 
  fill(255); 
  text("click to resume game", virtualWidth / 2, virtualHeight / 3 + 15); 
  textAlign(LEFT); 

  muteAudio();
  stopMotion();
} 

function drawGameOverScene() {
  drawSkyGradient(); // background(135, 206, 235);
  
  drawBgClouds(false); 
  drawFgClouds(false); 
  drawSea(250); // 150
  
  fill(0, 85); 
  rect(50, 50, virtualWidth - 100, virtualHeight - 100, 10); 

  textAlign(CENTER); 
  textSize(64); 
  fill(255, 215, 0); 
  text("game over", virtualWidth / 2, virtualHeight / 4); 
  
  textSize(32); 
  fill(255);
  let point = score == 1 ? " point" : " points"; 
  text("your score is " + score + point, virtualWidth / 2, virtualHeight / 3 + 15); 

  textSize(24); 
  fill(255); 
  drawButton("restart game", virtualWidth / 2, virtualHeight * 2 / 3);
  textAlign(LEFT); 

  stopMotion();
  playFlyingAudio();
}

// ---------------------------------------------------------------------------------
// Draw individual features
// ---------------------------------------------------------------------------------

function drawSkyGradient() {
  let skyGradient = drawingContext.createLinearGradient(0, 0, 0, virtualHeight);
  skyGradient.addColorStop(0, "rgb(120, 190, 225)");
  skyGradient.addColorStop(0.5, "rgb(155, 206, 255)");
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
      birdVisible = true;
      resetBird();
    } return;
  }
  let d = dist(virtualWidth / 3 + 20, pelicanY, birdX, birdY);

  if (d < bird.width && hitOffset <= 1) {
    targetHitOffset = 100;
    hit.play();
    score = max(score - 1, 0);
  }

  birdX -= pitchCos * birdSpeed;
  let freq = 0.1 + sin(frameCount * 0.005) * 0.05; // Frequency
  let amp = 1.5 + cos(frameCount * 0.007) * 0.5; // Amplitude
  birdY += sin(frameCount * freq) * amp; 
  birdY = constrain(birdY, bird.height / 2, virtualHeight / 3 - bird.height / 2); 
  
  if (birdX < -bird.width / 2) {
    birdVisible = false;
    // Adjust cooldown based on score up to 10
    let upper = map(constrain(score, 0, 10), 0, 10, 240, 120); // 2-4 sec
    let lower = map(constrain(score, 0, 10), 0, 10, 120, 0 ); // 0-2 sec
    birdCooldown = int(random(lower, upper));
  } 
  image(bird, birdX, birdY);
} 

function resetFish() {
  fish = random(1) < 0.5 ? angel : puffer;
  fishX = virtualWidth + fish.width / 2; 
  fishY = random(virtualHeight / 2, virtualHeight - fish.height / 2); 
  fishSpeed = random(4, 6) + score / 3; 
} 

function drawFish() {
  let d = dist(virtualWidth / 3 + 20, pelicanY, fishX, fishY); 
  if (d < fish.width / 2) { 
    swallow.play();
    resetFish(); 
    score++; 
  }
  fishX -= pitchCos * fishSpeed;
  if (fishX < -fish.width / 2) {
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
    bgCloudY[i] = random(virtualHeight / 4);
    bgCloudAlpha[i] = random(100, 150);
  } else {
    fgCloudX[i] = resetX;
    fgCloudY[i] = random(virtualHeight / 4);
    fgCloudAlpha[i] = random(200, 255);
  }
}

function drawBgClouds(initial) {
  for (let i = 0; i < bgCloudCt; i++) {
    tint(255, bgCloudAlpha[i] - (initial ? 100 : 0));
    image(cloud, bgCloudX[i], bgCloudY[i], cloud.width / 2, cloud.height / 2);
    bgCloudX[i] -= (gameState != GameState.PLAYING ? 0.05 : pitchCos) * (2 + i);
    if (bgCloudX[i] < -cloud.width / 4) {
      resetCloud(i, initial, true);
    }
  } noTint();
}

function drawFgClouds(initial) {
  for (let i = 0; i < fgCloudCt; i++) {
    tint(255, fgCloudAlpha[i] - (initial ? 100 : 0));
    image(cloud, fgCloudX[i], fgCloudY[i]);
    fgCloudX[i] -= (gameState != GameState.PLAYING ? 0.05 : pitchCos) * (5 + i);
    if (fgCloudX[i] < -cloud.width / 2) {
      resetCloud(i, initial, false);
    }
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
    fillColor = barColor;
  } else {
    let t = map(oxygen, 0.35, 0.25, 0, 1);
    fillColor = lerpColor(barColor, lowOxyColor, t);
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

// ---------------------------------------------------------------------------------
// Play scene audio
// ---------------------------------------------------------------------------------

function playFlyingAudio() {
  flyingVol = min(masterVol, flyingVol + volChgRate);
  flying.setVolume(flyingVol);
  divingVol = max(0 , divingVol - volChgRate) ;
  diving.setVolume(divingVol) ;
}

function playDivingAudio() {
  divingVol = min(masterVol, divingVol + volChgRate);
  diving.setVolume(divingVol);
  flyingVol = max(0, flyingVol - volChgRate);
  flying.setVolume(flyingVol);
}

function loopAudio() {
  if (!flying.isPlaying() && !diving.isPlaying()) {
    flying.loop();
    flying.setVolume(flyingVol);
    diving.loop();
    diving.setVolume(divingVol);
  }
}

function muteAudio() {
  if (flying.isPlaying() && diving.isPlaying) {
    flying.setVolume(0);
    diving.setVolume(0); 
  }
} 