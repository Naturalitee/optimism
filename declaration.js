//FOR TESTING 
const TESTINGMODE = true;
//FOR TESTING 

//GAMEPLAY constants//
const FPS_IN_MS = 16.67; 
const tick = new CustomEvent('tick');
const RefreshOnFrame = new CustomEvent('refreshframe');
const PausedRefreshOnFrame = new CustomEvent('refreshframe');
const GLOBAL_OFFSET = 25;
const BASEBPM = 120;

//MENU & BUTTONS//
var globalvol = 1;
var screenstate = TESTINGMODE ? "game" : "loading";
BGMCOUNT = 10;
SFXCOUNT = 18;
SPECIALBGM = 4;
SOUNDCOUNT = BGMCOUNT + SFXCOUNT + SPECIALBGM;
var currenttab = "none";
var ModifiersOpen = false;



//ATTACKS//
var tickfrequency = 1;
var silence = 1;

//ASSET LOADING & HITREG LOADING//
const TITLE1 = new Image();
TITLE1.src = "./assets/title1.png";
const TITLE2 = new Image();
TITLE2.src = "./assets/title2.png";
const PLAY1 = new Image();
PLAY1.src = "./assets/play1.png";
const PLAY2 = new Image();
PLAY2.src = "./assets/play2.png";
const MOD1 = new Image();
MOD1.src = "./assets/modifiers1.png";
const MOD2 = new Image();
MOD2.src = "./assets/modifiers2.png";
const GAMEOVER1 = new Image();
GAMEOVER1.src = "./assets/gameover1.png";
const GAMEOVER2 = new Image();
GAMEOVER2.src = "./assets/gameover2.png";
const HEART = new Image();
HEART.src = "./assets/heart.png"
const TRUCKR = new Image();
TRUCKR.src = "./assets/truckr.png"
const TRUCKL = new Image();
TRUCKL.src = "./assets/truckl.png"
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
const MODBOX = {
    x1: 209,
    y1: 434,
    x2: 454,
    y2: 480
}



