//参考
//https://developer.mozilla.org/ja/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript

//Debug
const Debug = false;

let GAMEMODE = "GAME";
let ballCount = 0;
let brickCount = 0;

//スコア設定
let score = 0;
let lives = 3;


balls.push(new Ball(300, 500, rad(-45)));
paddles.push(new Paddle());

if(Debug) {
    items.push(
        new Item(100, 0), 
        new BallDouble(200, 200),
        new BallPlus(300, 300, 3),
        new PaddleExtension(400, 400),
        new itemList[0](100, 200)
    );
    bricks.push(new Brick(600-8, 400, 0));
}
//メインループ
function main(){
    ballCount = 0;
    
    writeAll();

    if(score === brickCount) GAMEMODE = "CLEAR";
    if(GAMEMODE == "GAME") {
        if(Debug)return;
        requestAnimationFrame(main);
    }else{
        writeAll();
        alert(GAMEMODE);
        location.reload();
    }
    if(ballCount === 0){
        GAMEMODE = "GAMEOVER";
    }
    
}

if(Debug){
document.addEventListener("keypress", keyPressHandler, false);
function keyPressHandler(e){
    switch (e.key) {
        case "g":
            main();
            break;
    }
}
}

function writeAll(){
    lc1.clearRect(0, 0, WIDTH, HEIGHT);

    paddles.forEach((pad) => {
        pad.write();
    });

    balls.forEach((ball) => {
        ball.write();
        if (ball.status) ballCount++;
    });

    bricks.forEach((bri) => {
        bri.write();
    });

    items.forEach((item) => {
        item.write();
    });

    drawScore();
}

//ステージ作成
function createStage(stage){
    let data = stages[stage];
    for (let i = 0; i < data.length; i++){
        for (let j = 0; j < data[i].length; j++){
            let n = data[i][j];
            let a = Math.floor(n / 10); //十の位
            let b = n % 10 //一の位

            if (b > 7) continue;
            bricks.push(new Brick(j * brickWidth, i * brickHeight, b, a));
            if (b != 0) brickCount++;
        }
    }
}

//得点を書く
function drawScore() {
    lc1.font = "16px Arial";
    lc1.fillStyle = "#0095DD";
    lc1.fillText(`Score: ${score}`, 8, 20);
}
function drawLives() {
    lc1.font = "16px Arial";
    lc1.fillStyle = "#0095DD";
    lc1.fillText(`Lives: ${lives}`, WIDTH - 65, 20);
}

createStage("Stage 1");
main();