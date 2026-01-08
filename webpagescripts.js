function CreateHeart(){
    let lives = document.getElementById("lifecontainer");
    if (hp <= 5){
        const img = document.createElement('img');
        img.src = "./assets/life.png";
        img.alt = 'life';
        lives.appendChild(img);
    }
    else{
        const target = lives.children[hp - 6]
        target.style.filter = 'hue-rotate(250deg)';
    }
}

function RemoveHeart(){
    let lives = document.getElementById("lifecontainer");
    if (hp <= 5){
        lives.lastElementChild.remove();
    }
    else {
        const target = lives.children[hp-6];
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