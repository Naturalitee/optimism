class Artful {
    constructor(ctx, inc){
        this.ctx = ctx;
        this.inc = inc;
        this.maxx = SCREEN.clientWidth;
        this.maxy = SCREEN.clientHeight;
        this.PulseActive = false;
        this.PulseFrame = 0;
        this.MoverStorage = [];
    }

    DrawFrame() {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(0, 0, 0, 1)`;
    this.ctx.fillRect(GLOBAL_OFFSET,GLOBAL_OFFSET,this.maxx-GLOBAL_OFFSET*2,this.maxy-GLOBAL_OFFSET*2);
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = this.BorderColor();
    this.ctx.strokeRect(22.5,22.5,this.maxx-45,this.maxy-45);
    }

    DrawGrid(startup){
        let x = 0;
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = `rgb(137, 137, 137)`;
        for (let i = 0; i < 8; ++i) {
            if (startup >= 2){
                x += this.inc;
                this.ctx.beginPath();
                this.ctx.moveTo(x+GLOBAL_OFFSET, GLOBAL_OFFSET);
                this.ctx.lineTo(x+GLOBAL_OFFSET, this.maxy-GLOBAL_OFFSET);
                this.ctx.stroke();
            }
        }  
        x = 0;
        for (let i = 0; i < 8; ++i) {
            if (startup >= 3){
                x += this.inc;
                this.ctx.beginPath();
                this.ctx.moveTo(GLOBAL_OFFSET, x+GLOBAL_OFFSET);
                this.ctx.lineTo(this.maxx-GLOBAL_OFFSET, x+GLOBAL_OFFSET);
                this.ctx.stroke();
            }
        }
    }

    DrawCircle(x,y,scale,color,outline){ 
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20*scale, 0, Math.PI * 2);
        this.ctx.strokeStyle = outline;
        this.ctx.stroke();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    DrawMyEyes(x,y,text,size,font,color,locationx,offsetx,locationy,offsety,weight){
        let fweight = weight ?? "";
        this.ctx.fillStyle = color;
        this.ctx.font = `${fweight} ${size}px ${font}`;
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, x - locationx + offsetx, y - locationy + offsety);
        this.ctx.fillText(text, x + locationx + offsetx, y - locationy + offsety);
        this.ctx.textAlign = "start";
    }

    DrawMyMouth(x,y,text,size,font,color,locationx,locationy,rot,weight){
        let fweight = weight ?? "";
        this.ctx.fillStyle = color;
        this.ctx.translate(x, y);
        if (rot){this.ctx.rotate(rot * Math.PI / 180)}
        this.ctx.textAlign = "center";
        this.ctx.font = `${fweight} ${size}px ${font}`;
        this.ctx.fillText(text,locationx, locationy);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.textAlign = "start";
    }

    BorderColor(){
        if (healed != 0){
            return `rgb(0,255,0)`
        }
        else if (hurtcd >= 170){
            return `rgb(255,0,0)`
        }
        else {
            return `rgb(137,137,137)`
        }
    }

    DrawHazardBase(posx,posy,width,height,color){
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 0;
        this.ctx.fillRect(posx , posy, width, height);
    }

    DrawArrow(posx,posy,color,direction){
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
    switch (direction){ //creates arrows; there is a more efficient way to do this but I have no clue how so this will do ig
        case "Up":
            this.ctx.moveTo(posx + (this.inc/2) - 10, posy + (this.inc/2) + 5);
            this.ctx.lineTo(posx + (this.inc/2), posy + (this.inc/2) - 5);
            this.ctx.lineTo(posx + (this.inc/2) + 10, posy + (this.inc/2) + 5);
            break;
        case "Down":
            this.ctx.moveTo(posx + (this.inc/2) - 10, posy + (this.inc/2) - 5);
            this.ctx.lineTo(posx + (this.inc/2), posy + (this.inc/2) + 5);
            this.ctx.lineTo(posx + (this.inc/2) + 10, posy + (this.inc/2) - 5);
            break;
        case "Left":
            this.ctx.moveTo(posx + (this.inc/2) + 5, posy + (this.inc/2) - 10);
            this.ctx.lineTo(posx + (this.inc/2) - 5, posy + (this.inc/2));
            this.ctx.lineTo(posx + (this.inc/2) + 5, posy + (this.inc/2) + 10);
            break;
        case "Right":
            this.ctx.moveTo(posx + (this.inc/2) - 5, posy + (this.inc/2) - 10);
            this.ctx.lineTo(posx + (this.inc/2) + 5, posy + (this.inc/2));
            this.ctx.lineTo(posx + (this.inc/2) - 5, posy + (this.inc/2) + 10);
            break;
        default:
            console.log("something broke lil bro");
            break;
        }
        this.ctx.stroke();
    }

    ConsiderMover(x,y){
        if (this.MoverStorage.some(itm => EqCheck(itm, [x,y]))){
            return true;
        }
        else{
            this.MoverStorage.push([x,y]); 
            return false;
        }
    }

    DrawStalkerFace(posx,posy,color){
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < 2; i++) {
            this.ctx.arc(posx + 20 + (i * 26.67), posy + 30, 5, 0, 2 * Math.PI);
        }
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.moveTo(posx+5, posy+10);
        this.ctx.lineTo(posx+GLOBAL_OFFSET, posy+20);
        this.ctx.moveTo(posx+61.66, posy+10);
        this.ctx.lineTo(posx+41.66, posy+20);
        let mouthPoints = [[15, 51.66],[33.33, 41.66],[51.66, 51.66]];
        this.ctx.moveTo(posx + mouthPoints[0][0], posy + mouthPoints[0][1]);
        for (let i = 1; i < mouthPoints.length; i++) {
            this.ctx.lineTo(posx + mouthPoints[i][0], posy + mouthPoints[i][1]);
        }
        this.ctx.stroke();
    }

    PulseEffect(){
        if (this.PulseActive) {
            this.PulseFrame += 1;
            let progress = this.PulseFrame / 60; 
        if (progress > 1){progress = 1};
        let ease = 1 - Math.pow(1 - progress, 3);
        this.ctx.strokeStyle = `rgba(255,255,255,${1 - ease})`;
        let x = 22.5 * (1 - ease);
        let y = 22.5 * (1 - ease);
        this.ctx.strokeRect(x, y, this.maxx - x * 2, this.maxy - y * 2);
        if (this.PulseFrame >= 60) {
            this.PulseActive = false;
            this.PulseFrame = 0;
            }
        }
    }

    DrawText(text, size, font, color, x, y, IsCentered){
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px ${font}`
        if (IsCentered){this.ctx.fillText(text, x+(this.inc*9 - this.ctx.measureText(text).width)/2, y)}
        else {this.ctx.fillText(text, x, y)}
    }

    DrawImage(img, x, y, IsFree, width, length){ 
        if (width && length){this.ctx.drawImage(img,x,y,width,length)}
        else if (IsFree){this.ctx.drawImage(img,x,y)} //IsFree determines if image stays in the center because I frankly cant be bothered
        else{this.ctx.drawImage(img, x+(this.inc*9 - img.width)/ 2, y+(img.height/2))}
    }

}