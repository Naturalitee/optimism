class InputHandler {
    constructor(){
        this.keyHeld = false;
        this.lastMoveTime = 0;
        this.moveDelay = ((60/bpm) / 4)*1000; 
        this.KeyPress = this.KeyPress.bind(this);
        this.KeyHeldCancel = this.KeyHeldCancel.bind(this);
        this.ClickDetec = this.ClickDetec.bind(this);
        this.MoveOnTempo = this.MoveOnTempo.bind(this);
        document.addEventListener("keydown", this.KeyPress);
        document.addEventListener("keyup", this.KeyHeldCancel);
        document.addEventListener("mousedown", this.ClickDetec);
        document.addEventListener('tick', this.MoveOnTempo);
    }
    
    ClickDetec(e){
        const canvas = document.getElementById("Canvas");
        const screen = canvas.getBoundingClientRect();
        if (screenstate == "warning" && (e.clientX >= screen.x && e.clientX <= screen.x + screen.width) && (e.clientY >= screen.y && e.clientY <= screen.y + screen.height)){
            audiohandler.audioctx.resume();
            screenstate = "menu";
            audiohandler.play("titletheme", "bgm")
        }
        let cx = (e.clientX - screen.left) * (canvas.width / screen.width);
        let cy = (e.clientY - screen.top) * (canvas.height / screen.height);
        if (clickgrace == 0 && screenstate == "menu" && (cx >= PLAYBOX.x1 && cx <= PLAYBOX.x2) && (cy >= PLAYBOX.y1 && cy <= PLAYBOX.y2)){
            transitiontime = true
        }
        if (startup == 271 && screenstate == "gameover" && (cx >= MENUBOX.x1 && cx <= MENUBOX.x2) && (cy >= MENUBOX.y1 && cy <= MENUBOX.y2)){
            screenstate = "menu"
        }
    }
    
    KeyPress(e){
        if (["a", "s", "w", "d"].includes(e.key.toLowerCase()) && startup == 5){
            if (!e.repeat){ // First press - instant response
                this.Movement(e.key.toLowerCase());
                this.lastMoveTime = performance.now();
            }
            this.keyHeld = e.key.toLowerCase();
        }
        if (["-", "=", "_", "+"].includes(e.key)){
            ((e.key == "-" || e.key == "_") ? audiohandler.volumecontrol("down") : audiohandler.volumecontrol("up"));
        }
    }

    ChangeDelay(newbpm){
        this.moveDelay = ((60/newbpm) / 4)*1000;
    }
    
    MoveOnTempo(){
        if (this.keyHeld){
            const now = performance.now();
            if (now - this.lastMoveTime >= this.moveDelay){
                this.Movement(this.keyHeld);
                this.lastMoveTime = now;
            }
        }
    }
    
    KeyHeldCancel(e){
        if (e.key.toLowerCase() === this.keyHeld){
            this.keyHeld = false;
        }
    }
    
    Movement(key){
        timelooking = 15;
        mixer.resetdisco();
        if (variant == "inverted"){
            var i = -1;
            var j = 10;
        } else {
            var i = 1;
            var j = 0;
        }
        document.dispatchEvent(playermove);
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
}