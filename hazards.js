class DSticker { //Persists in a position before leaving.
  constructor(posx, posy, duration, size) {
    this.x = posx;
    this.y = posy;
    this.z = 1;
    this.duration = duration;
    this.size = size;
    this.grace = 2;
    this.animf = 0;
    this.active = false;
    this.behavior = this.behavior.bind(this);
    document.addEventListener('tick', this.behavior);
  }
  nextframe(){
    this.animf += 1;
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

    draw(inc){
    let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
    let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
    let color = this.active ? `rgb(255, 255, 255)`:`rgba(255, 255, 255, 0.4)`;
    let scale = 1;
    if (!this.active) {
        if (this.animf != 16) {this.nextframe()}
        let t = (this.animf - 1) / 15;
        let eased = (Math.cos(Math.PI * t) - 1) / 2;
        scale = eased;
    }
    let size = inc * this.size * scale;
    let offset = (inc * this.size - size) / 2;
    artful.DrawHazardBase(posx + offset,posy + offset,size,size,color);
    }
}

class DMover { //Starts on one of the edges and moves until it reaches the other. Last one is optional and requires True.
  constructor(posx, posy, direction, active) {
    this.x = posx;
    this.y = posy;
    this.z = 2;
    this.direction = direction;
    this.grace = (active == null) ? 2 : 0;
    this.active = active ?? false;
    this.behavior = this.behavior.bind(this);
    this.fq = tickfrequency;
    this.fqtick = tickfrequency;
    document.addEventListener('tick', this.behavior);
  }
  
  behavior(){
    if (this.grace != 0){
        this.grace -= 1;
        if (this.grace == 0){
            this.active = true;
        }
    }
    else if (this.fq == this.fqtick){
        this.fqtick = 1;
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
                console.log("something broke lil bro", Dangers.indexOf(this), this.direction)
                break;
        }
    }
    else{
        this.fqtick += 1;
    }
  }

    draw(inc){
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        let color;
        let BackgroundSpaceTaken = artful.ConsiderMover(this.x, this.y);
        if (BackgroundSpaceTaken){color = "rgba(0,0,0,0)"}
        else {color = this.active ? `rgb(255, 255, 255)`:`rgba(0, 0, 0, 0)`;}
        let arrowcolor = this.active ? `rgb(0, 0, 0)`:`rgb(255, 0, 0)`
        artful.DrawHazardBase(posx,posy,inc,inc,color);
        artful.DrawArrow(posx,posy,arrowcolor,this.direction);
    }
}

class DFirework extends DMover { //A Mover that explodes into four after a short duration.
    constructor(posx,posy,direction,duration){
        super(posx,posy,direction);
        this.duration = duration;
    }

    behavior(){ 
        if (this.duration > 0){
            super.behavior();
        }
        if (this.duration < 1){
            this.explode();
        }
        else if (this.active){
            this.duration -= 1;
        }
    }

    explode(){
        ["Up","Down","Left","Right"].forEach(dir => {
            Dangers.push(new DMover(this.x, this.y, dir, true))
        })
        killme(this);
    }

    draw(inc){
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        let activatedcolorset = this.duration >= 2 ? [`rgba(255, 136, 0, 1)`,`rgba(0, 0, 0, 1)`] : [`rgb(255, 0, 0)`,`rgb(255,255,255)`];
        let color = this.active ? activatedcolorset[0] : `rgba(0, 0, 0, 0)`;
        let arrowcolor = this.active ? activatedcolorset[1] : `rgb(255, 0, 0)`;
        artful.DrawHazardBase(posx,posy,inc,inc,color);
        artful.DrawArrow(posx,posy,arrowcolor,this.direction)
    }
}

class DSweeper { //Encompasses a whole column or row.
    constructor(pos, direction, duration, size) {
        this.pos = pos;
        this.z = 1;
        this.direction = direction;
        this.duration = duration;
        this.size = size;
        this.grace = 2;
        this.animf = 0;
        this.active = false;
        this.behavior = this.behavior.bind(this);
        document.addEventListener('tick', this.behavior);
    }
    nextframe(){
        this.animf += 1;
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

    draw(inc){
        var eased = 1;
        if (!this.active) {
            if (this.animf != 16) {this.nextframe()}
            let t = (this.animf - 1) / 15;
            eased = (Math.cos(Math.PI * t) - 1) / 2;
        }
        if (this.direction == "vertical"){
            this.drawvert(inc, eased)
            }
        else{
            this.drawhorz(inc, eased)
            }
    }

    drawvert(inc, eased){
    let posx = GLOBAL_OFFSET + (this.pos - 1) * inc;
    let color = this.active ? `rgba(255, 255, 255, 1)` : `rgba(255, 255, 255, 0.4)`;
    let scale = eased;
    let size = inc * this.size * scale;
    let offset = (inc * this.size - size) / 2;
    artful.DrawHazardBase(posx + offset, GLOBAL_OFFSET, size, 9 * inc, color);
    }

    drawhorz(inc, eased){
    let posy = GLOBAL_OFFSET + (this.pos - 1) * inc;
    let color = this.active ? `rgba(255, 255, 255, 1)` : `rgba(255, 255, 255, 0.4)`;
    let scale = eased;
    let size = inc * this.size * scale;
    let offset = (inc * this.size - size) / 2;
    artful.DrawHazardBase(GLOBAL_OFFSET, posy + offset, 9 * inc, size, color);
}

}

class DCollect { //If you dont collect it before timer runs out you die
    constructor(posx, posy, duration) {
        this.x = posx;
        this.y = posy;
        this.z = 4;
        this.duration = duration;
        this.active = true;
        this.behavior = this.behavior.bind(this);
        document.addEventListener('tick', this.behavior);
    }
    nextframe(){
        this.animf += 1;
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
        if (this.duration <= 0){
            hurt()
            killme(this);
        }
    }

    safe(){ //they collected it
        audiohandler.play("collect", "sfx")
        killme(this);
    }

    draw(inc){
        if (this.active){ 
            let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
            let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
            let counter = Math.floor(this.duration/2);
            let color = this.duration % 2 == 0 ? `rgb(0, 255, 0)`: `rgb(0, 226, 0)`;
            let textcolor = "rgb(0,0,0)";
            artful.DrawHazardBase(posx,posy,inc,inc,color);
            CTX.font = "55px serif"; //just so it can measure it properly
            const CounterFontSize = 55;
            const CounterFont = "serif";
            artful.DrawText(counter,{size:CounterFontSize, font:CounterFont},textcolor,posx+(inc - CTX.measureText(counter.toString()).width) / 2 ,posy+inc/1.25);
        } 
    }
}

class DStalker{ //Follows the Player.
  constructor(posx, posy, duration) {
    this.x = posx;
    this.y = posy;
    this.z = 3;
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
            this.movement(movehow)
        }
        this.lifespan();    
    }
    else{
            this.grace -= 1;
    }
}

    movement(movehow){
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

    lifespan(){
        this.duration -= 1;
        if (this.duration == 0){
            killme(this);
        }
    }

    draw(inc){
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        let color = this.active ? `rgba(255, 0, 0, 1)`:`rgba(255, 0, 0, 0.4)`;
        let scale = 1;
        if (!this.active) {
            if (this.animf != 16) {this.nextframe()}
            let t = (this.animf - 1) / 15;
            let eased = (Math.cos(Math.PI * t) - 1) / 2;
            scale = eased;
        }
        let size = inc * scale;
        let offset = (inc - size) / 2;
        artful.DrawHazardBase(posx + offset,posy + offset,size,size,color);
        if (this.active) artful.DrawStalkerFace(posx,posy,"rgb(0,0,0)");
    }
}

class DSploder extends DStalker{
    constructor(posx,posy,duration){
        super(posx,posy,duration);
    }

    behavior(){ 
        if (this.duration > 0){
            super.behavior();
        }
        if (this.duration < 1){
            this.explode();
        }
        else if (this.active){
            this.duration -= 1;
        }
    }

    explode(){
        ["Up","Down","Left","Right"].forEach(dir => {
            Dangers.push(new DMover(this.x, this.y, dir, true))
        })
        killme(this);
    }

    lifespan(){
        //wont do anything now to prevent bugs
    }

    draw(inc){
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        let activatedcolorset = this.duration >= 2 ? [`rgba(255, 136, 0, 1)`,`rgba(0, 0, 0, 1)`] : [`rgb(255, 0, 0)`,`rgb(255,255,255)`];
        let color = this.active ? activatedcolorset[0] : `rgba(255, 136, 0, 0.4)`;
        let scale = 1;
        if (!this.active) {
            if (this.animf != 16) {this.nextframe()}
            let t = (this.animf - 1) / 15;
            let eased = (Math.cos(Math.PI * t) - 1) / 2;
            scale = eased;
        }
        let size = inc * scale;
        let offset = (inc - size) / 2;
        artful.DrawHazardBase(posx + offset,posy + offset,size,size,color);
        if (this.active) artful.DrawStalkerFace(posx,posy,activatedcolorset[1]);
    }
}

class DSeeker extends DStalker{
    constructor(posx,posy,duration){
        super(posx,posy,duration);
        this.seekbehavior = this.seekbehavior.bind(this);
        document.addEventListener('player-movement', this.seekbehavior);
    }

    seekbehavior(){
        if (this.active){
            let movehow = Randint(3)+1;
            let willmove = Randint(2)+1;
            if (willmove == 1) this.movement(movehow);
        }
    }

    behavior(){
        if (this.grace == 0){
        this.active = true;
        }
        else{
            this.grace -= 1
        }
        if (this.active) this.lifespan();
    }

    draw(inc){
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        let color = this.active ? `rgb(183, 0, 0)`:`rgba(255, 0, 0, 0.4)`;
        let scale = 1;
        if (!this.active) {
            if (this.animf != 16) {this.nextframe()}
            let t = (this.animf - 1) / 15;
            let eased = (Math.cos(Math.PI * t) - 1) / 2;
            scale = eased;
        }
        let size = inc * scale;
        let offset = (inc - size) / 2;
        artful.DrawHazardBase(posx + offset,posy + offset,size,size,color);
        if (this.active) artful.DrawSeekerFace(posx,posy,"rgb(0,0,0)");
    }
}

class Indicator{ //Non-collide indicators (also literally anything that should exist but not damage the playerig)
    constructor(posx, posy, duration, props) {
        this.x = posx;
        this.y = posy;
        this.props = props ?? false;
        this.z = this.props.zorder ?? 5;
        this.duration = duration ?? 0;
        this.active = false;
        this.behavior = this.behavior.bind(this);
        if (!this.props.RefreshOnFrame) document.addEventListener('tick', this.behavior);
    }

    behavior(){
        this.duration -= 1;
        if (this.duration == 0){
            killme(this);
            }
        }

}

class IHeal extends Indicator{ //Heals the player upon contact
    constructor(posx,posy,duration, props){
        super(posx, posy, duration, props);
        this.active = true;
        audiohandler.play("heartstart", "sfx");
    }

    draw(inc){
        let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
        let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
        artful.DrawImage(HEART, posx, posy, true, inc, inc);
    }

    safe(){
        audiohandler.play("heartget", "sfx")
        healed = 10;
        hpup();
        killme(this);
    }

    behavior(){
        super.behavior();
        if (Dangers[Dangers.length-1] != this && attacker.tick < 31){
            let selfindex = Dangers.indexOf(this);
            if (selfindex !== 1){
            let temp = Dangers[selfindex];
            Dangers[selfindex] = Dangers[Dangers.length - 1];
            Dangers[Dangers.length - 1] = temp;
            }
        }
        if (!this.props.unmoving) this.heartmovement(["left","up","down","right"][Randint(4)]);
    }

    heartmovement(direction){
        switch (direction){
            case "left":
            if (this.x - 1 != 0){
                this.x -= 1;
            }
            else{this.heartmovement(["left","up","down","right"][Randint(4)])}
            break;  
            case "up":
            if (this.y - 1 != 0){
                this.y -= 1;
            }
            else{this.heartmovement(["left","up","down","right"][Randint(4)])}
            break;
            case "right":
            if (this.x + 1 != 10){
                this.x += 1;
            }
            else{this.heartmovement(["left","up","down","right"][Randint(4)])}
            break;
            case "down":
            if (this.y + 1 != 10){
                this.y += 1;
            }
            else{this.heartmovement(["left","up","down","right"][Randint(4)])}
            break;
        }
    }
}

class IWarp extends Indicator{ //Teleports Plyaer.
    constructor(posx,posy,duration){
        super(posx, posy, duration);
        audiohandler.play("warp", "sfx");
    }

    draw(inc){
        let posx = GLOBAL_OFFSET + (this.x * inc - (inc / 2));
        let posy = GLOBAL_OFFSET + (this.y * inc - (inc / 2));
        CTX.lineWidth = 0;
        artful.DrawCircle(posx,posy,1,`rgba(230, 0, 255, 0.4)`,`rgba(137, 137, 137, 0)`)
    }
}

class IConfetti extends Indicator{ //Is specifically for when the player successfully completes a round with glass bones. also techinically an indicator.
    constructor(){
        const desx = Randint(SCREEN.width - GLOBAL_OFFSET) + GLOBAL_OFFSET;
        super(desx,-50,40,{RefreshOnFrame: true});
        this.rotation = 0;
        this.rotationspeed = Math.random() * 5 * ((Randint(2) == 0) ? -1 : 1); //choose clockwise or counterclockwise;
        this.forceY =  Math.random() * 10; //gravity. also make it random so theres kinda a delay?
        this.gravity = -0.16; //how much faster it gets every frame.
        this.color = `rgb(${Randint(256)},${Randint(256)},${Randint(256)})`;
        this.behavior = this.behavior.bind(this);
        document.addEventListener('refreshframe', this.behavior);
    }

    behavior(){
        this.y -= this.forceY;
        this.forceY += this.gravity;
        this.rotation += this.rotationspeed;
        this.rotation %= 360;
        if (this.y > SCREEN.width + GLOBAL_OFFSET) {
            killme(this);
        }
    }

    draw(){
        artful.DrawConfetti(this.x, this.y, this.rotation, this.color)
    }
}

class ShadowMe{ //Mix-up. Trails behind the player
    constructor(posx, posy){
        this.x = posx;
        this.y = posy;
        this.z = 5;
        this.active = false;
        this.moves = [];
        this.behavior = this.behavior.bind(this);
        document.addEventListener('player-movement', this.behavior);
    }

    draw(inc){
        let posx = GLOBAL_OFFSET + (this.x * inc - (inc / 2));
        let posy = GLOBAL_OFFSET + (this.y * inc - (inc / 2));
        if (this.active == true){
            artful.DrawCircle(posx,posy,1,`rgb(0, 0, 255)`,`rgb(118, 118, 118)`);
            artful.DrawMyEyes(posx,posy,".",56,"Fira Sans",`rgba(255, 255, 255, 1)`,7.5,0,5,0);
            artful.DrawMyMouth(posx,posy,")",28,"Arial",`rgba(255, 255, 255, 1)`,-5,7.5,270);
        }
        else {
            artful.DrawCircle(posx,posy,1,`rgba(0, 0, 255, .4)`,`rgba(137, 137, 137, 0)`)
        }
    }

    behavior(){
        if (this.moves.length == 5){
            this.active = true;
            this.x = this.moves[0][0];
            this.y = this.moves[0][1];
            this.moves.splice(0,1);
            this.moves.push([PlayerPos[0],PlayerPos[1]]);

        }
        else{
            this.moves.push([PlayerPos[0],PlayerPos[1]]);
        }
    }
}