const canvas = document.getElementById("canvas");
const stl = canvas.getContext("2d");

let scoreSFX = new Audio("mixkit-extra-bonus-in-a-video-game-2045.wav");
let gameOverSFX = new Audio("mixkit-player-losing-or-failing-2042.wav");
let jumpSFX = new Audio("mixkit-quick-jump-arcade-game-239.wav");

let presetTime = 1000;
let enemySpeed = 5;
let score = 0;
let scoreIncrement = 0;
let canScore = true;

function drawBackgroundLine() {
stl.beginPath();
stl.moveTo(0,400);
stl.lineTo(600,400);
stl.lineWidth = 1.9;
stl.strokeStyle = "black";
stl.stroke();
}

function drawScore() {
    stl.font = "80px Arial";
    stl.fillStyle = "black";
    let scoreString = score.toString();
    let xOffset = ((scoreString.length - 1) * 20);
    stl.fillText(scoreString, 280 - xOffset, 100);
}

function getRandomNumber(min,max) {
    return Math.floor(Math.random() * (max-min + 1)) + min
}

function randomNumberInterval(timeInterval) {
    let returnTime = timeInterval;
    if(Math.random() < 0.5) {
        returnTime += getRandomNumber(presetTime / 3, presetTime * 1.5);
    }else {
        returnTime -= getRandomNumber(presetTime / 5, presetTime / 2);
    }
    return returnTime;
}

class Player {
    constructor(x,y,size,color) {
    this.x=x;
    this.y=y;
    this.size=size;
    this.color=color;
      //these 3 are used for jump configuration
    this.jumpHeight = 12;
    this.shouldJump = false;
    this.jumpCounter = 0;
    //spin animation
    this.spin = 0;
    //to get a 90 degree rotation
    this.spinIncrement = 90 / 32;

}
rotation() {
    let offsetXPosition = this.x + (this.size /2);
    let offsetYPosition = this.y + (this.size /2);
    stl.translate(offsetXPosition, offsetYPosition);
    //divide to convert degrees to radians
    stl.rotate(this.spin * Math.PI / 180);
    stl.rotate(this.spinIncrement * Math.PI / 180);
    stl.translate(-offsetXPosition, -offsetYPosition);
    this.spin += this.spinIncrement;
}

counterRotation() {
    //this rotates the cube back to irs origin so it can be moved upwards properly
    let offsetXPosition = this.x + (this.size /2);
    let offsetYPosition = this.y + (this.size /2);
    stl.translate(offsetXPosition, offsetYPosition);
    stl.rotate(-this.spin * Math.PI / 180);
    stl.translate(-offsetXPosition, -offsetYPosition);
}

jump() {
//making this 32 frames for the jump time
if(this.shouldJump) {
    this.jumpCounter++;
    if(this.jumpCounter < 15) {
        //Go Up
        this.y -= this.jumpHeight;
    }else if (this.jumpCounter > 14 && this.jumpCounter < 19) {
        this.y += 0;
    }else if(this.jumpCounter < 33) {
        //come back down
        this.y += this.jumpHeight;
    }
    this.rotation();
    //end cycle
    if(this.jumpCounter >= 32) {
        this.counterRotation();
        this.spin = 0;
        this.shouldJump = false;
    }
}
}

draw() {
    this.jump();
    stl.fillStyle = this.color;
    stl.fillRect(this.x,this.y,this.size,this.size);
    if(this.shouldJump) this.counterRotation();
}
}

let player = new Player(150,350,50,"black");

class AvoidBlock {
    constructor(size, speed) {
        this.x = canvas.width + size;
        this.y = 400 - size;
        this.size = size;
        this.color = "blue";
        this.slideSpeed = speed;
    }
    draw() {
        stl.fillStyle = this.color;
        stl.fillRect(this.x, this.y, this.size, this.size);
    }
    slide() {
        this.draw();
        this.x -= this.slideSpeed;
    }
}

let arrayBlocks = [];

function generateBlocks() {
    let timeDelay = randomNumberInterval(presetTime);
    arrayBlocks.push(new AvoidBlock(50, enemySpeed));

    setTimeout(generateBlocks, timeDelay);
}

function squareColliding(player, block) {
    let s1 = Object.assign(Object.create(Object.getPrototypeOf(player)), player);
    let s2 = Object.assign(Object.create(Object.getPrototypeOf(block)), block);
    s2.size = s2.size - 10;
    s2.x = s2.x + 10;
    s2.y = s2.y + 10;
    return !(
        s1.x > s2.x + s2.size ||
        s1.x + s1.size < s2.x ||
        s1.y > s2.y + s2.size ||
        s1.y + s1.size < s2.y
    )
}

function isPastBlock(player, block) {
    return(
        player.x + (player.size / 2) > block.x + (block.size / 4) &&
        player.x + (player.size / 2) < block.x + (block.size / 4) * 3
    )
}

let animationId = null;
function animate() {
    animationId = requestAnimationFrame(animate);
    stl.clearRect(0,0,canvas.width,canvas.height);

    drawBackgroundLine();
    drawScore();
    player.draw();

    arrayBlocks.forEach((arrayBlock, index) => {
        arrayBlock.slide();
        //end game, player and enemy collided
        if(squareColliding(player, arrayBlock)) {
            gameOverSFX.play();

            cancelAnimationFrame(animationId);
        }
        if(isPastBlock(player, arrayBlock) && canScore) {
            canScore = false;
            scoreSFX.currentTime = 0;
            scoreSFX.play();
            score++;
        }
        //delete block that has left the screen
        if((arrayBlock.x + arrayBlock.size) <= 0) {
            setTimeout(() => {
                arrayBlocks.splice(index, 1);
            }, 0)
        }
    })
}

animate();
setTimeout(() => {
    generateBlocks();
}, randomNumberInterval(presetTime))

//Event Listeners
addEventListener("keydown", e =>{
    if(e.code === "Space") {
        if(!player.shouldJump) {
            jumpSFX.play();
            player.jumpCounter = 0;
            player.shouldJump = true;
            canScore = true;
        }
    }
})