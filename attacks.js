var attack = "poop";
var attacks = ""
const INTERLUDE_LENGTH = 17;
const ATTACK_PATTERN_LENGTH = 33;
var ATTACK_COUNT = 0;
const WARP_COORDS = {14: [5,5], 17: [5,5], 23: [5,5], 36: [1,9], 38:[5,8], 39:[5,5], 40:[2,2], 44: [5,5], 49: [5,5], 60: [2,5], 61: [5,5], 66: [5,5], 68: [5,5]}

function loadattacks(){
        fetch(
          "./patterns.txt"
        )
          .then((response) => response.text())
          .then((data) => {
            attack = data;
            attacks = attack.split("\n")
            if ((attacks.length - INTERLUDE_LENGTH) % ATTACK_PATTERN_LENGTH != 0){console.log("THERES SOMETHING WRONG BRO")}
            ATTACK_COUNT = (attacks.length - INTERLUDE_LENGTH) / ATTACK_PATTERN_LENGTH;
          });
}

loadattacks();
class AttackLoader {
    constructor(game) {
        this.game = game;
        this.tick = 0;
        this.clbrt = 1;
        this.pattern = 0;
        this.interpret = this.interpret.bind(this);
        this.twoeightA = 0;
        this.twoeightB = 0;
        this.curattack = 0;
        this.nextattack = 0;
        this.memory = 0;
        this.randmax = 9;
        this.randplus = 0;
        this.s44redirect = "Left";
        this.s44cycle = 2;
        this.attackNum = 1;
        this.savedcoords = [1, 1];
        document.addEventListener('tick', this.interpret);
    }

    clearboard() {
        const game = this.game;
        this.s44redirect = "none";
        for (let i = game.Dangers.length - 1; i >= 0; i--) {
            if (!(game.Dangers[i] instanceof ShadowMe || game.Dangers[i] instanceof DCollect)) {
                game.killMe(game.Dangers[i]);
            }
        }
    }

    DeclareUpNext() {
        let inputlist = [];
        if (this.nextattack in WARP_COORDS) inputlist.push("warp");
        if ((this.attackNum + 2) % 10 == 0) inputlist.push("healingheart");
        UpNextHandler(inputlist);
    }

    load(num, urgent) {
        let input;
        if (this.curattack != 0 && !urgent) {
            input = this.nextattack;
            this.nextattack = num;
            this.curattack = input;
        } else {
            input = num;
            this.curattack = num;
            this.nextattack = Randint(ATTACK_COUNT) + 1;
        }
        this.pattern = attacks.slice(0 + (input - 1) * ATTACK_PATTERN_LENGTH, ATTACK_PATTERN_LENGTH * input);
        this.DeclareUpNext();
    }

    interpret() {
        const game = this.game;
        if (game.startUp == 5) {
            if (this.pattern instanceof Array) { this.tick += 1; }
            if (this.pattern.length == INTERLUDE_LENGTH) {
                if (this.tick == INTERLUDE_LENGTH) {
                    this.load(Randint(ATTACK_COUNT) + 1);
                    this.tick = 1;
                    game.beat = 1;
                    this.attackNum += 1;
                    game.isInterlude = false;
                    game.mixer.mixuptime = false;
                    game.artful.PulseActive = true;
                } else { this.clbrt *= -1; }
            }
            if ((this.tick == 30 && this.attackNum % 4 != 0) || (this.tick == 14 && game.isInterlude)) {
                if (this.nextattack in WARP_COORDS) {
                    game.Dangers.push(new IWarp(WARP_COORDS[this.nextattack][0], WARP_COORDS[this.nextattack][1], 3));
                }
            }
            if (this.tick == 32 && !TESTINGMODE && this.attackNum % 4 != 0) {
                this.load(Randint(ATTACK_COUNT) + 1);
                if ((game.variant == "shadowme" || game.variant == "strikes") && [14, 15, 39].includes(this.curattack)) {
                    this.load(38, true);
                }
            }
            if (this.tick >= ATTACK_PATTERN_LENGTH) {
                if (!TESTINGMODE) {
                    this.clearboard();
                    if (this.attackNum % 4 != 0) {
                        this.tick = 1;
                        game.beat = 1;
                        this.attackNum += 1;
                        game.artful.PulseActive = true;
                    } else {
                        this.pattern = attacks.slice(0 + (ATTACK_COUNT) * ATTACK_PATTERN_LENGTH, ATTACK_PATTERN_LENGTH * ATTACK_COUNT + INTERLUDE_LENGTH);
                        game.isInterlude = true;
                        this.tick = 1;
                        game.artful.PulseActive = true;
                    }
                }
            }
            if (this.attackNum % 10 == 0 && this.tick == 1 && !game.isInterlude) {
                game.Dangers.push(new IHeal(Randint(9) + 1, Randint(9) + 1, 50));
            }
            if ((this.curattack == false || this.pattern == false) && !TESTINGMODE) {
                this.pattern = attacks.slice(0, ATTACK_PATTERN_LENGTH);
                this.curattack = 1;
                console.warn("hey so it broke so heres attack 1 kthxbye");
            }
            let box = [];
            let dat = "";
            let stir = this.pattern[this.tick].split("");
            let isnegative = false;
            stir.forEach((i) => {
                switch (i) {
                    case "(": dat = ""; box = []; break;
                    case ")": box.push(dat); this.create(box); break;
                    case ",": box.push(dat); dat = ""; break;
                    case "*": dat += ((Randint(this.randmax) + 1) + this.randplus).toString(); break;
                    case "H": dat += (Math.floor(Math.random() * 3) + 1) * 3 - 2; break;
                    case "x":
                        dat += isnegative ? (10 - game.playerPos[0]).toString() : game.playerPos[0].toString();
                        isnegative = false;
                        break;
                    case "y":
                        dat += isnegative ? (10 - game.playerPos[1]).toString() : game.playerPos[1].toString();
                        isnegative = false;
                        break;
                    case "^":
                        dat += isnegative ? (10 - this.savedcoords[0]).toString() : this.savedcoords[0].toString();
                        isnegative = false;
                        break;
                    case "&":
                        dat += isnegative ? (10 - this.savedcoords[1]).toString() : this.savedcoords[1].toString();
                        isnegative = false;
                        break;
                    case "-": isnegative = true; break;
                    default: dat += i; break;
                }
            });
        }
    }

    create(box) {
        const game = this.game;
        switch (box[0]) {
            case "S":
                game.Dangers.push(new DSticker(Number(box[1]), Number(box[2]), Number(box[3]), Number(box[4])));
                break;
            case "M":
                game.Dangers.push(new DMover(Number(box[1]), Number(box[2]), box[3]));
                break;
            case "FM":
                game.Dangers.push(new DFirework(Number(box[1]), Number(box[2]), box[3], Number(box[4])));
                break;
            case "WM":
                for (let i = 0; i < Number(box[3]); i++) {
                    if (box[5] == "vertical") { game.Dangers.push(new DMover(Number(box[1]), Number(box[2]) + i, box[4])); }
                    else { game.Dangers.push(new DMover(Number(box[1]) + i, Number(box[2]), box[4])); }
                }
                break;
            case "W":
                game.Dangers.push(new DSweeper(Number(box[1]), box[2], Number(box[3]), Number(box[4])));
                break;
            case "C":
                game.Dangers.push(new DCollect(Number(box[1]), Number(box[2]), Number(box[3])));
                break;
            case "E":
                game.Dangers.push(new DStalker(Number(box[1]), Number(box[2]), Number(box[3])));
                break;
            case "EX":
                game.Dangers.push(new DSploder(Number(box[1]), Number(box[2]), Number(box[3])));
                break;
            case "ES":
                game.Dangers.push(new DSeeker(Number(box[1]), Number(box[2]), Number(box[3])));
                break;
            case "T":
                for (let i = 0; i < box[3]; i++) {
                    game.Dangers.push(new DSticker(Number(box[1]) + Randint(Number(box[4])), Number(box[2]) + Randint(Number(box[4])), Number(box[5]), 1));
                }
                break;
            case "TP":
                game.playerPos = [Number(box[1]), Number(box[2])];
                break;
            case "I":
                console.log("make!")
                if (box[1] == "warp") {
                    game.Dangers.push(new IWarp(Number(box[2]), Number(box[3]), Number(box[4])));
                }
                if (box[1] == "tflash") {
                    game.Overlays.push(new ITextFlash("REMEMBER!", game.Overlays));
                }
                break;
            case "RD":
                this.randmax = Number(box[1]);
                if (box.length == 3) { this.randplus = Number(box[2]); }
                break;
            case "FQ":
                game.tickFrequency = box[1];
                break;
            case "SV":
                this.savedcoords = [Number(box[1]), Number(box[2])];
                break;
            case "WME": {
                let hole = Randint((this.randmax) - (Number(box[1]) - 1)) + 1 + this.randplus;
                let holes = [];
                for (let i = 0; i < Number(box[1]); i++) { holes.push(hole + i); }
                for (let i = this.randplus + 1; i <= this.randmax + this.randplus; i++) {
                    if (!holes.includes(i)) {
                        if (box[2] == "vertical") { game.Dangers.push(new DMover(Number(box[4]), i, box[3])); }
                        else { game.Dangers.push(new DMover(i, Number(box[4]), box[3])); }
                    }
                }
                break;
            }
            case "S28":
                switch (box[1]) {
                    case "A":
                        game.Dangers.push(new DMover(9, this.twoeightA, "Left"));
                        game.Dangers.push(new DMover(9, this.twoeightB, "Left"));
                        break;
                    case "B":
                        game.Dangers.push(new DMover(1, this.twoeightA, "Right"));
                        game.Dangers.push(new DMover(1, this.twoeightB, "Right"));
                        break;
                    case "C":
                        this.twoeightA = Randint(9) + 1;
                        this.twoeightB = Randint(9) + 1;
                        break;
                }
                break;
            case "S37": {
                for (let i = game.Dangers.length - 1; i >= 0; i--) {
                    if (game.Dangers[i] instanceof DMover) { game.killMe(game.Dangers[i]); }
                }
                let choice = Randint(4) + 1;
                if (choice != 1) { game.Dangers.push(new DMover(7, 4, "Left")); game.Dangers.push(new DMover(7, 5, "Left")); game.Dangers.push(new DMover(7, 6, "Left")); }
                if (choice != 2) { game.Dangers.push(new DMover(3, 4, "Right")); game.Dangers.push(new DMover(3, 5, "Right")); game.Dangers.push(new DMover(3, 6, "Right")); }
                if (choice != 3) { game.Dangers.push(new DMover(4, 7, "Up")); game.Dangers.push(new DMover(5, 7, "Up")); game.Dangers.push(new DMover(6, 7, "Up")); }
                if (choice != 4) { game.Dangers.push(new DMover(4, 3, "Down")); game.Dangers.push(new DMover(5, 3, "Down")); game.Dangers.push(new DMover(6, 3, "Down")); }
                break;
            }
            case "S38":
                switch (box[1]) {
                    case "A": this.memory = Randint(3) + 1; break;
                    case "B": game.Dangers.push(new DSticker(3 + this.memory, 3, 6, 1)); break;
                    case "C":
                        if (this.memory != 1) { game.Dangers.push(new DSweeper(1, "vertical", 6, 2)); }
                        if (this.memory != 2) { game.Dangers.push(new DSweeper(4, "vertical", 6, 3)); }
                        if (this.memory != 3) { game.Dangers.push(new DSweeper(8, "vertical", 6, 2)); }
                        break;
                }
                break;
            case "S44": {
                let firstmover = game.Dangers.find(i => i instanceof DMover);
                if ([1, 5].includes(firstmover.y) || [1, 5].includes(firstmover.x)) {
                    const opposites = { Up: "Down", Down: "Up", Right: "Left", Left: "Right" };
                    let switchdirection = opposites[firstmover.direction];
                    game.Dangers.forEach(item => { 
                      if (item instanceof DMover) { 
                        item.direction = switchdirection; 
                      } 
                    });
                } 
                else if (Randint(4) + 1 < this.s44cycle) {
                    this.s44cycle = 0;
                    let redirect = this.chooseRedirect(firstmover.direction);
                    this.s44redirect = redirect;
                    game.Overlays.push(new ITextFlash(`${redirect.toUpperCase()}!`, game.Overlays))
                }
                else if (this.s44redirect != "none") {
                    game.Dangers.forEach(item => { if (item instanceof DMover) { item.direction = this.s44redirect; } });
                    this.s44redirect = "none";
                } 
                else {
                    this.s44cycle += 1;
                }
                break;
            }
            case "IN":
                switch (box[1]) {
                    case "A":
                        game.mixer.variantapplier();
                        game.increaseTempo();
                        break;
                    case "B":
                        game.mixer.variantpicker();
                        game.mixer.mixuptext = (game.mixer.pickedvariant != "none");
                        if (game.variant == "glassbones") { this.confettiexplosion(); }
                        break;
                    case "C":
                        game.mixer.mixuptime = game.mixer.pickedvariant != "none";
                        if (game.mixer.mixuptime) { game.mixer.playmixupaudio(); }
                        break;
                }
                break;
            default:
                break;
        }
    }

    chooseRedirect(dir){
        let redirect = ["Up", "Down", "Left", "Right"][Randint(4)];
        if (redirect != dir) {
            return redirect;
        }
        else return this.chooseRedirect(dir);
    }

    confettiexplosion() {
        const game = this.game;
        game.audiohandler.play("oneshotsuccess", "sfx");
        game.Dangers.push(new IHeal(5, 9, 16, { unmoving: true }));
        for (let i = 0; i <= 100; i++) { game.Dangers.push(new IConfetti()); }
    }

    newchoice() {
        this.nextdirection = Randint(4);
    }
}

