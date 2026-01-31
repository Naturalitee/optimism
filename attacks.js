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
    constructor() {
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
    this.s44cycle = 2;
    this.savedcoords = [1,1];
    document.addEventListener('tick', this.interpret);
  }
    clearboard(){
      for (let i = Dangers.length - 1; i >= 0; i--){
        if (!(Dangers[i] instanceof ShadowMe || Dangers[i] instanceof DCollect)){killme(Dangers[i])}
          }
    }

    DeclareUpNext(){
      let inputlist = [];
      console.log(attacknum)
      if (this.nextattack in WARP_COORDS) inputlist.push("warp");
      if ((attacknum + 2) % 10 == 0) inputlist.push("healingheart");
      UpNextHandler(inputlist)
    }

    load(num, urgent){
      let input
      if (this.curattack != 0 && !urgent) {
      input = this.nextattack
      this.nextattack = num;
      this.curattack = input;
      }
      else{
        input = num;
        this.curattack = num;
        this.nextattack = Randint(ATTACK_COUNT)+1
      }
      this.pattern = attacks.slice(0+(input-1)*ATTACK_PATTERN_LENGTH,ATTACK_PATTERN_LENGTH*input);
      this.DeclareUpNext();
    }

    interpret(){
      if (startup == 5){
        if (this.pattern instanceof Array){
          this.tick += 1;
        }
        if (this.pattern.length == INTERLUDE_LENGTH){
          if (this.tick == INTERLUDE_LENGTH){
            this.load(Randint(ATTACK_COUNT)+1);
            this.tick = 1;
            beat = 1;
            attacknum += 1;
            isinterlude = false;
            mixer.mixuptime = false;
            artful.PulseActive = true;
          }
          else{this.clbrt *= -1}
        }
        if ((this.tick == 30 && attacknum % 4 != 0) || (this.tick == 14 && isinterlude)){ //for warp indicators!
          if (this.nextattack in WARP_COORDS){
            console.log("yah!");
            console.log(WARP_COORDS.toString(this.nextattack)[0])
            Dangers.push(new IWarp(WARP_COORDS[this.nextattack][0],WARP_COORDS[this.nextattack][1], 3));
          }
        }
        if (this.tick == 32 && !TESTINGMODE && attacknum % 4 != 0){
          this.load(Randint(ATTACK_COUNT)+1);
          if ((variant == "shadowme" || variant == "strikes") && [14,15,39].includes(this.curattack)){
            this.load(38, true);
          }
        }
        if (this.tick >= ATTACK_PATTERN_LENGTH){
          this.clearboard();
          if (!TESTINGMODE){
            this.clearboard();
            if (attacknum % 4 != 0){
              this.tick = 1;
              beat = 1;
              attacknum += 1;
              artful.PulseActive = true;
            }
            else{
              this.pattern = attacks.slice(0+(ATTACK_COUNT)*ATTACK_PATTERN_LENGTH,ATTACK_PATTERN_LENGTH*ATTACK_COUNT+INTERLUDE_LENGTH);
              isinterlude = true;
              this.tick = 1;
              artful.PulseActive = true;
            }
          }
        }
        if (attacknum % 10 == 0 && this.tick == 1 && !isinterlude){Dangers.push(new IHeal(Randint(9)+1,Randint(9)+1,50))}
        let box = [];
        let dat = "";
        if ((this.curattack == false || this.pattern == false) && !TESTINGMODE){
          this.pattern = attacks.slice(0,ATTACK_PATTERN_LENGTH);
          this.curattack = 1;
          console.warn("hey so it broke so heres attack 1 kthxbye")
        }
        let stir = this.pattern[this.tick].split("");
        let isnegative = false;
        stir.forEach((i) => {
          switch (i){
            case "("://start packing
              dat = "";
              box = [];
              break;
            case ")"://stop packing and send off
              box.push(dat);
              this.create(box);
              break;
            case ",":
              box.push(dat)
              dat = "";
              break;
            case "*":
              dat += ((Randint(this.randmax)+1)+this.randplus).toString()
              break;
            case "H":
              dat += (Math.floor(Math.random()*3)+1)*3-2
              break;
            case "x":
              if (isnegative){
              dat += (10 - PlayerPos[0]).toString();
              isnegative = false;
              }
              else {
              dat += (PlayerPos[0]).toString()
              }
              break;
            case "y":
              if (isnegative){
              dat += (10 - PlayerPos[1]).toString();
              isnegative = false;
              }
              else {
              dat += (PlayerPos[1]).toString()
              }
              break;
            case "^":
              if (isnegative){
                dat += (10 - this.savedcoords[0]).toString();
                isnegative = false;
              }
              else {
                dat += (this.savedcoords[0]).toString()
              }
              break;
            case "&":
              if (isnegative){
                dat += (10 - this.savedcoords[1]).toString();
                isnegative = false;
              }
              else {
                dat += (this.savedcoords[1]).toString()
              }
              break;
            case "-":
              isnegative = true;
              break;
            default:
              dat += i;
              break;
          }
        })
      }
    }

    create(box){
      switch (box[0]) {
        case "S": //Sticker (S,x,y,duration,size)
          Dangers.push(new DSticker(Number(box[1]), Number(box[2]), Number(box[3]), Number(box[4])))
          break;
        case "M": //Mover (M,x,y,direction)
          Dangers.push(new DMover(Number(box[1]), Number(box[2]), box[3]))
          break;
        case "FM": //Firework Mover (FM,x,y,direction,duration)
          Dangers.push(new DFirework(Number(box[1]), Number(box[2]), box[3], Number(box[4])));
          break;
        case "WM": //Wall of Movers (WM,x,y,wallsize,direction,v/h)
          for(let i = 0; i < Number(box[3]); i++){
            if (box[5] == "vertical"){
              Dangers.push(new DMover(Number(box[1]),Number(box[2])+i,box[4]))
            }
            else{
              Dangers.push(new DMover(Number(box[1])+i,Number(box[2]),box[4]))
            }
          }
          break;
        case "W": //Sweeper / Wiper (W,x/y,v/h,duration,size)
          Dangers.push(new DSweeper(Number(box[1]), (box[2]), Number(box[3]), Number(box[4])))
          break;
        case "C": //Collect (C,x,y,duration)
          Dangers.push(new DCollect(Number(box[1]), Number(box[2]), Number(box[3])))
          break;
        case "E": //Stalker / Enemy (E,x,y,duration)
          Dangers.push(new DStalker(Number(box[1]), Number(box[2]), Number(box[3])))
          break;
        case "EX": //Sploder / EXplosive (EX,x,y,duration)
          Dangers.push(new DSploder(Number(box[1]), Number(box[2]), Number(box[3])))
          break;
        case "ES": //Seeker / Enemy Seeker (ES,x,y,duration)
          Dangers.push(new DSeeker(Number(box[1]), Number(box[2]), Number(box[3])))
          break;
        case "T": //Targeted Area (for stickers ig), makes a bunch of stickers in a designated area (T,x,y,amount,size,duration)
          for(let i = 0; i < box[3]; i++){
            Dangers.push(new DSticker(Number(box[1]) + Randint(Number(box[4])), Number(box[2]) + Randint(Number(box[4])), Number(box[5]), 1))
          }
          break;
        case "TP": //Telport (TP,x,y)
          PlayerPos = [Number(box[1]),Number(box[2])]
          break;
        case "I": //Indicator (I,type,x,y,duration)
          let GivenType = box[1];
          switch (GivenType){
            case "warp":
              Dangers.push(new IWarp(Number(box[2]), Number(box[3]), Number(box[4])))
              break;
          }
          break;
        case "RD": //Change Random Number Max (RD,max,offset)
          this.randmax = Number(box[1]);
          if (box.length == 3){
            this.randplus = Number(box[2]);
          }
          break;
        case "FQ": //change frequency of ticks (FQ,value)
          tickfrequency = box[1];
          break;
        case "SV":
          this.savedcoords = [Number(box[1]), Number(box[2])];
          break;
        case "WME": //wall mover exception (makes holes) (WME,holesize,v/h,direction,coord)
          let hole = Randint((this.randmax)-(Number(box[1])-1))+1+this.randplus;
          let holes = [];
          for (let i = 0; i < Number(box[1]); i++){holes.push(hole+i)}
          for(let i = this.randplus+1; i <= this.randmax+this.randplus; i++){
            if (!holes.includes(i)){
              if (box[2] == "vertical"){
                Dangers.push(new DMover(Number(box[4]),i,box[3]))
              }
              else{
                Dangers.push(new DMover(i,Number(box[4]),box[3]))
              }
            }
          }
          break;
        case "S28": //makes worms for attack 28
          switch (box[1]){
            case "A":
              Dangers.push(new DMover(9,this.twoeightA,"Left"));
              Dangers.push(new DMover(9,this.twoeightB,"Left"));
              break;
            case "B":
              Dangers.push(new DMover(1,this.twoeightA,"Right"));
              Dangers.push(new DMover(1,this.twoeightB,"Right"));
              break;
            case "C":
              this.twoeightA = Randint(9)+1;
              this.twoeightB = Randint(9)+1;
              break;
          }
          break;
          case "S37": //another special case woah
          for (let i = Dangers.length - 1; i >= 0; i--){
            if (Dangers[i] instanceof DMover) {killme(Dangers[i])}
          }
          let choice = Randint(4) + 1;
          if (choice != 1){
            Dangers.push(new DMover(7,4,"Left"));
            Dangers.push(new DMover(7,5,"Left"));
            Dangers.push(new DMover(7,6,"Left"));
          }
          if (choice != 2){
            Dangers.push(new DMover(3,4,"Right"));
            Dangers.push(new DMover(3,5,"Right"));
            Dangers.push(new DMover(3,6,"Right"));
          }
          if (choice != 3){
            Dangers.push(new DMover(4,7,"Up"));
            Dangers.push(new DMover(5,7,"Up"));
            Dangers.push(new DMover(6,7,"Up"));
          }
          if (choice != 4){
            Dangers.push(new DMover(4,3,"Down"));
            Dangers.push(new DMover(5,3,"Down"));
            Dangers.push(new DMover(6,3,"Down"));
          }
          break;
          case "S38": //god hes getting so lazy
            switch (box[1]){
            case "A": //what we memorizing?
              this.memory = Randint(3)+1;
              break;
            case "B": //alright now draw it
              Dangers.push(new DSticker(3+this.memory,3,6,1))
              break;
            case "C": //did you choose right?
              if (this.memory != 1){Dangers.push(new DSweeper(1,"vertical",6,2))}
              if (this.memory != 2){Dangers.push(new DSweeper(4,"vertical",6,3))}
              if (this.memory != 3){Dangers.push(new DSweeper(8,"vertical",6,2))}
              break;
          }
          break;
          case "S44":
            let roll = Randint(4)+1;
            let firstmover = Dangers.find(i => i instanceof DMover);
            if ([1, 5].includes(firstmover.y) || [1, 5].includes(firstmover.x)){
              let switchdirection = "";
              switch (firstmover.direction){
                case "Up":
                  switchdirection = "Down";
                  break;
                case "Down":
                  switchdirection = "Up";
                  break;
                case "Right":
                  switchdirection = "Left";
                  break;
                case "Left":
                  switchdirection = "Right";
                  break;
              }
              Dangers.forEach((item) => {
              if (item instanceof DMover){
                item.direction = switchdirection;
              }})
            }
            else if (roll < this.s44cycle){ //change direction
              this.s44cycle = 0;
              let redirect = ["Up", "Down", "Left", "Right"][Randint(4)];
              Dangers.forEach((item) => {
              if (item instanceof DMover){
                item.direction = redirect;
              }})
            }
            else{
              this.s44cycle += 1;
            }
            break;
          case "IN":
            switch (box[1]){
              case "A":
                mixer.variantapplier();
                increasetempo();
                break;
              case "B":
                mixer.variantpicker();
                mixer.mixuptext = (mixer.pickedvariant != "none")
                break;
              case "C":
                mixer.mixuptime = mixer.pickedvariant != "none";
                if (mixer.mixuptime){mixer.playmixupaudio()};
                break;
            }
            break;
        default:
          break;
      }
    }

    newchoice(){
      this.nextdirection = Randint(4);
    }
}

