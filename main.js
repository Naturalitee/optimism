if (TESTINGMODE){
    Interval = setInterval(bpmtick, ((60/bpm) / 2)*1000);
}

function increasetempo(){
    artful.PulseActive = true;
    bpm += 5;
    clearInterval(Interval);
    Interval = setInterval(bpmtick, ((60/bpm) / 2)*1000);
    if (attacknum != 1){var bgm = `main${Randint(BGMCOUNT)+1}`}
    else {bgm = `main1`}
    soundspeed = bpm/BASEBPM;
    audiohandler.volumecontrol();
    audiohandler.play(bgm, "bgm");
}

function Randint(max) {
  let output = Math.floor(Math.random() * max);
  if (output == max){
    return output - 1;
  }
  else{
    return output;
  }
}


function bpmtick() {
    document.dispatchEvent(tick);
    beat += 1;
    if (startup == 4){
        start();
        startup = 5;
    }
    if (startup < 4 && beat % 2 != 0){startup += 1}
}

function DrawMe(inc){
    let posx = GLOBAL_OFFSET + (PlayerPos[0] * inc - (inc / 2));
    let posy = GLOBAL_OFFSET + (PlayerPos[1] * inc - (inc / 2));
    let color, stroke;
    stroke = `rgba(137,137,137,${playeropac})`;
    if (!mixer.visible){stroke = "rgba(0,0,0,0)"}
    if (variant == "inverted"){color =  `rgba(174, 255, 0, ${playeropac})`;} //inverted
    else if (variant == "disco"){color =  `rgba(${255 - (63.75 * mixer.lastmoved)}, ${255 - (63.75 * mixer.lastmoved)}, 0, ${playeropac})`;} //makes it fade out to show you that you need to MOVE
    else if (variant == "pulse"){
        if (mixer.visible){color =  `rgba(255, 255, 0, ${playeropac})`}
        else{color =  `rgba(255, 255, 0, 0)`}
    }
    else{color =  `rgba(255, 255, 0, ${playeropac})`;}
    artful.DrawCircle(posx,posy,mixer.scale,color,stroke);
    DrawMeFace(posx, posy);
}

function DrawMeFace(posx, posy){
    let color;
    let ox = 0;
    let oy = 0;
    if (variant == "disco"){
        color =  `rgba(${0 + (63.75 * mixer.lastmoved)}, ${0 + (63.75 * mixer.lastmoved)}, ${0 + (63.75 * mixer.lastmoved)}, 1)`;
        ox = (2 - Math.random() * 4)*mixer.scale;
        oy = (2 - Math.random() * 4)*mixer.scale;
    }
    else{
        if (looking[0] == "x"){ox = looking[1]*mixer.scale}
        else{oy = looking[1]*mixer.scale}
       color = `rgba(0, 0, 0, ${playeropac})`;
    }
    switch (true){
        case (ishurt):
            artful.DrawMyEyes(posx,posy,"x",16*mixer.scale,"Verdana",color,(7.5*mixer.scale),ox,(5*mixer.scale),oy,"bold");
            artful.DrawMyMouth(posx,posy,")",28,"Arial",color,-5,7.5,270);
            break;
        case (variant == "disco"):
            artful.DrawMyEyes(posx,posy,"o",16*mixer.scale,"Fira Sans",color,(7.5*mixer.scale),ox,(5*mixer.scale),oy);
            artful.DrawMyMouth(posx,posy,"<",20,"Verdana",color,-5,6.5,270);
            break;
        case (attacker.pattern.length == 17):
            if (attacker.clbrt == 1){
                artful.DrawMyEyes(posx,posy,"^",16*mixer.scale,"Verdana",color,(7.5*mixer.scale),ox,(1*mixer.scale),oy,"bold");
                artful.DrawMyMouth(posx,posy,"o",20,"Verdana",color,0,6.5,0);
            }
            else {
                artful.DrawMyEyes(posx,posy,"^",16*mixer.scale,"Verdana",color,(7.5*mixer.scale),ox,(1*mixer.scale),oy,"bold");
                artful.DrawMyMouth(posx,posy,"-",20,"Verdana",color,0,6.5,0);
            }
            break;
        default:
            artful.DrawMyEyes(posx,posy,".",56*mixer.scale,"Fira Sans",color,(7.5*mixer.scale),ox,(5*mixer.scale),oy);
            artful.DrawMyMouth(posx,posy,")",28*mixer.scale,"Arial",color,5*mixer.scale,7.5*mixer.scale,90);
            break;
    }
}

function DrawHazards(inc){ //draw objects that hurt
    Dangers.forEach(function(item){
        item.draw(inc);
    })
    artful.MoverStorage = [];
}

function mainloop() { //draw everything
    if (!SCREEN){
        SCREEN = document.getElementById("Canvas");
        SCREEN.width = SCREEN.clientWidth;
        SCREEN.height = SCREEN.clientHeight;
        INCREMENT = 600 / 9;
        CTX = SCREEN.getContext("2d");;
        artful = new Artful(CTX, INCREMENT);
    }
    CTX.clearRect(0, 0, SCREEN.width, SCREEN.height);
    let x = 0;
    artful.DrawFrame();
    if (screenstate == "warning"){
        artful.DrawText("WARNING",64,"Arial","rgba(255, 0, 0, 1)",GLOBAL_OFFSET,100,true);
        artful.DrawText('This "game" contains flashing lights. Do not proceed if',24,"Arial","rgba(255, 255, 255, 1)",GLOBAL_OFFSET,200,true);
        artful.DrawText('you are sensitive to flashing lights or suffer from',24,"Arial","rgba(255, 255, 255, 1)",GLOBAL_OFFSET,230,true);
        artful.DrawText('photosensitive epilepsy.',24,"Arial","rgba(255, 255, 255, 1)",GLOBAL_OFFSET,260,true);
        artful.DrawText('click anywhere to continue.',24,"Arial","rgba(255, 255, 255, 1)",GLOBAL_OFFSET,600,true);
    }
    if (screenstate == "loading"){
        artful.DrawText("Loading...",64,"Comic Sans MS","rgba(255, 255, 255, 1)",GLOBAL_OFFSET,350,true);
        artful.DrawText(`${loadedsounds}/${SOUNDCOUNT}`,36,"Comic Sans MS","rgba(255, 255, 255, 1)",GLOBAL_OFFSET,500,true);
        if (loadedsounds/SOUNDCOUNT == 1){
            screenstate = "warning";
        }
    }
    if (screenstate == "menu"){
        if (clickgrace != 0){clickgrace -= 1}
        if (transitiontime && transition != 100){
            transition += 1;
            musicfade += 1;
            audiohandler.volumecontrol();
        }
        if (transition == 100){
            gtransitionstart();
        }
        artful.DrawImage(textanim == 1 ? TITLE1 : TITLE2, 40, -230);
        artful.DrawImage(textanim == 1 ? PLAY1 : PLAY2, 40, 0);
        artful.DrawText("volume (use +/- keys to control)",24,"Comic Sans MS","rgb(255,255,255)",GLOBAL_OFFSET,550,true);
        artful.DrawText(globalvol*10,36,"Comic Sans MS","rgb(255,255,255)",GLOBAL_OFFSET,600,true)
        CTX.fillStyle = `rgba(0, 0, 0, ${transition/100})`;
        CTX.fillRect(GLOBAL_OFFSET,GLOBAL_OFFSET,INCREMENT*9,INCREMENT*9);
        textanimtick += 1;
        if (textanimtick == 30){
            textanim *= -1;
            textanimtick = 0;
        }
    }
    if (screenstate == "gameover"){
        artful.DrawImage(textanim == 1 ? GAMEOVER1 : GAMEOVER2, 20, -230);
        if (startup >= 90){artful.DrawText("Score:",48,"Comic Sans MS","rgb(255,255,255)",GLOBAL_OFFSET,300,true)}
        if (startup >= 180){artful.DrawText(attacknum-1,72,"Comic Sans MS","rgb(255,255,255)",GLOBAL_OFFSET,400,true)}
        if (startup >= 270){
            artful.DrawText("back to menu",36,"Comic Sans MS","rgb(255,255,255)",GLOBAL_OFFSET,550,true);
        }
        if (startup == 270){audiohandler.play("titletheme", "bgm")}
        if (startup % 90 == 0){audiohandler.play("reveal", "sfx")}
        if (startup != 271){startup += 1}
        textanimtick += 1;
        if (textanimtick == 30){
            textanim *= -1;
            textanimtick = 0;
        }
    }
    if (screenstate == "punishment"){artful.DrawText("RIP old punishment screen :(",36,"Comic Sans MS","rgb(255,255,255)",GLOBAL_OFFSET,350)}
    if (screenstate == "game"){
        DrawHazards(INCREMENT);
        artful.DrawGrid(startup);
        if (startup >= 4){DrawMe(INCREMENT)}
        if (ishurt){
            hurtcd -= 1;
            if (hurtcd == 0){
                ishurt = false;
                playeropac = 1;
            }
        }
        if (healed != 0){
            healed -= 1;
        }
        if (looking[1] != 0){ //for little eye movements
            timelooking -= 1;
            if (timelooking == 0){looking = [0,0]}
        }
        mixer.drawspeedup(CTX, INCREMENT)
        HitReg();
        artful.PulseEffect();  
    }
}
document.addEventListener("keydown", KeyPress)
document.addEventListener("mousedown", ClickDetec)

function ClickDetec(e){
    const canvas = document.getElementById("Canvas");
    foo = canvas.getBoundingClientRect();
    if (screenstate == "warning" && (e.clientX >= foo.x && e.clientX <= foo.x + foo.width) && (e.clientY >= foo.y && e.clientY <= foo.y + foo.height)){  
        audiohandler.audioctx.resume();
        screenstate = "menu";
        audiohandler.play("titletheme", "bgm")
    }
    let cx = (e.clientX - foo.left) * (canvas.width / foo.width);
    let cy = (e.clientY - foo.top) * (canvas.height / foo.height);
    if (clickgrace == 0 && screenstate == "menu" && (cx >= PLAYBOX.x1 && cx <= PLAYBOX.x2) && (cy >= PLAYBOX.y1 && cy <= PLAYBOX.y2)){transitiontime = true}
    if (startup == 271 && screenstate == "gameover" && (cx >= MENUBOX.x1 && cx <= MENUBOX.x2) && (cy >= MENUBOX.y1 && cy <= MENUBOX.y2)){screenstate = "menu"}
}

function KeyPress(e){ 
    if (["a", "s", "w", "d"].includes(e.key.toLowerCase()) && startup == 5){
        if (!e.repeat){
            Movement(e.key.toLowerCase());
        }
    }
    if (["-", "=", "_", "+"].includes(e.key)){
        ((e.key == "-" || e.key == "_") ? audiohandler.volumecontrol("down") : audiohandler.volumecontrol("up"));
    }
}

function Movement(key){ 
    timelooking = 15;
    mixer.resetdisco();
    if (variant == "inverted"){
        var i = -1;
        var j = 10;
    }
    else {
        var i = 1;
        var j = 0;
    }
    if (variant == "shadowme"){mixer.callshadow()}
    switch (key){
        case "a":
        if (PlayerPos[0] - i != Math.abs(0-j)){
            PlayerPos[0] -= i;
            looking = ["x", -3];
        }
        break;  
        case "s":
        if (PlayerPos[1] + i != Math.abs(10-j)){
            PlayerPos[1] += i;
            looking = ["y", 5];
        }
        break;
        case "w":
        if (PlayerPos[1] - i != Math.abs(0-j)){
            PlayerPos[1] -= i;
            looking = ["y", -3];
        }
        break;
        case "d":
        if (PlayerPos[0] + i != Math.abs(10-j)){
            PlayerPos[0] += i;
            looking = ["x", 3];
        }
        break;
    }
}

//Mixups section
class Mixer{ //its for the mixups
    constructor(){
        this.lastmoved = 0;
        this.tick = 0;
        this.visible = true;
        this.mixuptext = false;
        this.mixuptime = false;
        this.scale = 1;
        this.behavior = this.behavior.bind(this);
        this.swoop = 0;
        this.pickedvariant = "none";
        this.variants = ["shadowme", "big", "inverted", "disco", "pulse", "silent", "healthup", "strikes"]
        document.addEventListener('tick', this.behavior);
    }

    behavior(){
        if (variant == "disco"){ //you basically have to keep moving
            this.lastmoved += 1;
            if (this.lastmoved >= 5){
                hurt();
            }
        }
        if (variant == "strikes"){
            this.tick += 1;
            if (this.tick >= 6){
                Dangers.push(new DSweeper(Randint(9)+1,"horizontal",2,1));
                this.tick = -2;
            }
        }
        if (variant == "pulse"){
            this.visible = false;
            this.tick += 1;
            if (this.tick >= 4){
                this.visible = true;
                this.tick = 0;
            }
        }
        if (variant == "big"){
            this.scale = 3.5;
        }
    }

    resetdisco(){ //resets disco counter
        this.lastmoved = 0;
    }

    callshadow(){
        Dangers.forEach((item) => {
            if (item instanceof ShadowMe){item.behavior()}})
        }

    reset(){
        Dangers.forEach((item) => {
            if (item instanceof ShadowMe){killme(item)}})
        silence = 1;
        this.scale = 1;
        this.lastmoved = 0;
        this.visible = true;
        this.tick = 0;
        
    }


    variantpicker(){  
        let variantnow = (Randint(6)+1 == 6);
        if (variantnow){
            this.pickedvariant = this.variants[Randint(this.variants.length)]
        }
        else{this.pickedvariant = "none"}
    }
    
    variantapplier(){
        this.reset(); 
        variant = this.pickedvariant;
        if (variant == "shadowme"){Dangers.push(new ShadowMe(PlayerPos[0], PlayerPos[1]))}
        if (variant == "silent"){
            silence = 0;
        }
        if (variant == "healthup"){
            hpup();
        }
    }

    drawspeedup(ctx,inc){
        if (isinterlude){
            if (this.swoop != 30){this.swoop += 1}
        }
        else{
            if (this.swoop != 0){this.swoop -= 1}
        }
        let x = -1000 + (Math.floor(38.33 * this.swoop+0.15));
        ctx.fillStyle = `rgb(0,0,0)`;
        ctx.strokeStyle = `rgb(255,255,255)`;
        ctx.fillRect(x+8,90,inc*5,200);
        ctx.strokeRect(x+8,90,inc*5,200);
        ctx.fillStyle = `rgb(255,255,255)`;
        ctx.font = `bold 66px Comic Sans MS`;
        ctx.textAlign = "left";
        let text = this.mixuptext ? "Mix Up!" : "Speed Up!";
        ctx.fillText(text, 5+x+(inc*5 - ctx.measureText(text).width)/ 2, 200);
        if (this.mixuptime){this.drawmixup(ctx, inc)}
    }

    drawmixup(ctx,inc){
        let mixupnames = ["Shadow Clone", "BIG", "Inverted", "Sugar Rush", "Phantom", "Silent", "Health Up", "Side Strikes"]
        let mixupdesc = ["It trails behind you!", "Same hitbox tho!", "its SDWA now!", "Dont stop moving!", "Blink and you'll miss it!", "shhhhh!", "well aren't you a lucky one!", "More stuff to dodge!"]
        let x = -1000 + (Math.floor(38.33 * this.swoop+0.15));
        ctx.fillStyle = `rgb(0,0,0)`;
        ctx.strokeStyle = `rgb(255,255,255)`;
        ctx.fillRect(x+8,340,inc*5,200);
        ctx.strokeRect(x+8,340,inc*5,200);
        ctx.fillStyle = `rgb(255,255,255)`;
        ctx.font = `bold 48px Comic Sans MS`;
        ctx.textAlign = "left";
        let text = mixupnames[this.variants.indexOf(this.pickedvariant)];
        ctx.fillText(text, 5+x+(inc*5 - ctx.measureText(text).width)/ 2, 340+75);
        text = mixupdesc[this.variants.indexOf(this.pickedvariant)];
        ctx.font = `bold 24px Comic Sans MS`;
        ctx.fillText(text, 5+x+(inc*5 - ctx.measureText(text).width)/ 2, 340+150);
    }

    playmixupaudio(){
        let input = "";
        let startpos = 0;
        let pbr = 1;
        let vol = 1;
        switch (this.pickedvariant){
            case "shadowme":
                input = "shadow";
                pbr = 2;
                break;
            case "big":
                input = "big";
                break;
            case "inverted":
                input = "invert"
                startpos = 2;
                break;
            case "disco":
                input = "yummy";
                break;
            case "pulse":
                input = "ghost";
                startpos = 1;
                pbr = 2;
                break;
            case "silent":
                input = "ghost";
                pbr = 2;
                vol = 0;
                break;
            case "healthup":
                input = "yummy";
                break;
            case "strikes":
                input = "shadow";
                pbr = 2;
                break;
        }
        let sound = new Audio(`./sound/sfx/${input}.mp3`);
        sound.currentTime = startpos;
        sound.playbackRate = pbr * soundspeed;
        sound.volume = vol;
        sound.play();
    }
}

class AudioHandler{
    constructor(){
        this.audioctx = new AudioContext()
        this.bgms = {};
        this.sfxs = {};
        this.sfxlist = ["yummy", "invert", "shadow", "big", "ghost", "reveal", "collect", "hurt", "warp", "heartstart", "heartget"];
        this.currentbgm = null;
        this.index = -1;
        this.volume = this.audioctx.createGain();
        this.volume.gain.value = globalvol * silence;
        this.volume.connect(this.audioctx.destination);
        this.makesounds();
    }

    async makesounds(){
        await Promise.all([
            this.instbgm(),
            this.instsfx()
        ]);
    }

    async instbgm(){
        for (let i = 1; i <= BGMCOUNT; i++){ //for the game bgm
            await this.createsound(`main${i}`, `./sound/bgm/main${i}.mp3`, this.bgms);
        }
        await this.createsound("titletheme", `./sound/bgm/title_theme.mp3`, this.bgms); 
        await this.createsound("countin", `./sound/bgm/countin.mp3`, this.bgms); 
        await this.createsound("tsktsktsk", `./sound/bgm/tsktsktsk.mp3`, this.bgms);
    }

    async createsound(name, url, destination){
            let audiofile = await fetch(url);
            let arrayBuffer = await audiofile.arrayBuffer();
            let audioBuffer = await this.audioctx.decodeAudioData(arrayBuffer);
            destination[name] = audioBuffer;
            loadedsounds += 1;
    }

    async instsfx(){ 
        this.sfxlist.forEach(async (item) => await this.createsound(`${item}`, `./sound/sfx/${item}.mp3`, this.sfxs))
    }


    play(name, type){
        if (this.currentbgm && type == "bgm"){this.stopBGM()};
        const sound = this.audioctx.createBufferSource();
        sound.buffer = type == "bgm" ? this.bgms[name] : this.sfxs[name];
        if (type == "bgm"){
            sound.loop = true;
            sound.playbackRate.value = soundspeed;
            sound.preserve
        };
        sound.connect(this.volume);
        sound.start();
        if (type == "bgm"){this.currentbgm = sound};
        if (type !== "bgm") {
            sound.addEventListener("ended", () => sound.disconnect());
        }
    }

    stopBGM(){
        this.currentbgm.stop();
        this.currentbgm.disconnect();
        this.currentbgm = null;
    }

    createsfxobject(iname){
        return {
            name: iname,
            src: new Audio(`./sound/sfx/${iname}.mp3`)
        }
    }

    volumecontrol(direction){
    if (direction == "up" && globalvol != 1){
        globalvol += 0.1;
    }
    else if (direction == "down" && globalvol != 0){
        globalvol -= 0.1;
    }
    globalvol = Number(globalvol.toFixed(1));
    this.volume.gain.value = globalvol * silence * (1 - musicfade/100);
}

}

Dangers = []; //array containing all active hazards
function killme(object){
    document.removeEventListener('tick', object.behavior)
    victim = Dangers.indexOf(object)
    Dangers.splice(victim, 1)
}



function EqCheck(a, b) {
    return a.every((val, index) => val === b[index]);}

function HitReg(){
    checkhere = [];
    collecthere = [];
    Dangers.forEach(function(item){ //put everyones coords inside
        let widthfactor = item.size;
        if (item.active == true){
            switch (true){
                case item instanceof DSweeper:
                    if (item.direction == "vertical"){
                    for (let w = 0; w < widthfactor; w++){
                        for (let i = 1; i < 10; i++){
                            checkhere.push([item.pos + w, i])
                            }
                        }
                    }
                    else{
                        for (let w = 0; w < widthfactor; w++){
                            for (let i = 1; i < 10; i++){
                                checkhere.push([i, item.pos + w])
                            }
                        }   
                    }
                    break;
                case checkcollect(item):
                    collecthere.push([item.x, item.y])
                    break;
                case item instanceof DSticker:
                    if (item.size != 1){
                        for (let x = 0; x < item.size; x++){
                            for (let y = 0; y < item.size; y++){
                                checkhere.push([item.x + x, item.y + y]);
                            }
                        }
                    }
                    else{checkhere.push([item.x, item.y])}
                    break;
                default:
                    checkhere.push([item.x, item.y])
                    break;
            }
        }
    })
    if (checkhere.some(itm => EqCheck(itm, PlayerPos))){
        hurt();
    }
    if (collecthere.some(itm => EqCheck(itm, PlayerPos))){
        Dangers.forEach(function(item){
            if (item.x == PlayerPos[0] && item.y == PlayerPos[1]){
                item.safe();
            }
        })
    }
}

function checkcollect(item){
    return (item instanceof DCollect || item instanceof IHeal);
}
function death(){
    clearInterval(Interval);
    UpNextHandler();
    audiohandler.stopBGM();
    hurtcd = 0;
    ishurt = false;
    silence = 1;
    bpm = 120;
    soundspeed = bpm/BASEBPM;
    for (let i = Dangers.length - 1; i >= 0; i--){killme(Dangers[i])}
    startup = 0;
    screenstate = "gameover";
}

function punishpaus(){
    screenstate = "punishment";
    audiohandler.play("tsktsktsk", "bgm");
}

function hurt(){
    if (!ishurt){
    audiohandler.play("hurt", "sfx")
    ishurt = true;
    hurtcd = 180;
    playeropac = 0.6;
    RemoveHeart();
    hp -= 1;
    if (hp == 0){death()}
    }
}

function hpup(type){
    if (hp != 10){
        hp += 1;
        CreateHeart();
    }
}

function start(){
    hp = 0;
    transitiontime = false;
    transition = 0;
    bpm -= 5;
    increasetempo();
    for (i = 1; i <= starthp; i++){
        hpup();
    }
    screenstate = "game";
    attacker.load(Randint(50)+1);
    artful.PulseActive = true;
}

function gtransitionstart(){
    musicfade = 0;
    attacker.tick = 0;
    attacker.pattern = 0;
    PlayerPos = [5,5];
    beat = 0;
    tickfrequency = 1;
    startup = 0;
    starthp = 5;
    attacknum = 1;
    attacker.randplus = 0;
    attacker.randmax = 9;
    playeropac = 1;
    variant = "none";
    audiohandler.stopBGM();
    bpm = 120;
    screenstate = "game";
    audiohandler.volumecontrol();
    audiohandler.play("countin", "bgm");
    Interval = setInterval(bpmtick, ((60/bpm) / 2)*1000);
}

function rippunish(){
    death();
    punishpaus();
}



const mixer = new Mixer();
const audiohandler = new AudioHandler();
const attacker = new AttackLoader();
