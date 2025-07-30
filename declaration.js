//im shoving them all in here
var PlayerPos = [5, 5];
var bpm = 120;
var hp = 5;
const tick = new CustomEvent('tick');
const GLOBAL_OFFSET = 25;
const BASEBPM = 120;
var Interval = 0;
var fps = setInterval(() => mainloop(), 16.67) //60fps
var variant = "none";
var ishurt = false;
var isinterlude = false;
var playeropac = 1;
var hurtcd = 0;
var beat = 0;
var startup = 0; //used for both intro and score anim
var attacknum = 1;
var looking = [0,0];
var timelooking = 0;
var globalvol = 1;
var screenstate = "loading";
let attacker = new bobby();
BGMCOUNT = 6;
SFXCOUNT = 8;
SOUNDCOUNT = BGMCOUNT + SFXCOUNT + 3; //3 denotes special bgm
var loadedsounds = 0;
var soundspeed = bpm/BASEBPM
var textanim = 1;
var secret = false;
var textanimtick = 0;
var transition = 0; //its a transition!
var musicfade = 0; //its a transition, for the ears!
var transitiontime = false; //is it time to transition?
var clickgrace = 10;
var silence = 1;
var punishpause = true; //punish pausing
const TITLE1 = new Image();
TITLE1.src = "./assets/title1.png";
const TITLE2 = new Image();
TITLE2.src = "./assets/title2.png";
const PLAY1 = new Image();
PLAY1.src = "./assets/play1.png";
const PLAY2 = new Image();
PLAY2.src = "./assets/play2.png";
const GAMEOVER1 = new Image();
GAMEOVER1.src = "./assets/gameover1.png";
const GAMEOVER2 = new Image();
GAMEOVER2.src = "./assets/gameover2.png";
const PLAYBOX = {
    x1: 264,
    y1: 294, 
    x2: 381, 
    y2: 371
} 
const MENUBOX = {
    x1: 216,
    y1: 520,
    x2: 433,
    y2: 548
}



