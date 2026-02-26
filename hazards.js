class DSticker {
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

  nextframe() {
    this.animf += 1;
  }

  behavior() {
    if (this.grace == 0) { this.active = true; }
    if (this.active) { this.lifespan(); }
    else { this.grace -= 1; }
  }

  lifespan() {
    this.duration -= 1;
    if (this.duration == 0) { GAME.killMe(this); }
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
    let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
    let color = this.active ? `rgb(255, 255, 255)` : `rgba(255, 255, 255, 0.4)`;
    let scale = 1;
    if (!this.active) {
      if (this.animf != 16) { this.nextframe(); }
      let t = (this.animf - 1) / 15;
      let eased = (Math.cos(Math.PI * t) - 1) / 2;
      scale = eased;
    }
    let size = inc * this.size * scale;
    let offset = (inc * this.size - size) / 2;
    GAME.artful.DrawHazardBase(posx + offset, posy + offset, size, size, color);
  }
}

class DMover {
  constructor(posx, posy, direction, active) {
    this.x = posx;
    this.y = posy;
    this.z = 2;
    this.direction = direction;
    this.grace = (active == null) ? 2 : 0;
    this.active = active ?? false;
    this.behavior = this.behavior.bind(this);
    this.fq = GAME.tickFrequency;
    this.fqtick = GAME.tickFrequency;
    document.addEventListener('tick', this.behavior);
  }

  behavior() {
    if (this.grace != 0) {
      this.grace -= 1;
      if (this.grace == 0) { this.active = true; }
    }
    else if (this.fq == this.fqtick) {
      this.fqtick = 1;
      switch (this.direction) {
        case "Up":
          this.y -= 1;
          if (this.y < 1) { GAME.killMe(this); }
          break;
        case "Down":
          this.y += 1;
          if (this.y > 9) { GAME.killMe(this); }
          break;
        case "Left":
          this.x -= 1;
          if (this.x < 1) { GAME.killMe(this); }
          break;
        case "Right":
          this.x += 1;
          if (this.x > 9) { GAME.killMe(this); }
          break;
        default:
          console.log("something broke lil bro", GAME.Dangers.indexOf(this), this.direction);
          break;
      }
    }
    else { this.fqtick += 1; }
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
    let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
    let IsBackgroundSpaceTaken = GAME.artful.ConsiderMover(this);
    let color = IsBackgroundSpaceTaken ? "rgba(0,0,0,0)" : this.active ? `rgb(255, 255, 255)` : `rgba(0, 0, 0, 0)`;
    let arrowcolor = this.active ? `rgb(0, 0, 0)` : `rgb(255, 0, 0)`;
    GAME.artful.DrawHazardBase(posx, posy, inc, inc, color);
    GAME.artful.DrawArrow(posx, posy, arrowcolor, this.direction);
  }
}

class DFirework extends DMover {
  constructor(posx, posy, direction, duration) {
    super(posx, posy, direction);
    this.duration = duration;
  }

  behavior() {
    if (this.duration > 0) { super.behavior(); }
    if (this.duration < 1) { this.explode(); }
    else if (this.active) { this.duration -= 1; }
  }

  explode() {
    ["Up", "Down", "Left", "Right"].forEach(dir => {
      GAME.Dangers.push(new DMover(this.x, this.y, dir, true));
    });
    GAME.killMe(this);
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
    let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
    let activatedcolorset = this.duration >= 2 ? [`rgba(255, 136, 0, 1)`, `rgba(0, 0, 0, 1)`] : [`rgb(255, 0, 0)`, `rgb(255,255,255)`];
    let IsBackgroundSpaceTaken = GAME.artful.ConsiderMover(this);
    let color = IsBackgroundSpaceTaken ? "rgba(0,0,0,0)" : this.active ? activatedcolorset[0] : `rgba(0, 0, 0, 0)`;
    let arrowcolor = this.active ? activatedcolorset[1] : `rgb(255, 0, 0)`;
    GAME.artful.DrawHazardBase(posx, posy, inc, inc, color);
    GAME.artful.DrawArrow(posx, posy, arrowcolor, this.direction);
  }
}

class DSweeper {
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

  nextframe() { this.animf += 1; }

  behavior() {
    if (this.grace == 0) { this.active = true; }
    if (this.active) { this.lifespan(); }
    else { this.grace -= 1; }
  }

  lifespan() {
    this.duration -= 1;
    if (this.duration == 0) { GAME.killMe(this); }
  }

  draw(inc) {
    var eased = 1;
    if (!this.active) {
      if (this.animf != 16) { this.nextframe(); }
      let t = (this.animf - 1) / 15;
      eased = (Math.cos(Math.PI * t) - 1) / 2;
    }
    if (this.direction == "vertical") { this.drawvert(inc, eased); }
    else { this.drawhorz(inc, eased); }
  }

  drawvert(inc, eased) {
    let posx = GLOBAL_OFFSET + (this.pos - 1) * inc;
    let color = this.active ? `rgba(255, 255, 255, 1)` : `rgba(255, 255, 255, 0.4)`;
    let size = inc * this.size * eased;
    let offset = (inc * this.size - size) / 2;
    GAME.artful.DrawHazardBase(posx + offset, GLOBAL_OFFSET, size, 9 * inc, color);
  }

  drawhorz(inc, eased) {
    let posy = GLOBAL_OFFSET + (this.pos - 1) * inc;
    let color = this.active ? `rgba(255, 255, 255, 1)` : `rgba(255, 255, 255, 0.4)`;
    let size = inc * this.size * eased;
    let offset = (inc * this.size - size) / 2;
    GAME.artful.DrawHazardBase(GLOBAL_OFFSET, posy + offset, 9 * inc, size, color);
  }
}

class DCollect {
  constructor(posx, posy, duration) {
    this.x = posx;
    this.y = posy;
    this.z = 4;
    this.duration = duration;
    this.active = true;
    this.behavior = this.behavior.bind(this);
    document.addEventListener('tick', this.behavior);
  }

  nextframe() { this.animf += 1; }

  behavior() {
    if (this.grace == 0) { this.active = true; }
    if (this.active) { this.lifespan(); }
    else { this.grace -= 1; }
  }

  lifespan() {
    this.duration -= 1;
    if (this.duration <= 0) {
      GAME.hurt();
      GAME.killMe(this);
    }
  }

  safe() {
    GAME.audiohandler.play("collect", "sfx");
    GAME.killMe(this);
  }

  draw(inc) {
    if (this.active) {
      let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
      let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
      let counter = Math.floor(this.duration / 2);
      let color = this.duration % 2 == 0 ? `rgb(0, 255, 0)` : `rgb(0, 226, 0)`;
      let textcolor = "rgb(0,0,0)";
      GAME.artful.DrawHazardBase(posx, posy, inc, inc, color);
      GAME.CTX.font = "55px serif";
      const CounterFontSize = 55;
      const CounterFont = "serif";
      GAME.artful.DrawText(counter, {size: CounterFontSize, font: CounterFont}, textcolor, posx + (inc - GAME.CTX.measureText(counter.toString()).width) / 2, posy + inc / 1.25);
    }
  }
}

class DStalker {
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

  nextframe() { this.animf += 1; }

  behavior() {
    let movehow = Randint(2) + 1;
    if (this.grace == 0) { this.active = true; }
    if (this.active == true) {
      if (this.duration % 2 == 0) { this.movement(movehow); }
      this.lifespan();
    }
    else { this.grace -= 1; }
  }

  movement(movehow) {
    const pos = GAME.playerPos;
    if (this.x != pos[0] || this.y != pos[1]) {
      if (this.x == pos[0]) {
        if (this.y > pos[1]) { this.y -= 1; } else { this.y += 1; }
      }
      else if (this.y == pos[1]) {
        if (this.x > pos[0]) { this.x -= 1; } else { this.x += 1; }
      }
      else {
        if (movehow == 1) {
          if (this.y > pos[1]) { this.y -= 1; } else { this.y += 1; }
        }
        else {
          if (this.x > pos[0]) { this.x -= 1; } else { this.x += 1; }
        }
      }
    }
  }

  lifespan() {
    this.duration -= 1;
    if (this.duration == 0) {
      GAME.Dangers.push(new IPop(this.x, this.y));
      GAME.killMe(this);
    }
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
    let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
    let color = this.active ? `rgba(255, 0, 0, 1)` : `rgba(255, 0, 0, 0.4)`;
    let scale = 1;
    let IsBackgroundSpaceTaken = GAME.artful.ConsiderMover(this);
    if (!this.active) {
      if (this.animf != 16) { this.nextframe(); }
      let t = (this.animf - 1) / 15;
      let eased = (Math.cos(Math.PI * t) - 1) / 2;
      scale = eased;
    }
    let size = inc * scale;
    let offset = (inc - size) / 2;
    if (!IsBackgroundSpaceTaken) { GAME.artful.DrawHazardBase(posx + offset, posy + offset, size, size, color); }
    if (this.active) {
      if (!IsBackgroundSpaceTaken) { GAME.artful.DrawStalkerFace(posx, posy, "rgb(0,0,0)"); }
      else { GAME.artful.DrawCellOutline(posx + offset, posy + offset, size, size, "rgb(193, 0, 0)"); }
    }
  }
}

class DSploder extends DStalker {
  constructor(posx, posy, duration) {
    super(posx, posy, duration);
  }

  behavior() {
    if (this.duration > 0) { super.behavior(); }
    if (this.duration < 1) { this.explode(); }
    else if (this.active) { this.duration -= 1; }
  }

  explode() {
    ["Up", "Down", "Left", "Right"].forEach(dir => {
      GAME.Dangers.push(new DMover(this.x, this.y, dir, true));
    });
    GAME.killMe(this);
  }

  lifespan() {
    // won't do anything now to prevent bugs
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
    let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
    let activatedcolorset = this.duration >= 2 ? [`rgba(255, 136, 0, 1)`, `rgba(0, 0, 0, 1)`] : [`rgb(255, 0, 0)`, `rgb(255,255,255)`];
    let color = this.active ? activatedcolorset[0] : `rgba(255, 136, 0, 0.4)`;
    let scale = 1;
    let IsBackgroundSpaceTaken = GAME.artful.ConsiderMover(this);
    if (!this.active) {
      if (this.animf != 16) { this.nextframe(); }
      let t = (this.animf - 1) / 15;
      let eased = (Math.cos(Math.PI * t) - 1) / 2;
      scale = eased;
    }
    let size = inc * scale;
    let offset = (inc - size) / 2;
    if (!IsBackgroundSpaceTaken) { GAME.artful.DrawHazardBase(posx + offset, posy + offset, size, size, color); }
    if (this.active) {
      if (!IsBackgroundSpaceTaken) { GAME.artful.DrawStalkerFace(posx, posy, activatedcolorset[1]); }
      else { GAME.artful.DrawCellOutline(posx + offset, posy + offset, size, size, "rgb(193, 0, 0)"); }
    }
  }
}

class DSeeker extends DStalker {
  constructor(posx, posy, duration) {
    super(posx, posy, duration);
    this.seekbehavior = this.seekbehavior.bind(this);
    document.addEventListener('player-movement', this.seekbehavior);
  }

  seekbehavior() {
    if (this.active) {
      let movehow = Randint(3) + 1;
      let willmove = Randint(2) + 1;
      if (willmove == 1) { this.movement(movehow); }
    }
  }

  behavior() {
    if (this.grace == 0) { this.active = true; }
    else { this.grace -= 1; }
    if (this.active) { this.lifespan(); }
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
    let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
    let color = this.active ? `rgb(183, 0, 0)` : `rgba(255, 0, 0, 0.4)`;
    let scale = 1;
    let IsBackgroundSpaceTaken = GAME.artful.ConsiderMover(this);
    if (!this.active) {
      if (this.animf != 16) { this.nextframe(); }
      let t = (this.animf - 1) / 15;
      let eased = (Math.cos(Math.PI * t) - 1) / 2;
      scale = eased;
    }
    let size = inc * scale;
    let offset = (inc - size) / 2;
    if (!IsBackgroundSpaceTaken) { GAME.artful.DrawHazardBase(posx + offset, posy + offset, size, size, color); }
    if (this.active) {
      if (!IsBackgroundSpaceTaken) { GAME.artful.DrawSeekerFace(posx, posy, "rgb(0,0,0)"); }
      else { GAME.artful.DrawCellOutline(posx + offset, posy + offset, size, size, "rgb(193, 0, 0)"); }
    }
  }
}

class Indicator {
  constructor(posx, posy, duration, props) {
    this.x = posx;
    this.y = posy;
    this.props = props ?? false;
    this.z = this.props.zorder ?? 5;
    this.duration = duration ?? 0;
    this.active = false;
    this.behavior = this.behavior.bind(this);
    let refreshCondition = this.props.refreshCondition ?? "tick";
    document.addEventListener(refreshCondition, this.behavior);  
  }

  behavior() {
    this.duration -= 1;
    if (this.duration == 0) { GAME.killMe(this); }
  }
}

class IHeal extends Indicator {
  constructor(posx, posy, duration, props) {
    super(posx, posy, duration, props);
    this.active = true;
    GAME.audiohandler.play("heartstart", "sfx");
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x - 1) * inc;
    let posy = GLOBAL_OFFSET + (this.y - 1) * inc;
    GAME.artful.DrawImage(HEART, posx, posy, true, inc, inc);
  }

  safe() {
    GAME.audiohandler.play("heartget", "sfx");
    GAME.healed = 10;
    GAME.hpUp();
    GAME.killMe(this);
  }

  behavior() {
    super.behavior();
    if (GAME.Dangers[GAME.Dangers.length - 1] != this && GAME.attacker.tick < 31) {
      let selfindex = GAME.Dangers.indexOf(this);
      if (selfindex !== 1) {
        let temp = GAME.Dangers[selfindex];
        GAME.Dangers[selfindex] = GAME.Dangers[GAME.Dangers.length - 1];
        GAME.Dangers[GAME.Dangers.length - 1] = temp;
      }
    }
    if (!this.props.unmoving) { this.heartmovement(["left", "up", "down", "right"][Randint(4)]); }
  }

  heartmovement(direction) {
    switch (direction) {
      case "left":
        if (this.x - 1 != 0) { this.x -= 1; }
        else { this.heartmovement(["left", "up", "down", "right"][Randint(4)]); }
        break;
      case "up":
        if (this.y - 1 != 0) { this.y -= 1; }
        else { this.heartmovement(["left", "up", "down", "right"][Randint(4)]); }
        break;
      case "right":
        if (this.x + 1 != 10) { this.x += 1; }
        else { this.heartmovement(["left", "up", "down", "right"][Randint(4)]); }
        break;
      case "down":
        if (this.y + 1 != 10) { this.y += 1; }
        else { this.heartmovement(["left", "up", "down", "right"][Randint(4)]); }
        break;
    }
  }
}

class IWarp extends Indicator {
  constructor(posx, posy, duration) {
    super(posx, posy, duration, {});
    GAME.audiohandler.play("warp", "sfx");
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x * inc - (inc / 2));
    let posy = GLOBAL_OFFSET + (this.y * inc - (inc / 2));
    GAME.CTX.lineWidth = 0;
    GAME.artful.DrawCircle(posx, posy, 1, `rgba(230, 0, 255, 0.4)`, `rgba(137, 137, 137, 0)`);
  }
}

class IConfetti extends Indicator {
  constructor() {
    const desx = Randint(GAME.SCREEN.width - GLOBAL_OFFSET) + GLOBAL_OFFSET;
    super(desx, -50, 40, {refreshCondition: "refreshframe"});
    this.rotation = 0;
    this.rotationspeed = Math.random() * 5 * ((Randint(2) == 0) ? -1 : 1);
    this.forceY = Math.random() * 10;
    this.gravity = -0.16;
    this.color = `rgb(${Randint(256)},${Randint(256)},${Randint(256)})`;
  }

  behavior() {
    this.y -= this.forceY;
    this.forceY += this.gravity;
    this.rotation += this.rotationspeed;
    this.rotation %= 360;
    if (this.y > GAME.SCREEN.width + GLOBAL_OFFSET) { GAME.killMe(this); }
  }

  draw() {
    GAME.artful.DrawConfetti(this.x, this.y, this.rotation, this.color);
  }
}

class ITruck extends Indicator { //I know it techinically instakills you but who cares!
  constructor() {
    const inc = GAME.artful.inc;
    const FRAMESTEPS = 30; //how much should it move every frame?
    const frames = 180;
    const finalx = GLOBAL_OFFSET + (GAME.playerPos[0] * inc) - (inc / 2);
    let posx = finalx + (FRAMESTEPS * frames);
    let posy = GLOBAL_OFFSET + (GAME.playerPos[1] * inc) - (inc / 2);
    super(posx, posy, 0, {refreshCondition: "refreshframe"});
    this.getDirection();
    this.steps = FRAMESTEPS;
    this.finalx = finalx;
    this.frame = frames;
  }

  getDirection() {
    let posx = GAME.playerPos[0];
    if (posx >= 5) {
      this.asset = TRUCKR;
      this.direction = "right";
    }
    else {
      this.asset = TRUCKL;
      this.direction = "left";
    }
  }

  behavior() {
    console.log(this.x);
    this.frame -= 1;
    if (this.direction == "left") {  
      this.x = this.finalx + (this.steps * this.frame);
      if (this.finalx == this.x) {
        GAME.killMe(this); 
      }
    }
    else if (this.direction == "right") {
      this.x = this.finalx - (this.steps * this.frame);
      if (this.finalx <= this.x + 1024) {
        GAME.killMe(this); 
      }
    }
  }

  draw() {
    const SIZE = 1024;
    GAME.artful.DrawImage(this.asset, this.x, this.y-(SIZE/1.75), true, SIZE, SIZE);
  }
}

class ITextFlash extends Indicator {
  constructor(text, container) {
    const inc = GAME.artful.inc;
    let posx = GLOBAL_OFFSET + (5 * inc - (inc / 2));
    let posy = 415;
    super(posx, posy, 15, {refreshCondition: "refreshframe"});
    this.opacity = 0;
    this.textSize = 800;
    this.text = text;
    this.container = container;
    this.data = GAME.artful.fitTextToBox(this.text, "Roboto Mono", 600, 600, GLOBAL_OFFSET, GLOBAL_OFFSET);
  }

  behavior() {
    if (this.duration > 11) {
      this.opacity += 0.2;
    }
    else if (this.duration < 6) {
      this.opacity -= 0.2;
    }
    this.duration -= 1;
    if (this.duration <= 0){
      GAME.killMe(this, this.container);
    }
  }

  draw() {
    const data = this.data;
    GAME.artful.DrawText(this.text, {size: data.fontSize, font: "Roboto Mono"},`rgba(255,255,255,${this.opacity})`, data.x, data.y, {isCentered: true, preCentered: true});
  }
}

class ISleepy extends Indicator {
  constructor() {
    const X_OFFSET = GAME.variant == "big" ? 60 : 20;
    const Y_OFFSET = GAME.variant == "big" ? -60 : -20; //how much offset diagonally?
    let posx = X_OFFSET + GLOBAL_OFFSET + ((GAME.playerPos[0]) * GAME.artful.inc - (GAME.artful.inc / 2));
    let posy = Y_OFFSET + GLOBAL_OFFSET + ((GAME.playerPos[1]) * GAME.artful.inc - (GAME.artful.inc / 2)); 
    super(posx, posy, 120, {refreshCondition: "refreshframe"});
    this.textSize = GAME.variant == "big" ? 32 : 12;
    this.opacity = 0;
    this.text = GAME.variant == "disco" ? "!" : "Z";
  }

  behavior() {
    const MAX_DURATION = 120;
    this.x += 0.2;
    this.y -= 0.15;
    if (this.duration > MAX_DURATION - 10) {
      this.opacity += 0.1;
    }
    else if (this.duration < 11) {
      this.opacity -= 0.1;
    }
    this.duration -= 1;
    if (this.duration <= 0){
      GAME.killMe(this, GAME.pauseDat.pauseStorage);
    }
  }

  draw() {
    GAME.artful.DrawText(this.text, {size: this.textSize, font: "Times New Roman"},`rgba(255,255,255,${this.opacity})`, this.x, this.y, {isCentered: true, preCentered: true});
  }
}

class IShadowFraud extends Indicator {
  constructor(x, y) {
    const inc = GAME.artful.inc
    let posx = GLOBAL_OFFSET + (x * inc) - (inc / 2);
    let posy = GLOBAL_OFFSET + (y * inc) - (inc / 2);
    super(posx, posy, 0, {refreshCondition: "refreshframe"});
    this.stuckBugFix(x,y);
    this.xvel = Randint(2) == 1 ? 3 : -3;
    this.yvel = Randint(2) == 1 ? 3 : -3;
  }

  stuckBugFix(x,y){
    if (x == 1){
      this.x += 30;
    }
    if (x == 9){
      this.x -= 30;
    }
    if (y == 1){
      this.y += 30;
    }
    if (y == 9){
      this.y -= 30;
    }
  }

  draw() {
    const inc = GAME.artful.inc;
    let posx = this.x - (inc / 2);
    let posy = this.y - (inc / 2);
    GAME.artful.DrawCircle(posx, posy, 1, `rgb(0, 0, 255)`, `rgb(118, 118, 118)`);
    GAME.artful.DrawMyEyes(posx, posy, ".", 56, "Fira Sans", `rgba(255, 255, 255, 1)`, 7.5, 0, 5, 0);
    GAME.artful.DrawMyMouth(posx, posy, ")", 28, "Arial", `rgba(255, 255, 255, 1)`, -5, 7.5, 270);
  }

  behavior() {
    this.x += this.xvel;
    this.y += this.yvel;
    if (this.x <= GLOBAL_OFFSET*3.2 || this.x >= 600 + GLOBAL_OFFSET) {
      this.xvel *= -1;
      if (Math.abs(this.yvel) == this.yvel) {
        this.yvel = 3 * (0.5 + Randint(6)/5);
      }
      else {
        this.yvel = -3 * (0.5 + Randint(6)/5);
      }
    }
    if (this.y <= GLOBAL_OFFSET*3.2 || this.y >= 600 + GLOBAL_OFFSET) {
      this.yvel *= -1;
      if (Math.abs(this.xvel) == this.xvel) {
        this.xvel = 3 * (0.5 + Randint(6)/5);
      }
      else {
        this.xvel = -3 * (0.5 + Randint(6)/5);
      }
    }
  }
}

class IPop extends Indicator {
  constructor(posx, posy) {
    super(posx, posy, 24, {RefreshOnFrame: true, zorder: 1});
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x * inc - (inc / 2));
    let posy = GLOBAL_OFFSET + (this.y * inc - (inc / 2));
    GAME.artful.DrawPop(posx, posy, this.duration);
  }
}

class ShadowMe {
  constructor(posx, posy) {
    this.x = posx;
    this.y = posy;
    this.z = 5;
    this.active = false;
    this.moves = [];
    this.behavior = this.behavior.bind(this);
    document.addEventListener('player-movement', this.behavior);
  }

  draw(inc) {
    let posx = GLOBAL_OFFSET + (this.x * inc - (inc / 2));
    let posy = GLOBAL_OFFSET + (this.y * inc - (inc / 2));
    if (this.active == true) {
      GAME.artful.DrawCircle(posx, posy, 1, `rgb(0, 0, 255)`, `rgb(118, 118, 118)`);
      GAME.artful.DrawMyEyes(posx, posy, ".", 56, "Fira Sans", `rgba(255, 255, 255, 1)`, 7.5, 0, 5, 0);
      GAME.artful.DrawMyMouth(posx, posy, ")", 28, "Arial", `rgba(255, 255, 255, 1)`, -5, 7.5, 270);
    }
    else {
      GAME.artful.DrawCircle(posx, posy, 1, `rgba(0, 0, 255, .4)`, `rgba(137, 137, 137, 0)`);
    }
  }

  behavior() {
    const pos = GAME.playerPos;
    if (this.moves.length == 5) {
      this.active = true;
      this.x = this.moves[0][0];
      this.y = this.moves[0][1];
      this.moves.splice(0, 1);
      this.moves.push([pos[0], pos[1]]);
    }
    else { this.moves.push([pos[0], pos[1]]); }
  }
}