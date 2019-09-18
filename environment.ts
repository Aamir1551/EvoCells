import {Cell} from "./cell"
import {getRandomPositionOnCanvas} from "./utils" 

var width = 1800;
var height = 700;


class Environment {
    
    public cells : Array<Cell> = [];
    public petriDish : Array<[string, number, number, number, number, number]> = [];

    constructor(public numCells:number, public canvas:HTMLCanvasElement) {
        for(let i:number = 0; i<numCells; i++) {
            this.cells.push(new Cell([Math.random(), Math.random() , Math.random(), Math.random()], ["#000000", "#FF0000", "#FFFF00", "#d54dff"]));
        }
        this.addFoodToPlace(100);
    }
    
    public addFoodToPlace(foodCount:number):void {
        for(let i=0; i<foodCount; i++) {
            let color:string = ["#000000", "#FF0000", "FFFF00"][Math.round(Math.random() * 2)];
            let p = getRandomPositionOnCanvas();
            this.petriDish.push([color, p[0], p[1], Math.random(), Math.random(), Math.random() * 3 +1]);
        }
    }
    
    public updatePetri() : void {
        for(let i=0; i<this.cells.length; i++) {
            for(let j=0; j<this.petriDish.length; j++) {
                if(Math.sqrt(Math.pow(this.cells[i].position[0] - this.petriDish[j][1],2) + Math.pow(this.cells[i].position[1] - this.petriDish[j][2],2)) < this.cells[i].mass + 4) {
                    this.cells[i].foodCollected++;
                    this.petriDish.splice(j, 1)
                }
            }
        }
    }
    
    public detectCollisions():Array<[Cell, Cell]> {
        let crashes:Array<[Cell, Cell]> = [];
        for(let i:number=0; i<this.cells.length-1; i++) {
            for(let j=i+1; j<this.cells.length; j++) {
                if(Math.sqrt(Math.pow(this.cells[i].position[0] - this.cells[j].position[0],2) + Math.pow(this.cells[i].position[1] - this.cells[j].position[1],2)) - this.cells[i].mass - this.cells[j].mass<-Math.min(this.cells[i].mass, this.cells[j].mass) * 0.4) {
                    crashes.push([this.cells[i], this.cells[j]]);
                }
            }
        }
        return crashes;
    }
    
    public iterate():void {
        this.canvas.getContext("2d").fillStyle = "#d2d6d6"
        this.canvas.getContext("2d").fillRect(0, 0, this.canvas.width, this.canvas.height);
        let cellCollisions:Array<[Cell, Cell]> = this.detectCollisions();
        this.updatePetri();
        for(let i=0; i<this.petriDish.length; i++) {
            this.petriDish[i][1] += this.petriDish[i][3];
            this.petriDish[i][2] += this.petriDish[i][4];
            if(this.petriDish[i][1] > 1800) {
                this.petriDish[i][3] = -1;
            } else if(this.petriDish[i][1] < 0) {
                this.petriDish[i][3] = 1;
            } else {
                this.petriDish[i][3] *= 1 + (Math.random() * 0.005);
            }
            if(this.petriDish[i][2] > 700) {
                this.petriDish[i][4] = -1;
            } else if(this.petriDish[i][2] < 0) {
                this.petriDish[i][4] = 1;
            } else {
                this.petriDish[i][4] *= 1 + (Math.random() * 0.005);
            }
            let ctx = this.canvas.getContext("2d");
            ctx.beginPath();
            ctx.arc(this.petriDish[i][1], this.petriDish[i][2], this.petriDish[i][5], 0, 2*Math.PI);
            ctx.fillStyle =  this.petriDish[i][0];
            ctx.closePath();
            ctx.fill();
        }

        for(let i=0; i<this.cells.length; i++) {
           this.cells[i].move();
           if(this.cells[i].foodCollected > 300) {
               let [a, b] = this.cells[i].cellDivide();
               this.cells.push(a);
               this.cells.push(b);
               this.cells.splice(i, 1);
            }
            if(this.cells[i].isAlive) {
                this.cells[i].draw(this.canvas);
            } else {
                this.cells.splice(i, 1);
            }
        }
        for(let i=0; i<cellCollisions.length; i++) {
            Cell.fight(cellCollisions[i][0], cellCollisions[i][1]);
        }
        setTimeout(this.iterate.bind(this), 1000/60);
    }
}

function start() {
    let canvas = document.getElementsByTagName("canvas")[0];
    let petri:Environment = new Environment(10, canvas);
    petri.iterate();
}

start();