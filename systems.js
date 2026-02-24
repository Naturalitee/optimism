class InputHandler {
    constructor(game) {
        this.game = game;
        this.keyHeld = false;
        this.lastMoveTime = 0;
        this.clickGrace = 10;
        this.moveDelay = ((60 / game.bpm) / 4) * 1000;
        this.KeyPress = this.KeyPress.bind(this);
        this.KeyHeldCancel = this.KeyHeldCancel.bind(this);
        this.ClickDetec = this.ClickDetec.bind(this);
        this.MoveOnTempo = this.MoveOnTempo.bind(this);
        document.addEventListener("keydown", this.KeyPress);
        document.addEventListener("keyup", this.KeyHeldCancel);
        document.addEventListener("mousedown", this.ClickDetec);
        document.addEventListener('tick', this.MoveOnTempo);
    }

    ClickDetec(e) {
        const game = this.game;
        const pausedata = game.pauseDat;
        if (game.modifierhandler.modifierTabOpen) return;
        const canvas = document.getElementById("Canvas");
        const screen = canvas.getBoundingClientRect();
        if (game.screenState == "warning" &&
            (e.clientX >= screen.x && e.clientX <= screen.x + screen.width) &&
            (e.clientY >= screen.y && e.clientY <= screen.y + screen.height)) {
            game.audiohandler.audioctx.resume();
            game.screenState = "menu";
            game.audiohandler.play("titletheme", "bgm");
        }
        let cx = (e.clientX - screen.left) * (canvas.width / screen.width);
        let cy = (e.clientY - screen.top) * (canvas.height / screen.height);
        if (game.clickGrace == 0 && game.screenState == "menu" && boundingBoxClicked(PLAYBOX, cx, cy)){
            game.transitionTime = true;
        }
        if (game.clickGrace == 0 && game.screenState == "menu" && boundingBoxClicked(MODBOX, cx, cy)) {
            game.ModifiersOpen = true;
            document.querySelector("#overlay").style.display = "flex";
        }
        if (game.startUp == 271 && game.screenState == "gameover" && boundingBoxClicked(MENUBOX, cx, cy)) {
            game.screenState = "menu";
        }
        if (game.pauseDat.gamePaused){
            if (boundingBoxClicked(pausedata.resumeButtonBox, cx, cy)) {
                console.log("resume clicked");
            }
            else if (boundingBoxClicked(pausedata.quitButtonBox, cx, cy)) {
                console.log("quit clicked");
            }
        }
    }

    KeyPress(e) {
        const game = this.game;
        const bindings = {
            movement: ["a", "s", "w", "d"],
            volumecontrol: ["-", "=", "_", "+"],
            pause: ["escape", "esc", "p"]
        }
        const key = e.key.toLowerCase();
        if (bindings.movement.includes(key) && game.startUp == 5) {
            if (!e.repeat) {
                this.Movement(key);
                this.lastMoveTime = performance.now();
            }
            this.keyHeld = key
        }
        if (bindings.volumecontrol.includes(key)) {
            (e.key == "-" || e.key == "_")
                ? game.audiohandler.volumecontrol("down") //if minus pressed, go down
                : game.audiohandler.volumecontrol("up"); //else up
        }
        if (bindings.pause.includes(key)) {
            game.queuePauseGame();
        }
    }

    ChangeDelay(newbpm) {
        this.moveDelay = ((60 / newbpm) / 4) * 1000;
    }

    MoveOnTempo() {
        if (this.keyHeld) {
            const now = performance.now();
            if (now - this.lastMoveTime >= this.moveDelay) {
                this.Movement(this.keyHeld);
                this.lastMoveTime = now;
            }
        }
    }

    KeyHeldCancel(e) {
        if (e.key.toLowerCase() === this.keyHeld) {
            this.keyHeld = false;
        }
    }

    Movement(key) {
        const game = this.game;
        if (game.pauseDat.gamePaused) return;
        game.artful.eyeOffsetFrames = 15;
        game.mixer.resetdisco();
        let i, j;
        if (game.variant == "inverted") { i = -1; j = 10; }
        else { i = 1; j = 0; }
        document.dispatchEvent(playermove);
        switch (key) {
            case "a":
                if (game.playerPos[0] - i != Math.abs(0 - j)) {
                    game.playerPos[0] -= i;
                    game.artful.eyeOffset = ["x", -3];
                }
                break;
            case "s":
                if (game.playerPos[1] + i != Math.abs(10 - j)) {
                    game.playerPos[1] += i;
                    game.artful.eyeOffset = ["y", 5];
                }
                break;
            case "w":
                if (game.playerPos[1] - i != Math.abs(0 - j)) {
                    game.playerPos[1] -= i;
                    game.artful.eyeOffset = ["y", -3];
                }
                break;
            case "d":
                if (game.playerPos[0] + i != Math.abs(10 - j)) {
                    game.playerPos[0] += i;
                    game.artful.eyeOffset = ["x", 3];
                }
                break;
        }
    }
}

class AudioHandler {
    constructor(game) {
        this.game = game;
        this.audioctx = new AudioContext();
        this.bgms = {};
        this.sfxs = {};
        this.sfxlist = ["yummy", "invert", "shadow", "big", "ghost", "speedier", "bruh", "oneshot", "replay", "oneshotsuccess", "reveal", "collect", "hurt", "warp", "heartstart", "heartget"];
        this.currentbgm = null;
        this.silence = 1;
        this.soundSpeed = 1;
        this.volume = this.audioctx.createGain();
        this.volume.gain.value = globalvol * this.silence;
        this.volume.connect(this.audioctx.destination);
        this.loadedsounds = 0;
        this.soundspeed = this.game.bpm/BASEBPM;
        this.musicFade = 0; 
        this.makesounds();
    }

    async makesounds() {
        await Promise.all([
            this.instbgm(),
            this.instsfx()
        ]);
    }

    async instbgm() {
        for (let i = 1; i <= BGMCOUNT; i++) {
            await this.createsound(`main${i}`, `./sound/bgm/main${i}.mp3`, this.bgms);
        }
        await this.createsound("titletheme", `./sound/bgm/title_theme.mp3`, this.bgms);
        await this.createsound("countin", `./sound/bgm/countin.mp3`, this.bgms);
        await this.createsound("tsktsktsk", `./sound/bgm/tsktsktsk.mp3`, this.bgms);
        await this.createsound("pausesong", `./sound/bgm/pausesong.mp3`, this.bgms);
    }

    async createsound(name, url, destination) {
        let audiofile = await fetch(url);
        let arrayBuffer = await audiofile.arrayBuffer();
        let audioBuffer = await this.audioctx.decodeAudioData(arrayBuffer);
        destination[name] = audioBuffer;
        this.game.loadedSounds += 1;
    }

    async instsfx() {
        this.sfxlist.forEach(async (item) => await this.createsound(`${item}`, `./sound/sfx/${item}.mp3`, this.sfxs));
    }

    play(name, type) {
        const game = this.game;
        if (this.currentbgm && type == "bgm") { this.stopBGM(); }
        const sound = this.audioctx.createBufferSource();
        sound.buffer = type == "bgm" ? this.bgms[name] : this.sfxs[name];
        if (type == "bgm") {
            sound.loop = true;
            sound.playbackRate.value = this.soundSpeed;
        }
        if (name == "warp") sound.playbackRate.value = this.soundSpeed;
        sound.connect(this.volume);
        sound.start();
        if (type == "bgm") { this.currentbgm = sound; }
        if (type !== "bgm") {
            sound.addEventListener("ended", () => sound.disconnect());
        }
    }

    stopBGM() {
        this.currentbgm.stop();
        this.currentbgm.disconnect();
        this.currentbgm = null;
    }

    volumecontrol(direction) {
        const game = this.game;
        if (direction == "up" && globalvol != 1) { globalvol += 0.1; }
        else if (direction == "down" && globalvol != 0) { globalvol -= 0.1; }
        globalvol = Number(globalvol.toFixed(1));
        this.volume.gain.value = globalvol * this.silence * (1 - this.musicFade / 100);
    }
}

function boundingBoxClicked(BOX, cx, cy){
    return (cx >= BOX.x1 && cx <= BOX.x2) && (cy >= BOX.y1 && cy <= BOX.y2);
}