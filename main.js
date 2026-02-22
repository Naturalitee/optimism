class GameHandler {
    constructor() {
        this.playerPos = [5, 5];
        this.bpm = 120;
        this.startingHP = 5;
        this.hp = 0;
        this.Dangers = [];
        this.BPMtick = this.BPMtick.bind(this);
        this.Interval = TESTINGMODE ? setInterval(this.BPMtick, ((60/this.bpm) / 2)*1000) : null;
        this.artful = null;
        this.INCREMENT = 600 / 9;
        this.variant = "none";
        this.isHurt = false;
        this.isInterlude = false;
        this.hurtCooldown = 0;
        this.currentBeat = 0;
        this.startUp = TESTINGMODE ? 5 : 0;
        this.transitionTime = false;
        this.transition = 0;
        this.healed = 0;
        this.screenState = TESTINGMODE ? "game" : "loading";
        this.startHP = 5;
        this.tickFrequency = 1;
        this.beat = 0;
        this.loadedSounds = 0;
        this.pauseDat = {
            pauseQueued: false,
            gamePaused: false,
            pauseBeat: 1, //should only be 1 to 16 (2 bars)
            faceState: 0, //0 for o, 1 for >
            pauseOverlayOpacity: 0,
            pauseTitlePulseFrame: 0,
            pauseButtonPulseFrame: 0,
            pauseStorage: []
        }
        document.addEventListener("DOMContentLoaded", () => {
            this.SCREEN = document.getElementById("Canvas");
            this.SCREEN.width = this.SCREEN.clientWidth;
            this.SCREEN.height = this.SCREEN.clientHeight;
            this.CTX = this.SCREEN.getContext("2d");
            this.createSubsystems();
        }, {once: true});
    }

    createSubsystems() {
        this.mixer = new Mixer(this);
        this.audiohandler = new AudioHandler(this);
        this.attacker = new AttackLoader(this);
        this.inputhandler = new InputHandler(this);
        this.modifierhandler = new ModifierHandler(this);
        this.artful = new Artful(this, this.CTX, this.INCREMENT);
        this.fps = setInterval(() => this.mainloop(), FPS_IN_MS); //load all systems, and then establish the loop!
        if (TESTINGMODE) {
            initalizeAdminPanel();
        }
    }

    increaseTempo() {
        this.artful.PulseActive = true;
        this.bpm += this.BPMchange();
        clearInterval(this.Interval);
        this.Interval = setInterval(() => this.BPMtick(), ((60 / this.bpm) / 2) * 1000);
        this.inputhandler.ChangeDelay(this.bpm);
        let bgm = this.attacker.attackNum != 1 ? `main${Randint(BGMCOUNT) + 1}` : `main1`;
        this.audiohandler.soundSpeed = this.bpm / BASEBPM;
        this.audiohandler.volumecontrol();
        this.audiohandler.play(bgm, "bgm");
    }

    BPMchange() {
        if (this.variant == "doubletime") return this.modifierhandler.bpmchange * 2;
        else if (this.variant == "replay") return 0;
        else return this.modifierhandler.bpmchange;
    }

    BPMtick() {
        if (this.pauseDat.gamePaused) return;
        document.dispatchEvent(tick);
        this.beat += 1;
        if (this.startUp == 4) {
            this.start();
            this.startUp = 5;
        }
        if (this.startUp < 4 && this.beat % 2 != 0) {
            this.startUp += 1;
        }
    }

    drawPlayer(inc) {
        let posx = GLOBAL_OFFSET + (this.playerPos[0] * inc - (inc / 2));
        let posy = GLOBAL_OFFSET + (this.playerPos[1] * inc - (inc / 2));
        let color, stroke;
        stroke = `rgba(137,137,137,${this.artful.playerOpac})`;
        if (!this.mixer.visible && !this.pauseDat.gamePaused) { stroke = "rgba(0,0,0,0)"; }
        if (this.variant == "inverted") {
            color = `rgba(174, 255, 0, ${this.artful.playerOpac})`;
        } else if (this.variant == "disco" && !this.pauseDat.gamePaused) {
            color = `rgba(${255 - (63.75 * this.mixer.lastmoved)}, ${255 - (63.75 * this.mixer.lastmoved)}, 0, ${this.artful.playerOpac})`;
        } else if (this.variant == "pulse" && !this.pauseDat.gamePaused) {
            color = this.mixer.visible ? `rgba(255, 255, 0, ${this.artful.playerOpac})` : `rgba(255, 255, 0, 0)`;
        } else {
            color = `rgba(255, 255, 0, ${this.artful.playerOpac})`;
        }
        this.artful.DrawCircle(posx, posy, this.mixer.scale, color, stroke);
        this.drawPlayerFace(posx, posy);
    }

    drawPlayerFace(posx, posy) {
        const scale = this.mixer.scale;
        let color = `rgba(0,0,0,${this.artful.playerOpac})`;
        let ox = 0;
        let oy = 0;

        if (this.variant == "disco") {
            const opacity = 63.75 * this.mixer.lastmoved;
            color = this.pauseDat.gamePaused ? "rgb(0,0,0)" : `rgba(${opacity}, ${opacity}, ${opacity}, 1)`;
            ox = (Math.random() * 4 - 2) * scale;
            oy = (Math.random() * 4 - 2) * scale;
        } else if (this.variant == "doubledamage") {
            ox = this.mixer.eyemovement;
        } else if (this.variant == "glassbones") {
            ox = (Math.random() * 4 - 2) * scale;
        } else {
            if (this.artful.eyeOffset[0] == "x") ox = this.artful.eyeOffset[1] * scale;
            else oy = this.artful.eyeOffset[1] * scale;
        }

        switch (true) {
            case this.pauseDat.gamePaused && this.variant != "disco":
                this.artful.DrawMyEyes(posx, posy, "-", 32 * scale, "Arial", color, 7.5 * scale, 0, 5 * scale, 7);
                this.artful.DrawMyMouth(posx, posy, this.pauseDat.faceState == 1 ? "^" : "o", 20, "Verdana", color, 0, this.pauseDat.faceState == 1 ? 10 : 7.5);
                break;
            case this.isHurt:
                this.artful.DrawMyEyes(posx, posy, "x", 16 * scale, "Verdana", color, 7.5 * scale, ox, 5 * scale, oy, "bold");
                this.artful.DrawMyMouth(posx, posy, ")", 28, "Arial", color, -5, 7.5, 270);
                break;
            case this.variant == "disco":
                this.artful.DrawMyEyes(posx, posy, "o", 16 * scale, "Fira Sans", color, 7.5 * scale, ox, 5 * scale, oy);
                this.artful.DrawMyMouth(posx, posy, "<", 20, "Verdana", color, -5, 6.5, 270);
                break;
            case this.variant == "doubledamage":
                this.artful.DrawMyEyes(posx, posy, ".", 56 * scale, "Fira Sans", color, 7.5 * scale, ox, 5 * scale, oy);
                this.artful.DrawMyMouth(posx, posy, "-", 20, "Arial", color, 0, 6, 180);
                break;
            case this.variant == "glassbones":
                this.artful.DrawMyEyes(posx, posy, "o", 20 * scale, "Fira Sans", color, 7.5 * scale, ox, 5 * scale, oy);
                this.artful.DrawMyMouth(posx + ox, posy, "~", 44, "Courier", color, 0, 20, 0);
                break;
            case this.attacker.pattern.length == 17:
                this.artful.DrawMyEyes(posx, posy, "^", 16 * scale, "Verdana", color, 7.5 * scale, ox, 1 * scale, oy, "bold");
                this.artful.DrawMyMouth(posx, posy, this.attacker.clbrt == 1 ? "o" : "-", 20, "Verdana", color, 0, 6.5, 0);
                break;
            default:
                this.artful.DrawMyEyes(posx, posy, ".", 56 * scale, "Fira Sans", color, 7.5 * scale, ox, 5 * scale, oy);
                this.artful.DrawMyMouth(posx, posy, ")", 28 * scale, "Arial", color, 5 * scale, 7.5 * scale, 90);
                break;
        }
    }

    drawHazards(inc) {
        this.Dangers.forEach(item => item.draw(inc));
        this.artful.MoverStorage = [];
    }

    mainloop() {
        this.gameLoop();
        this.renderFrame();
    }

    gameLoop() {
        if (this.screenState == "loading") {
            if (this.loadedSounds / SOUNDCOUNT == 1) { this.screenState = "warning"; }
        }
        if (this.screenState == "menu") {
            if (this.inputhandler.clickGrace != 0) { this.inputhandler.clickGrace -= 1; }
            if (this.transitionTime && this.transition != 100) {
                this.transition += 1;
                this.audiohandler.musicFade += 1;
                this.audiohandler.volumecontrol();
            }
            if (this.transition == 100) { this.gtransitionstart(); }
            this.artful.textAnimFrames += 1;
            if (this.artful.textAnimFrames == 30) { this.textFace *= -1; this.artful.textAnimFrames = 0; }
        }
        if (this.screenState == "gameover") {
            if (this.startUp == 270) { this.audiohandler.play("titletheme", "bgm"); }
            if (this.startUp % 90 == 0) { this.audiohandler.play("reveal", "sfx"); }
            if (this.startUp != 271) { this.startUp += 1; }
            this.artful.textAnimFrames += 1;
            if (this.artful.textAnimFrames == 30) { this.textFace *= -1; this.artful.textAnimFrames = 0; }
        }
        if (this.screenState == "game") {
            const data = this.pauseDat;
            if (data.gamePaused) {
                document.dispatchEvent(PausedRefreshOnFrame);
                if (this.audiohandler.musicFade > 0) {
                    this.audiohandler.musicFade -= 0.5;
                    this.audiohandler.volumecontrol();
                }
                if (data.pauseTitlePulseFrame > 0) {
                    data.pauseTitlePulseFrame -= 1;
                }
                if (data.pauseButtonPulseFrame > 0) {
                    data.pauseButtonPulseFrame -= 1;
                }
                return;
            }
            if (this.isHurt) {
                this.hurtCooldown -= 1;
                if (this.hurtCooldown == 0) { this.isHurt = false; this.artful.playerOpac = 1; }
            }
            if (this.healed != 0) { 
                this.healed -= 1; 
            }
            if (this.artful.eyeOffset[1] != 0) {
                this.artful.eyeOffsetFrames -= 1;
                if (this.artful.eyeOffsetFrames == 0) { this.artful.eyeOffset = [0, 0]; }
            }
            this.hitReg();
            document.dispatchEvent(RefreshOnFrame);
        }
    }

    renderFrame() {
        this.CTX.clearRect(0, 0, this.SCREEN.width, this.SCREEN.height);
        this.artful.DrawFrame();
        if (this.screenState == "warning") {
            this.artful.DrawText("WARNING", {size: 64, font: "Arial"}, "rgba(255, 0, 0, 1)", GLOBAL_OFFSET, 100, {isCentered: true, definedCenter: true});
            this.artful.DrawText('This "game" contains flashing lights. Do not proceed if', {size: 24, font: "Arial"}, "rgba(255, 255, 255, 1)", GLOBAL_OFFSET, 200, {isCentered: true, definedCenter: true});
            this.artful.DrawText('you are sensitive to flashing lights or suffer from', {size: 24, font: "Arial"}, "rgba(255, 255, 255, 1)", GLOBAL_OFFSET, 230, {isCentered: true, definedCenter: true});
            this.artful.DrawText('photosensitive epilepsy.', {size: 24, font: "Arial"}, "rgba(255, 255, 255, 1)", GLOBAL_OFFSET, 260, {isCentered: true, definedCenter: true});
            this.artful.DrawText('click anywhere to continue.', {size: 24, font: "Arial"}, "rgba(255, 255, 255, 1)", GLOBAL_OFFSET, 600, {isCentered: true, definedCenter: true});
        }
        if (this.screenState == "loading") {
            this.artful.DrawText("Loading...", {size: 64, font: "Comic Sans MS"}, "rgba(255, 255, 255, 1)", GLOBAL_OFFSET, 350, {isCentered: true, definedCenter: true});
            this.artful.DrawText(`${this.loadedSounds}/${SOUNDCOUNT}`, {size: 36, font: "Comic Sans MS"}, "rgba(255, 255, 255, 1)", GLOBAL_OFFSET, 500, {isCentered: true, definedCenter: true});
        }
        if (this.screenState == "menu") {
            this.artful.DrawImage(this.textFace == 1 ? TITLE1 : TITLE2, 40, -230);
            this.artful.DrawImage(this.textFace == 1 ? PLAY1 : PLAY2, 40, 0);
            this.artful.DrawImage(this.textFace == 1 ? MOD1 : MOD2, 40, 130);
            this.artful.DrawText("volume (use +/- keys to control)", {size: 24, font: "Comic Sans MS"}, "rgb(255,255,255)", GLOBAL_OFFSET, 550, {isCentered: true, definedCenter: true});
            this.artful.DrawText(globalvol * 10, {size: 36, font: "Comic Sans MS"}, "rgb(255,255,255)", GLOBAL_OFFSET, 600, {isCentered: true, definedCenter: true});
            this.CTX.fillStyle = `rgba(0, 0, 0, ${this.transition / 100})`;
            this.CTX.fillRect(GLOBAL_OFFSET, GLOBAL_OFFSET, this.INCREMENT * 9, this.INCREMENT * 9);
        }
        if (this.screenState == "gameover") {
            this.artful.DrawImage(this.textFace == 1 ? GAMEOVER1 : GAMEOVER2, 20, -230);
            if (this.startUp >= 90)  { this.artful.DrawText("Score:", {size: 48, font: "Comic Sans MS"}, "rgb(255,255,255)", GLOBAL_OFFSET, 300, {isCentered: true, definedCenter: true}); }
            if (this.startUp >= 180) { this.artful.DrawText(this.attacker.attackNum - 1, {size: 72, font: "Comic Sans MS"}, "rgb(255,255,255)", GLOBAL_OFFSET, 400, {isCentered: true, definedCenter: true}); }
            if (this.startUp >= 270) { this.artful.DrawText("back to menu", {size: 36, font: "Comic Sans MS"}, "rgb(255,255,255)", GLOBAL_OFFSET, 550, {isCentered: true, definedCenter: true}); }
        }
        if (this.screenState == "punishment") {
            this.artful.DrawText("RIP old punishment screen :(", {size: 36, font: "Comic Sans MS"}, "rgb(255,255,255)", GLOBAL_OFFSET, 350, {isCentered: true, definedCenter: true});
        }
        if (this.screenState == "game") {
            if (!this.pauseDat.gamePaused){
                this.drawHazards(this.INCREMENT);
                this.artful.DrawGrid(this.startUp);
                if (this.startUp >= 4) { this.drawPlayer(this.INCREMENT); }
                this.mixer.drawspeedup();
                this.artful.PulseEffect();
            }
            else {
                const data = this.pauseDat
                this.drawHazards(this.INCREMENT);
                this.artful.DrawGrid(this.startUp);
                this.mixer.drawspeedup();
                if (this.pauseDat.pauseOverlayOpacity < 30) {
                    this.pauseDat.pauseOverlayOpacity += 1;
                }
                this.artful.drawPauseOverlay();
                data.pauseStorage.forEach(item => item.draw());
                this.drawPlayer(this.INCREMENT);
                this.artful.PulseEffect();
            }
        }
    }

    hitReg() {
        let checkhere = [];
        let collecthere = [];
        this.Dangers.sort((a, b) => a.z - b.z);
        this.Dangers.forEach(item => {
            let widthfactor = item.size;
            if (!item.active) return;
            switch (true) {
                case item instanceof DSweeper:
                    if (item.direction == "vertical") {
                        for (let w = 0; w < widthfactor; w++)
                            for (let i = 1; i < 10; i++)
                                checkhere.push([item.pos + w, i]);
                    } else {
                        for (let w = 0; w < widthfactor; w++)
                            for (let i = 1; i < 10; i++)
                                checkhere.push([i, item.pos + w]);
                    }
                    break;
                case checkcollect(item):
                    collecthere.push([item.x, item.y]);
                    break;
                case item instanceof DSticker:
                    if (item.size != 1) {
                        for (let x = 0; x < item.size; x++)
                            for (let y = 0; y < item.size; y++)
                                checkhere.push([item.x + x, item.y + y]);
                    } else { checkhere.push([item.x, item.y]); }
                    break;
                default:
                    checkhere.push([item.x, item.y]);
                    break;
            }
        });
        if (checkhere.some(itm => EqCheck(itm, this.playerPos))) { this.hurt(); }
        if (collecthere.some(itm => EqCheck(itm, this.playerPos))) {
            this.Dangers.forEach(item => {
                if (item.x == this.playerPos[0] && item.y == this.playerPos[1]) { item.safe(); }
            });
        }
    }

    killMe(object, array) {
        const container = array ?? this.Dangers
        document.removeEventListener('tick', object.behavior);
        if (object.props.refreshCondition != undefined) { 
            document.removeEventListener('refreshframe', object.behavior); 
        }
        let victim = container.indexOf(object);
        container.splice(victim, 1);
    }

    queuePauseGame(){
        if (this.pauseDat.pauseQueued) return;
        this.pauseDat.pauseQueued = true;
        console.log("queued for next beat!");
        document.addEventListener('tick', () => {
            this.audiohandler.musicFade = 100;
            this.pauseGame();
        }, {once: true});  
    }

    pauseGame(){
        this.pauseDat.gamePaused = true;
        this.pauseTick = this.pauseTick.bind(this);
        this.pauseMenuInterval = setInterval(this.pauseTick, ((60/151) / 2)*1000); //songs 151 bpm and I dont wanna calc it manually..
        this.audiohandler.play("pausesong", "bgm");
    }

    queueUnpauseGame(){
        
    }

    unpauseGame(){

    }

    pauseTick(){
        const data = this.pauseDat;
        if (data.pauseBeat == 16) {
            data.pauseBeat = 0;
        }
        data.pauseBeat += 1;
        if ((data.pauseBeat - 1) % 4 == 0) {
            data.pauseButtonPulseFrame = 15;
            data.pauseStorage.push(new ISleepy());
        }
        if ((data.pauseBeat - 1) % 2 == 0) {
            data.pauseTitlePulseFrame = 30;
        }
        if ((data.pauseBeat - 1) % 8 == 0) {
            data.faceState = !data.faceState;
        }
    }

    gameOver() {
        clearInterval(this.Interval);
        UpNextHandler();
        this.audiohandler.stopBGM();
        this.hurtCooldown = 0;
        this.isHurt = false;
        this.audiohandler.silence = 1;
        this.bpm = 120;
        this.audiohandler.soundSpeed = this.bpm / BASEBPM;
        for (let i = this.Dangers.length - 1; i >= 0; i--) { this.killMe(this.Dangers[i]); }
        this.startUp = 0;
        this.screenState = "gameover";
    }

    hurt() {
        if (this.isHurt) return;
        this.audiohandler.play("hurt", "sfx");
        this.isHurt = true;
        this.hurtCooldown = 180;
        this.artful.playerOpac = 0.6;
        if (this.variant == "doubledamage") {
            RemoveHeart();
            RemoveHeart();
            this.hp -= 2;
        } else if (this.variant == "glassbones") {
            for (let i = this.hp; i > 0; i--) { RemoveHeart(); }
            this.hp = 0;
        } else {
            RemoveHeart();
            this.hp -= 1;
        }
        if (this.hp <= 0) { this.gameOver(); }
    }

    hpUp() {
        if (this.hp != 10) {
            this.hp += 1;
            CreateHeart();
        }
    }

    start() {
        this.hp = 0;
        this.transitionTime = false;
        this.transition = 0;
        this.bpm -= this.modifierhandler.bpmchange;
        this.increaseTempo();
        for (let i = 1; i <= this.startHP; i++) { this.hpUp(); }
        this.screenState = "game";
        this.attacker.load(Randint(ATTACK_COUNT) + 1);
        this.artful.PulseActive = true;
    }

    gtransitionstart() {
        this.musicFade = 0;
        this.attacker.tick = 0;
        this.attacker.pattern = 0;
        this.playerPos = [5, 5];
        this.beat = 0;
        this.tickFrequency = 1;
        this.startUp = 0;
        this.startHP = 5;
        this.attacker.attackNum = 1;
        this.attacker.randplus = 0;
        this.attacker.randmax = 9;
        this.artful.playerOpac = 1;
        this.variant = "none";
        this.audiohandler.stopBGM();
        this.bpm = 120;
        this.screenState = "game";
        this.audiohandler.volumecontrol();
        this.audiohandler.play("countin", "bgm");
        this.Interval = setInterval(() => this.BPMtick(), ((60 / this.bpm) / 2) * 1000);
        this.inputhandler.ChangeDelay(this.bpm);
    }
}


class Mixer {
    constructor(game) {
        this.game = game;
        this.lastmoved = 0;
        this.tick = 0;
        this.visible = true;
        this.mixuptext = false;
        this.mixuptime = false;
        this.scale = 1;
        this.behavior = this.behavior.bind(this);
        this.swoop = 0;
        this.variantchance = 6;
        this.eyemovement = 0;
        this.pickedvariant = "none";
        this.variants = {
            shadowme: {
                name: "Shadow Clone",
                description: "it trails behind you!",
                sfxname: "shadow",
                playbackRate: 2
            },
            big: {
                name: "BIG",
                description: "same hitbox tho!",
                sfxname: "big"
            },
            inverted: {
                name: "Inverted",
                description: "its SDWA now!",
                sfxname: "invert",
                startpos: 2
            },
            disco: {
                name: "Sugar Rush",
                description: "dont stop moving!",
                sfxname: "yummy"
            },
            pulse: {
                name: "Phantom",
                description: "blink and you'll miss it!",
                sfxname: "ghost",
                startpos: 1,
                playbackRate: 2
            },
            silent: {
                name: "Silent",
                description: "shhhhh!",
                sfxname: "ghost",
                playbackRate: 2,
                vol: 0
            },
            healthup: {
                name: "Health Up",
                description: "well aren't you a lucky one!",
                sfxname: "yummy"
            },
            strikes: {
                name: "Side Strikes",
                description: "more stuff to dodge!",
                sfxname: "shadow",
                playbackRate: 2
            },
            glassbones: {
                name: "Glass Bones",
                description: "Good Luck...",
                sfxname: "oneshot"
            },
            doubledamage: {
                name: "Double Damage",
                description: "double the owie!",
                fontsize: 44,
                sfxname: "bruh"
            },
            doubletime: {
                name: "Double Time",
                description: "lets go a bit faster!",
                sfxname: "speedier",
                playbackRate: 2
            },
            replay: {
                name: "Replay",
                description: "i liked that lets do it again",
                sfxname: "replay",
                startpos: 2,
                playbackRate: 2
            }
        };
        this.varkeys = Object.keys(this.variants);
        document.addEventListener('tick', this.behavior);
    }

    behavior() {
        const game = this.game;
        if (game.variant == "disco") {
            this.lastmoved += 1;
            if (this.lastmoved >= 5) { game.hurt(); }
        }
        if (game.variant == "strikes") {
            this.tick += 1;
            if (this.tick >= 6) {
                game.Dangers.push(new DSweeper(Randint(9) + 1, "horizontal", 2, 1));
                this.tick = -2;
            }
        }
        if (game.variant == "pulse") {
            this.visible = false;
            this.tick += 1;
            if (this.tick >= 4) { this.visible = true; this.tick = 0; }
        }
        if (game.variant == "doubledamage") {
            if (this.eyemovement == 0) {
                if (Randint(15) == 14) this.eyemovement = 4;
            } else {
                this.tick += 1;
                if (this.tick > 4) { this.eyemovement = 0; this.tick = 0; }
                else if (this.tick < 2) this.eyemovement = 4;
                else this.eyemovement = -4;
            }
        }
        if (game.variant == "big") { this.scale = 3.5; }
    }

    resetdisco() {
        this.lastmoved = 0;
    }

    callshadow() {
        this.game.Dangers.forEach(item => {
            if (item instanceof ShadowMe) { item.behavior(); }
        });
    }

    reset() {
        const game = this.game;
        game.Dangers.forEach(item => {
            if (item instanceof ShadowMe) { game.killMe(item); }
        });
        game.silence = 1;
        this.scale = 1;
        this.lastmoved = 0;
        this.visible = true;
        this.tick = 0;
    }

    variantpicker() {
        if (Randint(this.variantchance) + 1 == this.variantchance) {
            this.pickedvariant = this.varkeys[Randint(this.varkeys.length)];
        } else {
            this.pickedvariant = "none";
        }
    }

    variantapplier() {
        const game = this.game;
        this.reset();
        game.variant = this.pickedvariant;
        if (game.variant == "shadowme") { game.Dangers.push(new ShadowMe(game.playerPos[0], game.playerPos[1])); }
        if (game.variant == "silent") { game.silence = 0; }
        if (game.variant == "healthup") { game.hpUp(); }
    }

    drawspeedup() {
        const game = this.game;
        if (game.isInterlude) {
            if (this.swoop != 30) { this.swoop += 1; }
        } else {
            if (this.swoop != 0) { this.swoop -= 1; }
        }
        if (this.swoop != 0 || game.isInterlude) {
            let x = -1000 + (Math.floor(38.33 * this.swoop + 0.15));
            game.artful.DrawInterlude((this.mixuptext ? "Mix Up!" : "Speed Up!"), x);
            if (this.mixuptime) { this.drawmixup(); }
        }
    }

    drawmixup() {
        let x = -1000 + (Math.floor(38.33 * this.swoop + 0.15));
        this.game.artful.DrawMixedUp(this.variants[this.pickedvariant], x);
    }

    playmixupaudio() {
        const game = this.game;
        let variantData = this.variants[this.pickedvariant];
        let input = variantData.sfxname;
        let startpos = variantData.startpos ?? 0;
        let PlaybackRate = variantData.playbackRate ?? 1;
        let vol = variantData.vol ?? 1;
        let sound = new Audio(`./sound/sfx/${input}.mp3`);

        sound.currentTime = startpos;
        sound.playbackRate = PlaybackRate * game.audiohandler.soundSpeed;
        sound.volume = vol - (1 - globalvol);
        sound.play();
    }
}

class ModifierHandler{
    constructor(game){
        this.game = game;
        this.bpmchange = 5;
        this.modifierTabOpen = false;
        this.modifiers = {
            difficulty: "Normal"
        }
        this.SetUpModifiers();
    }

    SetUpModifiers(){
        this.DifficultyBPM();
    }

    DifficultyBPM(){
        switch(this.modifiers.difficulty){
            case "Normal":
                this.bpmchange = 5;
                break;
            case "Easy":
                this.bpmchange = 2;
                break;
            case "Hard":
                this.bpmchange = 10;
                break;
            default:
                console.log("something broke lil bro");
                break;
        }
    }
}

//helper functions waow

function Randint(max) {
  let output = Math.floor(Math.random() * max);
  if (output == max){
    return output - 1;
  }
  else{
    return output;
  }
}

function EqCheck(a, b) {
    return a.every((val, index) => val === b[index]);}

function checkcollect(item){
    return (item instanceof DCollect || item instanceof IHeal);
}

function ease(frame, maxframes){ //returns a value from 0 to 1, multiply to whatever value you want to ease!
    let t = (frame - 1) / (maxframes - 1);
    let eased = (Math.cos(Math.PI * t) - 1) / 2;
    return eased;
}

const playermove = new Event("player-movement");
const GAME = new GameHandler();
