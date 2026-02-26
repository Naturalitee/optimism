function CreateHeart(){
    let lives = document.getElementById("lifecontainer");
    if (GAME.hp <= 5){
        const img = document.createElement('img');
        img.src = "./assets/life.png";
        img.alt = 'life';
        lives.appendChild(img);
    }
    else{
        const target = lives.children[GAME.hp - 6]
        target.style.filter = 'hue-rotate(250deg)';
    }
}

function RemoveHeart(){
    let lives = document.getElementById("lifecontainer");
    if (GAME.hp <= 5){
        lives.lastElementChild.remove();
    }
    else {
        const target = lives.children[GAME.hp-6];
        target.style.filter = 'hue-rotate(0deg)';
    }
}

function switchto(tab){
    var selectedtab = document.getElementById(tab);
    if (currenttab != "none"){
        var tabrn = document.getElementById(currenttab)
    }
     if (currenttab != "none"){tabrn.style.display = "none"};
    selectedtab.style.display = "block";
    currenttab = tab;
}

function UpNextHandler(list){
    let ImageContainer = document.querySelector("#up-next-icons");
    if (ImageContainer.childElementCount != 0) {
        ImageContainer.replaceChildren();
    }
    if (list){
        list.forEach(item => {
            let icon = document.createElement("img");
            icon.src = `./assets/icons/icon-${item}.png`
            ImageContainer.append(icon);
        })
    }
}

function initalizeAdminPanel(){
    const DROPDOWN = document.getElementById("variantpicker");
    const varkeys = Object.keys(GAME.mixer.variants);
    varkeys.forEach(key => {
        const newOption = document.createElement("option");
        newOption.textContent = key;
        newOption.id = key;
        DROPDOWN.appendChild(newOption);
    })
    if (!TESTINGMODE) document.querySelector("#adminpanel").style.display = "none";
}


//modifier section

function ModifierExit(){
    let modifierOverlay = document.querySelector("#overlay");
    modifierOverlay.style.display = "none";
    GAME.modifierhandler.modifierTabOpen = false;
    GAME.modifierhandler.SetUpModifiers();
}

function ModifierSave(){
    let difficulty = document.querySelector("#difficulty-select");
    GAME.modifierhandler.modifiers = {difficulty: difficulty.value}
    ModifierDivSetup(GAME.modifierhandler.modifiers);
    ModifierExit();
}

function ModifierDivSetup(data){
    let divchildren = document.querySelectorAll("#modifiers > p:not(#modifiertitle)")
    console.log(divchildren)
    divchildren.forEach(child => child.remove());
    const defaults = {
        difficulty: "Normal"
    }
    Object.keys(data).forEach(key => {
        if (data[key] != defaults[key]){
            switch (key){
                case "difficulty":
                    CreateModifierItem(data[key] + " Mode")
                    break;
            }
        }
    });
}

function CreateModifierItem(text){
    let modifierdiv = document.querySelector("#modifiers")
    let modifiertext = document.createElement("p");
    modifiertext.textContent = text;
    modifierdiv.append(modifiertext);
}

function DifficultyDesc(){
    let selected = document.querySelector("#difficulty-select");
    let description = document.querySelector("#difficulty-desc");
    switch(selected.value){
        case "Normal":
            description.textContent = "Decides how much faster the game gets after every round.";
            break;
        case "Easy":
            description.textContent = "Decides how much faster the game gets after every round. The speed now goes up a bit slower.";
            break;
        case "Hard":
            description.textContent = "Decides how much faster the game gets after every round. The speed now goes up twice as fast.";
            break;
        default:
            console.log("something broke lil bro", selected.value);
            break;
    }
}

//admin section
function TestSetBPM(){
    if (TESTINGMODE) {
    const INPUT = document.getElementById('BPMinput');
    GAME.bpm = Number.isNaN(Number(INPUT.value)) ? 120 : Number(INPUT.value); 
    clearInterval(GAME.Interval);
    GAME.Interval = setInterval(GAME.BPMtick, ((60/GAME.bpm) / 2)*1000);
    GAME.inputhandler.ChangeDelay(GAME.bpm);
    console.log(INPUT.value);
    }
    else {
        console.log("hey! you're gonna break my heart!");
    }
}

function TestAttack(){
    if (TESTINGMODE){
    const INPUT = document.getElementById('attackinput');
    GAME.attacker.tick = 0;
    GAME.attacker.load(Number(INPUT.value), true);
    }
    else {
        console.log("hey! you're gonna break my heart!");
    }
}

function TestVariant(method){
    if (method == "mix"){
        GAME.mixer.pickedvariant = document.getElementById(`variantpicker`).value;
        GAME.mixer.variantapplier();
    }
    else if (method == "unmix"){
        GAME.variant = `none`;
        GAME.mixer.reset();
    }
    else if (method == "card"){
        GAME.isInterlude = !GAME.isInterlude;
        GAME.mixer.mixuptime = !GAME.mixer.mixuptime;
        GAME.mixer.mixuptext = !GAME.mixer.mixuptext;
        if (GAME.isInterlude) {
            GAME.mixer.pickedvariant = document.getElementById(`variantpicker`).value;
            GAME.mixer.playmixupaudio();
        }
    }
}
