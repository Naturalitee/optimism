class DSticker { //Persists in a position before leaving.
  constructor(posx, posy, duration, size) {
    this.x = posx;
    this.y = posy;
    this.duration = duration;
    this.size = size;
    this.grace = 2;
    this.animf = 0;
    this.active = false;
    this.behavior = this.behavior.bind(this);
    document.addEventListener('tick', this.behavior);
  }
  nextframe(){
    this.animf += 1
  }

  behavior(){
    if (this.grace == 0){
        this.active = true;
    }
    if (this.active){
        this.lifespan();
    }
    else {
        this.grace -= 1;
    }
  }

  lifespan(){
    this.duration -= 1;
    if (this.duration == 0){
        killme(this);
    }
  }

  draw(ctx, inc){
    if (this.active){ //use white if grace period is over
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        ctx.beginPath();
        ctx.fillStyle = `rgb(255, 255, 255)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx,posy,inc*this.size,inc*this.size);
        }
    else{ //
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        if (this.animf != 16){this.nextframe()}
        let t = (this.animf - 1) / (16 - 1);
        let eased = (Math.cos(Math.PI * t) - 1) / 2;
        let size = (inc * eased)
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx + (inc*this.size - size*this.size) / 2, posy + (inc*this.size - size*this.size) / 2, size*this.size ,size*this.size);
        }
    }
}

class DMover { //Starts on one of the edges and moves until it reaches the other.
  constructor(posx, posy, direction) {
    this.x = posx;
    this.y = posy;
    this.direction = direction;
    this.grace = 2;
    this.active = false;
    this.behavior = this.behavior.bind(this)
    document.addEventListener('tick', this.behavior);
  }
  
  behavior(){
    if (this.grace != 0){
        this.grace -= 1;
        if (this.grace == 0){
            this.active = true;
        }
    }
    else{
        switch(this.direction){
            case "Up":
                this.y -= 1;
                if (this.y < 1){
                    document.removeEventListener('tick',this.behavior);
                    killme(this);}
            break;
            case "Down":
                this.y += 1;
                if (this.y > 9){
                    killme(this);}
            break;
            case "Left":
                this.x -= 1;
                if (this.x < 1){
                    killme(this);}
            break;
            case "Right":
                this.x += 1;
                if (this.x > 9){
                    killme(this);}
            break;
            default:
                console.log("something broke lil bro")
                break;
        }
    }
  }

  draw(ctx, inc){
    if (this.active){
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        ctx.beginPath();
        ctx.fillStyle = `rgb(255, 255, 255)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx,posy,inc,inc);
        ctx.lineWidth = 5;
        ctx.strokeStyle = `rgb(0,0,0)`;
        this.drawarrow(ctx,inc,posx,posy);
    }
    else{
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, 0)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx,posy,inc,inc);
        ctx.lineWidth = 5;
        ctx.strokeStyle = `rgba(255, 0, 0, 1)`;
        this.drawarrow(ctx,inc,posx,posy);
        }
  }

  drawarrow(ctx,inc,posx,posy){
    switch (this.direction){ //creates arrows; there is a more efficient way to do this but I have no clue how so this will do ig
    case "Up":
        ctx.moveTo(posx + (inc/2) - 10, posy + (inc/2) + 5);
        ctx.lineTo(posx + (inc/2), posy + (inc/2) - 5);
        ctx.lineTo(posx + (inc/2) + 10, posy + (inc/2) + 5);
        break;
    case "Down":
        ctx.moveTo(posx + (inc/2) - 10, posy + (inc/2) - 5);
        ctx.lineTo(posx + (inc/2), posy + (inc/2) + 5);
        ctx.lineTo(posx + (inc/2) + 10, posy + (inc/2) - 5);
        break;
    case "Left":
        ctx.moveTo(posx + (inc/2) + 5, posy + (inc/2) - 10);
        ctx.lineTo(posx + (inc/2) - 5, posy + (inc/2));
        ctx.lineTo(posx + (inc/2) + 5, posy + (inc/2) + 10);
        break;
    case "Right":
        ctx.moveTo(posx + (inc/2) - 5, posy + (inc/2) - 10);
        ctx.lineTo(posx + (inc/2) + 5, posy + (inc/2));
        ctx.lineTo(posx + (inc/2) - 5, posy + (inc/2) + 10);
        break;
    default:
        console.log("something broke lil bro");
        break;
    }
    ctx.stroke();
  }

}

class DSweeper { //Encompasses a whole column or row.
  constructor(pos, direction, duration, size) {
    this.pos = pos;
    this.direction = direction;
    this.duration = duration;
    this.size = size;
    this.grace = 2;
    this.animf = 0;
    this.active = false;
    this.behavior = this.behavior.bind(this)
    document.addEventListener('tick', this.behavior);
  }
  nextframe(){
    this.animf += 1
  }

  behavior(){
    if (this.grace == 0){
        this.active = true;
    }
    if (this.active){
        this.lifespan();
    }
    else {
        this.grace -= 1;
    }
  }

  lifespan(){
    this.duration -= 1;
    if (this.duration == 0){
        killme(this);
    }
  }

  draw(ctx, inc){
    if (this.direction == "vertical"){
        this.drawvert(ctx,inc)
        }
    else{
        this.drawhorz(ctx,inc)
    }
    }

    drawvert(ctx, inc){
    if (this.active){ //use white if grace period is over
        let posx = GLOBAL_OFFSET + (this.pos - 1) * inc;
        let posy = 9 * inc;
        ctx.beginPath();
        ctx.fillStyle = `rgb(255, 255, 255)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx,GLOBAL_OFFSET,inc*this.size,posy);
        }
    else{
        let posx = GLOBAL_OFFSET + (this.pos - 1) * inc;
        let posy = 9 * inc;
        if (this.animf != 16){this.nextframe()}
        let t = (this.animf - 1) / (16 - 1);
        let eased = (Math.cos(Math.PI * t) - 1) / 2;
        let size = (inc * eased)
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx + (inc*this.size - size*this.size) / 2, GLOBAL_OFFSET, size*this.size, posy);
        }
    }
    drawhorz(ctx, inc){
        if (this.active){ //use white if grace period is over
        let posx = 9 * inc;
        let posy = GLOBAL_OFFSET + (this.pos - 1) * inc;
        ctx.beginPath();
        ctx.fillStyle = `rgb(255, 255, 255)`;
        ctx.lineWidth = 0;
        ctx.fillRect(GLOBAL_OFFSET,posy,posx,inc*this.size);
        }
    else{
        let posx = 9 * inc;
        let posy = GLOBAL_OFFSET + (this.pos - 1) * inc;
        if (this.animf != 16){this.nextframe()}
        let t = (this.animf - 1) / (16 - 1);
        let eased = (Math.cos(Math.PI * t) - 1) / 2;
        let size = (inc * eased)
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
        ctx.lineWidth = 0;
        ctx.fillRect(GLOBAL_OFFSET, posy + (inc*this.size - size*this.size) / 2, posx ,size*this.size);
        }
    }
}

class DCollect { //If you dont collect it before timer runs out you die
  constructor(posx, posy, duration) {
    this.x = posx;
    this.y = posy;
    this.duration = duration;
    this.active = true;
    this.behavior = this.behavior.bind(this)
    document.addEventListener('tick', this.behavior);
  }
  nextframe(){
    this.animf += 1
  }

  behavior(){
    if (this.grace == 0){
        this.active = true;
    }
    if (this.active){
        this.lifespan();
    }
    else {
        this.grace -= 1;
    }
  }

  lifespan(){
    this.duration -= 1;
    if (this.duration == 0){
        hurt()
        killme(this);
    }
  }

  safe(){ //they collected it
    collectsfx.pause();
    collectsfx.currentTime = 0;
    collectsfx.play();
    killme(this);
  }

  draw(ctx, inc){
    if (this.active){ //its green
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        let counter = Math.floor(this.duration/2);
        ctx.beginPath();
        ctx.fillStyle = this.duration % 2 == 0 ? `rgb(0, 255, 0)`: `rgb(0, 226, 0)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx,posy,inc,inc);
        ctx.fillStyle = `rgb(0,0,0)`;
        ctx.font = "55px serif";
        ctx.textAlign = "left";
        ctx.fillText(counter, posx + (inc - ctx.measureText(counter.toString()).width) / 2 , posy+inc/1.25);
        } 
    }
}

class DStalker{ //Follows the Player.
  constructor(posx, posy, duration) {
    this.x = posx;
    this.y = posy;
    this.duration = duration;
    this.active = false;
    this.animf = 0;
    this.grace = 2;
    this.behavior = this.behavior.bind(this);
    document.addEventListener('tick', this.behavior);
  }
  
  nextframe(){
    this.animf += 1;
  }
  behavior(){
    let movehow = Randint(2)+1;
    if (this.grace == 0){
        this.active = true;
    }
    if (this.active == true){
        if (this.duration % 2 == 0){
            if(this.x != PlayerPos[0] || this.y != PlayerPos[1]){
                if (this.x == PlayerPos[0]){
                    if (this.y > PlayerPos[1]){
                        this.y -= 1;
                    }
                    else{
                        this.y += 1;
                    }
                }
                else if (this.y == PlayerPos[1]){
                    if (this.x > PlayerPos[0]){
                        this.x -= 1;
                    }
                    else{
                        this.x += 1;
                    }
                }
                else{
                    if (movehow == 1){
                        if (this.y > PlayerPos[1]){
                            this.y -= 1;
                        }
                        else{
                            this.y += 1;
                        }
                    }
                    else{
                        if (this.x > PlayerPos[0]){
                            this.x -= 1;
                        }
                        else{
                            this.x += 1;
                        }
                    }
                }
            }
        }
        this.lifespan();    
    }
    else{
        this.grace -= 1;
    }
}

    lifespan(){
        this.duration -= 1;
        if (this.duration == 0){
            killme(this);
        }
    }

    drawface(x,y,ctx,inc){
        ctx.lineWidth = 0;
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.beginPath(); //make eyes
        ctx.arc(x+20, y+30, 5, 0, 2 * Math.PI);
        ctx.arc(x+46.67, y+30, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath(); //make anger
        ctx.strokeStyle = "black";
        ctx.moveTo(x+5, y+10);
        ctx.lineTo(x+GLOBAL_OFFSET, y+20);
        ctx.moveTo(x+61.66, y+10);
        ctx.lineTo(x+41.66, y+20);
        ctx.moveTo(x+15, y+51.66);
        ctx.lineTo(x+15, y+51.66);
        ctx.lineTo(x+33.33, y+41.66);
        ctx.lineTo(x+51.66, y+51.66);
        ctx.stroke();
        ctx.closePath();
    }

  draw(ctx, inc){
    if (this.active){ 
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        ctx.beginPath();
        ctx.fillStyle = `rgb(255, 0, 0)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx,posy,inc,inc);
        this.drawface(posx,posy,ctx,inc);
        }
    else{ 
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        if (this.animf != 16){this.nextframe()}
        let t = (this.animf - 1) / (16 - 1);
        let eased = (Math.cos(Math.PI * t) - 1) / 2;
        let size = (inc * eased)
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 0, 0, 0.4)`;
        ctx.lineWidth = 0;
        ctx.fillRect(posx + (inc - size) / 2, posy + (inc - size) / 2, size ,size);
        }
  }
}