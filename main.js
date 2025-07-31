
function increasetempo(){
    pulp.active = true;
    bpm += 5;
    clearInterval(Interval);
    Interval = setInterval(bpmtick, ((60/bpm) / 2)*1000);
    if (attacknum != 1){var bgm = `main${Randint(6)+1}`}
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

function DrawBackground(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(0,0,0,1)`;
    ctx.fillRect(GLOBAL_OFFSET,GLOBAL_OFFSET,x-GLOBAL_OFFSET*2,y-GLOBAL_OFFSET*2);
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

function DrawMe(ctx, inc){
    let posx = GLOBAL_OFFSET + (PlayerPos[0] * inc - (inc / 2));
    let posy = GLOBAL_OFFSET + (PlayerPos[1] * inc - (inc / 2));
    ctx.beginPath();
    ctx.arc(posx, posy, 20*mixer.scale, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(137,137,137,${playeropac})`;
    if (mixer.visible == false){ctx.strokeStyle = "rgba(0,0,0,0)"}
    ctx.stroke();
    if (variant == "inverted"){ctx.fillStyle =  `rgba(174, 255, 0, ${playeropac})`;} //inverted
    else if (variant == "disco"){ctx.fillStyle =  `rgba(${255 - (63.75 * mixer.lastmoved)}, ${255 - (63.75 * mixer.lastmoved)}, 0, ${playeropac})`;} //makes it fade out to show you that you need to MOVE
    else if (variant == "pulse"){
        if (mixer.visible){ctx.fillStyle =  `rgba(255, 255, 0, ${playeropac})`}
        else{ctx.fillStyle =  `rgba(255, 255, 0, 0)`}
    }
    else{ctx.fillStyle =  `rgba(255, 255, 0, ${playeropac})`;}
    ctx.fill();
    DrawMeFace(posx, posy, ctx);
}

function DrawMeFace(posx, posy, ctx){
    let ox = 0;
    let oy = 0;
    if (variant == "disco"){
        ctx.fillStyle =  `rgba(${0 + (63.75 * mixer.lastmoved)}, ${0 + (63.75 * mixer.lastmoved)}, ${0 + (63.75 * mixer.lastmoved)}, 1)`;
        ox = (2 - Math.random() * 4)*mixer.scale;
        oy = (2 - Math.random() * 4)*mixer.scale;
    }
    else{
        if (looking[0] == "x"){ox = looking[1]*mixer.scale}
        else{oy = looking[1]*mixer.scale}
        ctx.fillStyle = `rgba(0, 0, 0, ${playeropac})`;
    }
    switch (true){
        case (ishurt):
            ctx.font = `bold ${16*mixer.scale}px Verdana`;
            ctx.textAlign = "center";
            ctx.fillText("x",posx - (7.5*mixer.scale) + ox, posy - (5*mixer.scale) + oy);
            ctx.fillText("x",posx + (7.5*mixer.scale) + ox, posy - (5*mixer.scale) + oy);
            ctx.translate(posx, posy);
            ctx.rotate(Math.PI/2 + Math.PI);
            ctx.font = `28px Arial`;
            ctx.fillText(")",-5, 7.5);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            break;
        case (variant == "disco"):
            ctx.font = `${16*mixer.scale}px Fira Sans`;
            ctx.textAlign = "center";
            ctx.fillText("o",posx - (7.5*mixer.scale) + ox, posy - (5*mixer.scale) + oy);
            ctx.fillText("o",posx + (7.5*mixer.scale) + ox, posy - (5*mixer.scale) + oy);
            ctx.translate(posx, posy)
            ctx.rotate(Math.PI/2 + Math.PI);
            ctx.font = `${20*mixer.scale}px Verdana`;
            ctx.fillText("<",-5, 6.5);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            break;
        case (attacker.pattern.length == 17):
            if (attacker.clbrt == 1){
                ctx.font = `bold ${16*mixer.scale}px Verdana `;
                ctx.textAlign = "center";
                ctx.fillText("^",posx - (7.5*mixer.scale) + ox, posy - (1*mixer.scale) + oy);
                ctx.fillText("^",posx + (7.5*mixer.scale) + ox, posy - (1*mixer.scale) + oy);
                ctx.translate(posx, posy)
                ctx.font = `${20*mixer.scale}px Verdana`;
                ctx.fillText("o",0, 6.5);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            else {
                ctx.font = `bold ${16*mixer.scale}px Verdana `;
                ctx.textAlign = "center";
                ctx.fillText("^",posx - (7.5*mixer.scale) + ox, posy - (2*mixer.scale) + oy);
                ctx.fillText("^",posx + (7.5*mixer.scale) + ox, posy - (2*mixer.scale) + oy);
                ctx.translate(posx, posy)
                ctx.font = `${20*mixer.scale}px Verdana`;
                ctx.fillText("-",0, 6.5);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            break;
        default:
            ctx.font = `${56*mixer.scale}px Fira Sans`;
            ctx.textAlign = "center";
            ctx.fillText(".",posx - (7.5*mixer.scale) + ox, posy - (5*mixer.scale) + oy);
            ctx.fillText(".",posx + (7.5*mixer.scale) + ox, posy - (5*mixer.scale) + oy);
            ctx.translate(posx, posy)
            ctx.rotate(Math.PI/2);
            ctx.font = `${28*mixer.scale}px Arial`;
            ctx.fillText(")",5*mixer.scale, 7.5*mixer.scale);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            break;
    }
}

function DrawHazards(ctx, inc){ //draw objects that hurt
    Dangers.forEach(function(item){
        item.draw(ctx, inc);
    })
}

function mainloop() { //draw everything
    const screen = document.getElementById("Canvas");
    let ctx = screen.getContext("2d");
    screen.width = screen.clientWidth;
    screen.height = screen.clientHeight;
    let maxx = screen.clientWidth;
    let maxy = screen.clientHeight;
    const increment = 600 / 9;
    let x = 0;
    DrawBackground(ctx, maxx, maxy);
    ctx.lineWidth = 5;
    ctx.strokeStyle = hurtcd >= 170 ? `rgba(255, 0, 0, 1)` : `rgb(137, 137, 137)`;
    ctx.strokeRect(22.5,22.5,maxx-45,maxy-45);
    if (screenstate == "warning"){
        ctx.fillStyle = "rgba(255, 0, 0, 1)";
        ctx.font = "64px Arial"
        let text = "WARNING";
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2, 100);
        ctx.font = "24px Arial"
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        text = 'This "game" contains flashing lights. Do not proceed if';
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2, 200);
        text = 'you are sensitive to flashing lights or suffer from';
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2, 230);
        text = 'photosensitive epilepsy.';
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2, 260);
        text = 'click anywhere to continue.';
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2, 600);
    }
    if (screenstate == "loading"){
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.font = "64px Comic Sans MS"
        let text = "Loading...";
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2, 350);
        ctx.font = "36px Comic Sans MS"
        text = `${loadedsounds}/${SOUNDCOUNT}`;
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2, 500);
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
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        let title = textanim == 1 ? TITLE1 : TITLE2;
        ctx.drawImage(title, 40+(increment*9 - title.width)/ 2, -230+(title.height/2));
        let playbut = textanim == 1 ? PLAY1 : PLAY2;
        ctx.drawImage(playbut, 40+(increment*9 - playbut.width)/ 2, 0+(playbut.height/2));
        ctx.font = "24px Comic Sans MS";
        text = "volume (use +/- keys to control)";
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2,550);
        ctx.font = "36px Comic Sans MS";
        text = globalvol * 10;
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2,600);
        ctx.fillStyle = `rgba(0, 0, 0, ${transition/100})`;
        ctx.fillRect(25,25,increment*9,increment*9);
        textanimtick += 1;
        if (textanimtick == 30){
            textanim *= -1;
            textanimtick = 0;
        }
    }
    if (screenstate == "gameover"){
        let title = textanim == 1 ? GAMEOVER1 : GAMEOVER2;
        ctx.drawImage(title, 20+(increment*9 - title.width)/ 2, -230+(title.height/2));
        if (startup >= 90){
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font = "48px Comic Sans MS";
            text = "Score:";
            ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2,300);
        }
        if (startup >= 180){
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font = "72px Comic Sans MS";
            text = attacknum - 1;
            ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2,400);
        }
        if (startup >= 270){
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font = "36px Comic Sans MS";
            text = "back to menu";
            ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2,550);
        }
        if (startup % 90 == 0){audiohandler.play("reveal", "sfx")}
        if (startup == 270){audiohandler.play("titletheme", "bgm")}
        if (startup != 271){startup += 1}
        textanimtick += 1;
        if (textanimtick == 30){
            textanim *= -1;
            textanimtick = 0;
        }
    }
    if (screenstate == "punishment"){
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.font = "36px Comic Sans MS";
        text = "RIP old punishment screen :(";
        ctx.fillText(text, 25+(increment*9 - ctx.measureText(text).width)/ 2,350);
    }
    if (screenstate == "game"){
        DrawHazards(ctx, increment);
        ctx.lineWidth = 5;
        ctx.strokeStyle = `rgb(137, 137, 137)`;
        for (let i = 0; i < 8; ++i) {
            if (startup >= 2){
                x += increment;
                ctx.beginPath();
                ctx.moveTo(x+GLOBAL_OFFSET, GLOBAL_OFFSET);
                ctx.lineTo(x+GLOBAL_OFFSET, maxy-GLOBAL_OFFSET);
                ctx.stroke();
            }
        }  
        x = 0;
        for (let i = 0; i < 8; ++i) {
            if (startup >= 3){
                x += increment;
                ctx.beginPath();
                ctx.moveTo(GLOBAL_OFFSET, x+GLOBAL_OFFSET);
                ctx.lineTo(maxx-GLOBAL_OFFSET, x+GLOBAL_OFFSET);
                ctx.stroke();
            }
        }
        if (startup >= 4){DrawMe(ctx, increment)}
        if (ishurt){
            hurtcd -= 1;
            if (hurtcd == 0){
                ishurt = false;
                playeropac = 1;
            }
        }
        if (looking[1] != 0){ //for little eye movements
            timelooking -= 1;
            if (timelooking == 0){looking = [0,0]}
        }
        mixer.drawspeedup(ctx, increment)
        HitReg();
        pulp.pulse(ctx, maxx, maxy);  
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

class Pulse{ //cool effect
    constructor(){
        this.animf = 0;
        this.active = false;
    }

    pulse(ctx, maxx, maxy){
    if (this.active) {
    this.animf += 1;
    let progress = this.animf / 60; 
    if (progress > 1) progress = 1;
    let ease = 1 - Math.pow(1 - progress, 3);
    ctx.strokeStyle = `rgba(255,255,255,${1 - ease})`;
    let x = 22.5 * (1 - ease);
    let y = 22.5 * (1 - ease);
    ctx.strokeRect(x, y, maxx - x * 2, maxy - y * 2);
    if (this.animf >= 60) {
        this.active = false;
        this.animf = 0;
    }
}
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
        let life = document.getElementById("lifecontainer")
        let hp = life.children.length;
        if (hp < 6){
            const img = document.createElement('img');
            img.src = "./assets/life.png";
            img.alt = 'life';
            lives.appendChild(img);
        }
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
        this.sfxlist = ["yummy", "invert", "shadow", "big", "ghost", "reveal", "collect", "hurt"];
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
                case item instanceof DCollect:
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
            if (item.x == PlayerPos[0] && item.y == PlayerPos[1] && item instanceof DCollect){
                item.safe();
            }
        })
    }
}
function death(){
    clearInterval(Interval);
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
    let life = document.getElementById("lifecontainer");
    life.lastElementChild.remove();
    let lives = document.getElementById("lifecontainer");
    let hp = lives.children.length;
    if (hp == 0){death()}
    }
}

function start(){
    transitiontime = false;
    transition = 0;
    bpm -= 5;
    increasetempo();
    let lives = document.getElementById("lifecontainer");
    for (i = 1; i <= hp; i++){
        const img = document.createElement('img');
        img.src = "./assets/life.png";
        img.alt = 'life';
        lives.appendChild(img);
    }
    screenstate = "game";
    attacker.load(Randint(40)+1);
    pulp.active = true;
}

function gtransitionstart(){
    musicfade = 0;
    attacker.tick = 0;
    attacker.pattern = 0;
    PlayerPos = [5,5];
    beat = 0;
    startup = 0;
    hp = 5;
    attacknum = 1;
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

let pulp = new Pulse();
let mixer = new Mixer();
let audiohandler = new AudioHandler();

