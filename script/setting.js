/*--------------------定数やクラスの設定--------------------*/

//1マスの大きさ
const p = 4;

//Canvas設定
const WIDTH = p * 160;
const HEIGHT = p * 160;

const layer1 = document.getElementById("layer1");
const lc1 = layer1.getContext("2d");
layer1.setAttribute("width", WIDTH);
layer1.setAttribute("height", HEIGHT);
lc1.font = `${p * 3} serif`;
lc1.strokeStyle = "#4c444d";

/*const layer2 = document.getElementById("layer2");
const lc2 = layer2.getContext("2d");
layer2.setAttribute("width", WIDTH);
layer2.setAttribute("height", HEIGHT);*/


/*--------------------ボールの設定--------------------*/
let balls = [];
const ballRadius = p;
let ballSpeed = p *1.5;

class Ball {
    constructor(x, y, arg, color = "#fff") {
        this.x = x;
        this.y = y;
        this.arg = arg //進む方向 -π ~ π
        this.dx;
        this.dy;
        this.changeDir();
        this.status = true;
        this.color = color;
    }
    get pos() {
        return [x, y];
    }

    write() {
        if (!this.status) return;
        this.check();
        this.move();

        //描画
        lc1.beginPath();
        lc1.arc(this.x, this.y, ballRadius, 0, 2 * Math.PI);
        lc1.fillStyle = this.color;
        lc1.fill();
        lc1.closePath();
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    changeDir() {
        this.dx = ballSpeed * Math.cos(this.arg);
        this.dy = ballSpeed * Math.sin(this.arg);
    }

    //衝突時の処理
    collision(opponents, paddle = null){
        switch(opponents){
            case "left":
            case "right":
                this.arg = Math.sign(this.arg) * Math.PI - this.arg;
                break;
            case "top":
            case "bottom":
                this.arg *= -1;
                break;
            case "paddle":
                let w = paddle.paddleWidth / 2;
                let temp = this.x - paddle.paddleX - w;
                this.arg = -Math.PI * (0.5 - 0.45 * temp / w);
                break;
        }
        this.changeDir();
    }

    //衝突するかどうか
    //線分が交わるかに改修すべき
    check() {
        ///*-----改修中-----
        //ブロックと衝突
        let pre = new Point(this.x - this.dx, this.y - this.dy);
        let now = new Point(this.x, this.y)
        let k = new LineSegment(pre, now);
        let l;
        let list = [];//衝突可能性のあるbrickをListに格納
        let pos = ["top", "right", "bottom", "left"];
        bricks.forEach((bk)=>{
            if (bk.status){
                let a = new Point(bk.x, bk.y);
                let b = new Point(bk.x + brickWidth, bk.y);
                let c = new Point(bk.x + brickWidth, bk.y + brickHeight);
                let d = new Point(bk.x, bk.y + brickHeight);
                
                //brickの各辺と交わっているか
                let lineSegs = [new LineSegment(a, b), new LineSegment(b, c), new LineSegment(c, d), new LineSegment(d, a)];
                let tempList = [];
                for(let i = 0; i < 4; i++){
                    if(JudgeLineSegment(k, lineSegs[i])){
                        tempList.push([l, rtnJudgeLineSegment(k, lineSegs[i]), pos[i]]);
                    }
                }

                //交わっているとき
                if(tempList.length > 0){
                    let minID = 0;
                    let min = WIDTH;
                    for(let i = 0; i < tempList.length; i++){
                        let len = culcLen(tempList[i][1], pre)
                        if (len < min){
                            min = len;
                            minID = i;
                        }
                    }
                    //一番最初に交わった辺を登録
                    list.push([bk, tempList[minID][1], tempList[minID][2]]);
                }
            }
        });
        

        if (list.length > 0) {
            let minID = 0;
            let min = WIDTH;
            for (let i = 0; i < list.length; i++) {
                let len = culcLen(list[i][1], pre)
                if(len === 0) continue;
                if (len < min) {
                    min = len;
                    minID = i;
                }
            }
            
            //一番最初に交わったbrickと衝突処理
            this.x = pre.x;
            this.y = pre.y;
            list[minID][0].col();
            this.collision(list[minID][2]);
            return;
        }
        //*/
        /*
        //ブロックと衝突
        for (let i = 0; i < bricks.length; i++) {
            if (!bricks[i].status) continue;
            if (
                this.x >= bricks[i].x &&
                this.x <= bricks[i].x + brickWidth &&
                this.y >= bricks[i].y &&
                this.y <= bricks[i].y + brickHeight
            ) {
                bricks[i].col();
                //衝突しているので詳細な計算
                let tempX = this.x - this.dx - bricks[i].x;
                let tempY = this.y - this.dy - bricks[i].y;
                let f1 = brickHeight * tempX + brickWidth * tempY - brickHeight * brickWidth;
                let f2 = brickHeight * tempX - brickWidth * tempY;

                //f1 x f2 によってどの向きから衝突したか判定
                if (f1 * f2 < 0) {
                    this.arg *= -1;
                    this.changeDir();
                    return;
                } else {
                    this.arg = Math.sign(this.arg) * Math.PI - this.arg;
                    this.changeDir();
                    return;
                }
            }
        }
        //*/

        //左の壁と衝突
        if (this.x < ballRadius) {
            this.collision("left");
            return;
        }

        //右の壁と衝突
        if (this.x > WIDTH - ballRadius) {
            this.collision("right");
            return;
        }

        //上の壁と衝突
        if (this.y < ballRadius){
            this.collision("top");
            return;
        }
        //paddleと衝突
        paddles.forEach((pad)=>{
            if (this.x >= pad.paddleX && this.x <= pad.paddleX + pad.paddleWidth && this.y >= HEIGHT - pad.paddleHeight) {
                this.y = HEIGHT - pad.paddleHeight;
                //for Debug
                if (Debug) balls.push(new Ball(this.x, this.y - p, -rad(90)));

                this.collision("paddle", pad);
                return;
            }
        });

        //落下
        if (this.y + this.dy > HEIGHT) {
            //Debug
            if (Debug) balls.push(new Ball(200, 200, -rad(getRundom(15, 165))));

            this.status = false;
            return;
        }
    }
}

/*--------------------パドルの設定--------------------*/
let rightPressed = false;
let leftPressed = false;
let mouseX = WIDTH / 2;
let paddles = [];

//キー操作、マウス操作
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    switch (e.key) {
        case "Right":
        case "ArrowRight":
            rightPressed = true;
            break;
        case "Left":
        case "ArrowLeft":
            leftPressed = true;
            break;
    }
}
function keyUpHandler(e) {
    switch (e.key) {
        case "Right":
        case "ArrowRight":
            rightPressed = false;
            break;
        case "Left":
        case "ArrowLeft":
            leftPressed = false;
            break;
    }
}

function mouseMoveHandler(e) {
    mouseX = e.clientX - layer1.offsetLeft;
}

class Paddle {
    constructor(color = "#0095DD") {
        this.paddleWidth = p * 20;
        this.paddleHeight = p * 2;
        this.paddleX = (WIDTH - this.paddleWidth) / 2;
        this.color = color;
    }

    move() {
        if (rightPressed) {
            this.paddleX = Math.min(this.paddleX + p, WIDTH - this.paddleWidth);
        } else if (leftPressed) {
            this.paddleX = Math.max(this.paddleX - p, 0);
        } else if (mouseX >= this.paddleWidth / 2 && mouseX <= WIDTH - this.paddleWidth / 2) {
            this.paddleX = mouseX - this.paddleWidth / 2;
        }
    }

    write() {
        this.move();
        
        //描画
        lc1.fillStyle = this.color;
        lc1.fillRect(this.paddleX, HEIGHT, this.paddleWidth, -this.paddleHeight);
    }

}

/*--------------------レンガの設定--------------------*/
const brickWidth = p * 4;
const brickHeight = p * 4;
const brickColors = ["#77787b", "#ff0000", "#ff9600", "#fff000", "#008700", "#0091ff", "#0064be", "#910082"];
const brickTypes = ["unbroken", "breakable"];
let bricks = [];
class Brick {
    constructor(x, y, color, item = 9) {
        this.x = x;
        this.y = y;
        this.color = brickColors[color];
        this.type = color;
        if(this.type > 0) this.type = 1;
        this.status = true;
        if(item < 9){
            this.item = new itemList[item](this.x + brickWidth/2, this.y + brickHeight/2);
        }else{
            this.item = undefined;
        }
    }

    write(){
        if(!this.status) return;
        lc1.fillStyle = this.color;
        if(!Debug) lc1.fillRect(this.x, this.y, brickWidth, brickHeight);
        lc1.strokeRect(this.x, this.y, brickWidth, brickHeight);
    }

    //衝突処理
    col(){
        if(brickTypes[this.type] != 'unbroken'){
            this.status = false;
            score++;
            if(this.item != undefined){
                items.push(this.item);
            }
        }
    }
}


/*--------------------アイテムの設定--------------------*/
let items = [];
class Item{
    constructor(x, y, color = "#fff", text = ""){
        this.x = x;
        this.y = y;
        this.radius = p * 3;
        this.status = true;
        this.color = color;
        this.text = text;
        this.textWidth = lc1.measureText(this.text).width;
    }

    write(){
        if(!this.status) return;
        this.check();
        this.move();

        //描画
        lc1.beginPath();
        lc1.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        lc1.fillStyle = this.color;
        lc1.fill();
        lc1.closePath();
        lc1.fillStyle = "#fff";
        lc1.fillText(this.text, this.x - this.textWidth/2 - p/2 , this.y + 1.5 * p);
    }

    move(){
        this.y += ballSpeed / 2;
    }

    check(){
        if(this.y >= HEIGHT) this.status = false;
        //パドルと衝突
        paddles.forEach((pad) => {
            if (this.x >= pad.paddleX && this.x <= pad.paddleX + pad.paddleWidth && this.y >= HEIGHT - pad.paddleHeight) {
                this.status = false;
                this.effect();
                return;
            }
        });
    }

    //効果
    effect(){
        if (Debug) alert("GET!");
        //何もなし
    }
}

class BallDouble extends Item{
    constructor(x, y){
        super(x, y, "#ff2222", "x2");
    }

    //ボールを2倍にする
    effect(){
        for(let i = balls.length - 1; i >= 0; i--){
            if (!balls[i].status) continue;
            balls.push(new Ball(balls[i].x, balls[i].y, -balls[i].arg));
        }
    }
}

class BallPlus extends Item{
    constructor(x, y, num = getRundom(1, 5)){
        super(x, y, "#00bb66", `+${num}`);
        this.num = num;
    }

    //ボールの数を増やす
    effect(){
        for(let i = 0; i < this.num; i++){
            balls.push(new Ball(this.x + p * i, this.y-p, -rad(30 * (i + 1)-2)));
        }
    }
}

class PaddleExtension extends Item{
    constructor(x, y){
        super(x, y, "#2222ff", "⇔");
    }

    //パドルを伸ばす
    effect(){
        paddles.forEach((pad)=>{
            if(pad.paddleWidth < WIDTH / 2) pad.paddleWidth += (WIDTH - pad.paddleWidth) * 0.1;
            if (pad.paddleX + pad.paddleWidth > WIDTH) pad.paddleX = WIDTH - pad.paddleWidth;
        });
    }
}

const itemList = [Item, BallDouble, BallPlus, PaddleExtension]
