class Artful {
    constructor(game, ctx, inc) {
        this.game = game;
        this.ctx = ctx;
        this.inc = inc;
        this.maxx = game.SCREEN.clientWidth;
        this.maxy = game.SCREEN.clientHeight;
        this.playerOpac = 1;
        this.eyeOffset = [0, 0];
        this.eyeOffsetFrames = 0;
        this.textFace = 1;
        this.textAnimFrames = 0;
        this.PulseActive = false;
        this.PulseFrame = 0;
        this.MoverStorage = []; 
    }

    DrawFrame() {
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(0, 0, 0, 1)`;
        this.ctx.fillRect(GLOBAL_OFFSET, GLOBAL_OFFSET, this.maxx - GLOBAL_OFFSET * 2, this.maxy - GLOBAL_OFFSET * 2);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = this.BorderColor();
        this.ctx.strokeRect(22.5, 22.5, this.maxx - 45, this.maxy - 45);
    }

    DrawGrid(startup) {
        let x = 0;
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = `rgb(137, 137, 137)`;
        for (let i = 0; i < 8; ++i) {
            if (startup >= 2) {
                x += this.inc;
                this.ctx.beginPath();
                this.ctx.moveTo(x + GLOBAL_OFFSET, GLOBAL_OFFSET);
                this.ctx.lineTo(x + GLOBAL_OFFSET, this.maxy - GLOBAL_OFFSET);
                this.ctx.stroke();
            }
        }
        x = 0;
        for (let i = 0; i < 8; ++i) {
            if (startup >= 3) {
                x += this.inc;
                this.ctx.beginPath();
                this.ctx.moveTo(GLOBAL_OFFSET, x + GLOBAL_OFFSET);
                this.ctx.lineTo(this.maxx - GLOBAL_OFFSET, x + GLOBAL_OFFSET);
                this.ctx.stroke();
            }
        }
    }

    drawPauseOverlay(){
        const pausedata = this.game.pauseDat;
        const TITLEPULSEDURATION = 30;
        const BUTTONPULSEDURATION = 15;
        const TITLEPULSEMAX = 4; //how big the text gets\
        const BUTTONPULSEMAX = 2; //how big the text gets
        let BUTTONSIZE = 28 + (BUTTONPULSEMAX * ease(BUTTONPULSEDURATION - pausedata.pauseButtonPulseFrame, BUTTONPULSEDURATION));
        let TITLESIZE = 44 + (TITLEPULSEMAX * ease(TITLEPULSEDURATION - pausedata.pauseTitlePulseFrame, TITLEPULSEDURATION));
        const MENUHEADER = "PAUSED";
        const RESUMETEXT = "resume!";
        const QUITTEXT = ["give up...", "you sure?", "alright..."];
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${pausedata.pauseOverlayOpacity / 30})`;
        this.ctx.fillRect(GLOBAL_OFFSET, GLOBAL_OFFSET, this.maxx - GLOBAL_OFFSET * 2, this.maxy - GLOBAL_OFFSET * 2);
        this.DrawText(MENUHEADER, {size: TITLESIZE, font: "Quantico", bold: true},`rgba(255,255,255,${pausedata.pauseOverlayOpacity / 30})`, pausedata.titleBox.x, pausedata.titleBox.y, {isCentered: true, preCentered: true});
        this.DrawText(RESUMETEXT, {size: BUTTONSIZE, font: "Quantico", bold: false},`rgba(255,255,255,${pausedata.pauseOverlayOpacity / 30})`, pausedata.resumeButtonBox.x, pausedata.resumeButtonBox.y, {isCentered: true, preCentered: true});
        this.DrawText(QUITTEXT[pausedata.giveUpState], {size: BUTTONSIZE, font: "Quantico", bold: false},`rgba(255,255,255,${pausedata.pauseOverlayOpacity / 30})`, pausedata.quitButtonBox.x, pausedata.quitButtonBox.y, {isCentered: true, preCentered: true})
    }
    
    drawPauseTransition(){
        const pausedata = this.game.pauseDat;
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${pausedata.pauseOverlayOpacity / 30})`;
        this.ctx.fillRect(GLOBAL_OFFSET, GLOBAL_OFFSET, this.maxx - GLOBAL_OFFSET * 2, this.maxy - GLOBAL_OFFSET * 2);
    }

    DrawCircle(x, y, scale, color, outline) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
        this.ctx.strokeStyle = outline;
        this.ctx.stroke();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    DrawMyEyes(x, y, text, size, font, color, locationx, offsetx, locationy, offsety, weight) {
        let fweight = weight ?? "";
        this.ctx.fillStyle = color;
        this.ctx.font = `${fweight} ${size}px ${font}`;
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, x - locationx + offsetx, y - locationy + offsety);
        this.ctx.fillText(text, x + locationx + offsetx, y - locationy + offsety);
        this.ctx.textAlign = "start";
    }

    DrawMyMouth(x, y, text, size, font, color, locationx, locationy, rot, weight) {
        let fweight = weight ?? "";
        this.ctx.fillStyle = color;
        this.ctx.translate(x, y);
        if (rot) { this.ctx.rotate(rot * Math.PI / 180); }
        this.ctx.textAlign = "center";
        this.ctx.font = `${fweight} ${size}px ${font}`;
        this.ctx.fillText(text, locationx, locationy);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.textAlign = "start";
    }

    BorderColor() {
        const game = this.game;
        if (game.healed != 0) { return `rgb(0,255,0)`; }
        else if (game.hurtCooldown >= 170) { return `rgb(255,0,0)`; }
        else { return `rgb(137,137,137)`; }
    }

    DrawHazardBase(posx, posy, width, height, color) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 0;
        this.ctx.fillRect(posx, posy, width, height);
    }

    DrawCellOutline(posx, posy, width, height, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 10;
        const offset = this.ctx.lineWidth / 2;
        this.ctx.strokeRect(posx + offset, posy + offset, width - (offset * 2), height - (offset * 2));
    }

    DrawArrow(posx, posy, color, direction) {
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        switch (direction) {
            case "Up":
                this.ctx.moveTo(posx + (this.inc / 2) - 10, posy + (this.inc / 2) + 5);
                this.ctx.lineTo(posx + (this.inc / 2), posy + (this.inc / 2) - 5);
                this.ctx.lineTo(posx + (this.inc / 2) + 10, posy + (this.inc / 2) + 5);
                break;
            case "Down":
                this.ctx.moveTo(posx + (this.inc / 2) - 10, posy + (this.inc / 2) - 5);
                this.ctx.lineTo(posx + (this.inc / 2), posy + (this.inc / 2) + 5);
                this.ctx.lineTo(posx + (this.inc / 2) + 10, posy + (this.inc / 2) - 5);
                break;
            case "Left":
                this.ctx.moveTo(posx + (this.inc / 2) + 5, posy + (this.inc / 2) - 10);
                this.ctx.lineTo(posx + (this.inc / 2) - 5, posy + (this.inc / 2));
                this.ctx.lineTo(posx + (this.inc / 2) + 5, posy + (this.inc / 2) + 10);
                break;
            case "Right":
                this.ctx.moveTo(posx + (this.inc / 2) - 5, posy + (this.inc / 2) - 10);
                this.ctx.lineTo(posx + (this.inc / 2) + 5, posy + (this.inc / 2));
                this.ctx.lineTo(posx + (this.inc / 2) - 5, posy + (this.inc / 2) + 10);
                break;
            default:
                console.log("something broke lil bro");
                break;
        }
        this.ctx.stroke();
    }

    ConsiderMover(item) {
        if (this.MoverStorage.some(itm => EqCheck(itm, [item.x, item.y]))) {
            return true;
        } else {
            if (item instanceof DMover) this.MoverStorage.push([item.x, item.y]);
            return false;
        }
    }

    DrawStalkerFace(posx, posy, color) {
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < 2; i++) {
            this.ctx.arc(posx + 20 + (i * 26.67), posy + 30, 5, 0, 2 * Math.PI);
        }
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.moveTo(posx + 5, posy + 10);
        this.ctx.lineTo(posx + GLOBAL_OFFSET, posy + 20);
        this.ctx.moveTo(posx + 61.66, posy + 10);
        this.ctx.lineTo(posx + 41.66, posy + 20);
        let mouthPoints = [[15, 51.66], [33.33, 41.66], [51.66, 51.66]];
        this.ctx.moveTo(posx + mouthPoints[0][0], posy + mouthPoints[0][1]);
        for (let i = 1; i < mouthPoints.length; i++) {
            this.ctx.lineTo(posx + mouthPoints[i][0], posy + mouthPoints[i][1]);
        }
        this.ctx.stroke();
    }

    DrawSeekerFace(posx, posy, color) {
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = "rgb(255,255,255)";
        this.ctx.beginPath();
        this.ctx.moveTo(posx + this.inc / 2, posy + 15);
        this.ctx.lineTo(posx + this.inc - 5, posy + this.inc / 2);
        this.ctx.lineTo(posx + this.inc / 2, posy + this.inc - 15);
        this.ctx.lineTo(posx + 5, posy + this.inc / 2);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.beginPath();
        this.ctx.moveTo(posx + this.inc / 2, posy + this.inc - 15);
        this.ctx.lineTo(posx + this.inc - 25, posy + this.inc / 2);
        this.ctx.lineTo(posx + this.inc / 2, posy + 15);
        this.ctx.lineTo(posx + 25, posy + this.inc / 2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    DrawConfetti(x, y, rot, color) {
        const ConfettiWidth = 10;
        const ConfettiHeight = 20;
        const ConfettiX = x + ConfettiWidth / 2;
        const ConfettiY = y + ConfettiHeight / 2;
        this.ctx.fillStyle = color;
        this.ctx.translate(ConfettiX, ConfettiY);
        this.ctx.rotate(rot * Math.PI / 180);
        this.ctx.fillRect(-ConfettiWidth / 2, -ConfettiHeight / 2, ConfettiWidth, ConfettiHeight);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    DrawPop(x, y, timestamp) {
        const TOTAL_FRAMES = 24;
        const EXTEND_FRAMES = 6;
        const MOVE_FRAMES = 12;
        const SHRINK_FRAMES = 6;
        const MAX_LENGTH = 8;
        const MOVE_SPEED = 1;
        const EXTEND_END = EXTEND_FRAMES - 1;
        const MOVE_END = EXTEND_FRAMES + MOVE_FRAMES - 1;
        const FINAL_OFFSET = MOVE_FRAMES * MOVE_SPEED;
        const frame = TOTAL_FRAMES - timestamp;
        if (frame < 0 || frame >= TOTAL_FRAMES) return;
        let length = 0;
        let offset = 0;
        if (frame <= EXTEND_END) {
            length = (frame / EXTEND_END) * MAX_LENGTH;
            offset = 0;
        } else if (frame <= MOVE_END) {
            length = MAX_LENGTH;
            offset = (frame - EXTEND_FRAMES) * MOVE_SPEED;
        } else {
            const shrinkFrame = frame - (EXTEND_FRAMES + MOVE_FRAMES);
            const t = shrinkFrame / (SHRINK_FRAMES - 1);
            length = (1 - t) * MAX_LENGTH;
            offset = FINAL_OFFSET;
        }
        const dirs = [
            [1, 0], [0, 1], [-1, 0], [0, -1],
            [1, 1], [-1, 1], [-1, -1], [1, -1]
        ];
        this.ctx.beginPath();
        for (let [dx, dy] of dirs) {
            if (dx !== 0 && dy !== 0) {
                const inv = 1 / Math.sqrt(2);
                dx *= inv;
                dy *= inv;
            }
            const startX = x + dx * offset;
            const startY = y + dy * offset;
            const endX = startX + dx * length;
            const endY = startY + dy * length;
            this.ctx.strokeStyle = "rgb(255,255,255)";
            this.ctx.lineWidth = 3;
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
        }
        this.ctx.stroke();
    }

    PulseEffect() {
        if (this.PulseActive) {
            this.PulseFrame += 1;
            let progress = this.PulseFrame / 60;
            if (progress > 1) { progress = 1; }
            let ease = 1 - Math.pow(1 - progress, 3);
            this.ctx.strokeStyle = `rgba(255,255,255,${1 - ease})`;
            let x = 22.5 * (1 - ease);
            let y = 22.5 * (1 - ease);
            this.ctx.strokeRect(x, y, this.maxx - x * 2, this.maxy - y * 2);
            if (this.PulseFrame >= 60) {
                this.PulseActive = false;
                this.PulseFrame = 0;
            }
        }
    }

    DrawInterlude(mixuptext, x) {
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.strokeStyle = "rgb(255,255,255)";
        const rectX = x + 8;
        const rectY = 90;
        const rectWidth = this.inc * 5;
        const rectHeight = 200;
        this.ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        this.ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        this.DrawText(mixuptext, {size: 66, font: "Comic Sans MS", bold: true}, "rgb(255,255,255)", rectX, rectHeight, {isCentered: true, definedCenter: true, max: this.inc * 5});
    }

    DrawMixedUp(variant, x) {
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.strokeStyle = "rgb(255,255,255)";
        const rectX = x + 8;
        const rectY = 340;
        const rectWidth = this.inc * 5;
        const rectHeight = 200;
        this.ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        this.ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        this.DrawText(variant.name, {size: variant.fontsize ?? 48, font: "Comic Sans MS", bold: true}, "rgb(255,255,255)", rectX, rectY + 75, {isCentered: true, definedCenter: true, max: rectWidth});
        this.DrawText(variant.description, {size: 24, font: "Comic Sans MS", bold: true}, "rgb(255,255,255)", rectX, rectY + 150, {isCentered: true, definedCenter: true, max: rectWidth});
    }

    DrawText(text, fontdata, color, x, y, cData) {
        this.ctx.fillStyle = color;
        let centerData = cData ?? false;
        let isBolded = fontdata.bold ? "bold " : "";
        this.ctx.font = isBolded + `${fontdata.size}px ${fontdata.font}`;
        if (centerData.isCentered) {
            if (centerData.preCentered){
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(text,x,y);
                this.ctx.textAlign = "start";
                this.ctx.textBaseline = "alphabetic";
            }
            else if (centerData.definedCenter){
                let textedge = centerData.max ?? this.inc * 9;
                this.ctx.fillText(text, x + (textedge - this.ctx.measureText(text).width) / 2, y);
            }
        } else {
            this.ctx.fillText(text, x, y);
        }
    }

    DrawHitBox(x1, y1, x2, y2) { //xy1 is top left, xy2 is bottom right.
        this.ctx.strokeStyle = "#F00";
        this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1); 
    }

    DrawImage(img, x, y, IsFree, width, length) {
        if (width && length) { this.ctx.drawImage(img, x, y, width, length); }
        else if (IsFree) { this.ctx.drawImage(img, x, y); }
        else { this.ctx.drawImage(img, x + (this.inc * 9 - img.width) / 2, y + (img.height / 2)); }
    }

    fitTextToBox(text, fontFamily, maxWidth, maxHeight, boxX, boxY) {
        let low = 1;
        let high = 1000;
        let best = 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            this.ctx.font = `${mid}px ${fontFamily}`;
            const metrics = this.ctx.measureText(text);
            const width = metrics.width;
            const height =
                metrics.actualBoundingBoxAscent +
                metrics.actualBoundingBoxDescent;
            if (width <= maxWidth && height <= maxHeight) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return {
            fontSize: best,
            x: boxX + maxWidth / 2,
            y: GLOBAL_OFFSET*1.75 + boxY + maxHeight / 2 
        };
    }
}
