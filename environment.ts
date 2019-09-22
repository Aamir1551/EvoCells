import {Cell} from './cell'
import {setUp, Point} from './utils'
import {Sugar} from './sugar'

var canvas:HTMLCanvasElement=document.getElementsByTagName("canvas")[0];
var ctx=canvas.getContext("2d");
export class Environment {
  
  public food:Array<Sugar> = [];
  public cells:Array<Cell> = [];
  public timeCounter = 0;
  
  constructor(food:Array<Sugar> = [], cells:Array<Cell> = [], public ctx:CanvasRenderingContext2D) {
    [this.food, this.cells] = [food, cells]
  }

  public initialize() {
    this.cells.forEach(x=>x.updatePoints(this.cells, this.food));
  }

  
  public drawAllObjects() {
    for(let i=0; i<this.food.length; i++) {
      this.food[i].draw(ctx);
    }
    
    this.cells.sort((b, a)=> b.targetSize - a.targetSize)
    for(let i=0; i<this.cells.length; i++) {
      this.cells[i].draw(ctx);
    }
  }
  
  
  public detectAllCellCollisions() : void{
    this.cells.forEach(x=>x.vertices.forEach(y=>y.colliding = false))
    this.iterateConsume();

    
    
    for(let i=0; i<this.cells.length; i++) {
      let currentCell : Cell = this.cells[i];
      let distanceThreshold = currentCell.distanceThreshold;
      for(let j=0; j<currentCell.vertices.length; j++) {
        let currentVertex = currentCell.vertices[j];
        if(currentVertex.colliding == true){continue}
        if(!currentVertex.position.isInside()) {currentVertex.colliding = true; continue}

        for(let k = 0; k<this.food.length; k++) {
          let dist = currentVertex.position.distanceSquared(this.food[k].position);
          if(dist <= distanceThreshold) {
            this.food.splice(k, 1)
            currentCell.eatFood(10)
          }
        }
         
        for(let k=i+1; k<this.cells.length; k++) {
          let otherCell : Cell= this.cells[k];
          for(let l=0; l<otherCell.vertices.length; l++) {
            let otherCellVertex = otherCell.vertices[l];
            let dist = otherCellVertex.position.distanceSquared(currentVertex.position);
            if(dist <= distanceThreshold){ [currentVertex.colliding, otherCellVertex.colliding] = [true, true] }
            dist = otherCell.position.distanceSquared(currentVertex.position);
          }
        }
      }
    }
  }

  public iterateConsume() {
    this.cells.sort((a,b) => (b.size - a.size)); 
    this.cells.forEach(x=>x.looseMass())
    for(let i=0; i<this.cells.length; i++) {
      if(this.cells[i].targetSize < 5) {
        this.cells.splice(i, 1);
      }
    }
    for(let i=0; i<this.cells.length -1; i++) { 
      let currentCell = this.cells[i];
      for(let j=i+1; j<this.cells.length;j++) {
        let otherCell = this.cells[j];
        let dist = currentCell.position.distanceSquared(otherCell.position) - currentCell.size - otherCell.size;
        if( -dist > otherCell.size && currentCell.size > otherCell.size * 1.2) {
          currentCell.eatFood(otherCell.size * otherCell.size * Math.PI);
          this.cells.splice(j, 1);
        }
      }
      
    }
  }
  
  public drawBackground() : void {
    let corner = new Point(setUp.center.x - setUp.width/2, setUp.center.y - setUp.height/2);
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.rect(0, 0, setUp.width, setUp.height);
    ctx.fill();
    ctx.strokeStyle = "lightgray"; 
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<Math.floor(setUp.width/setUp.square) + 1; i++) {
      let j = i * setUp.square - (corner.x  % setUp.square);
      ctx.moveTo(j, 0);
      ctx.lineTo(j, setUp.height);
    }
    for(let i=0; i<Math.floor(setUp.height/setUp.square) + 1; i++) {
      let j = i * setUp.square - (corner.y  % setUp.square);
      ctx.moveTo(0, j);
      ctx.lineTo(setUp.width, j);
    }
    ctx.stroke();
  } 
  
  public iterate() {
    setUp.center = new Point(setUp.mapwidth/2, setUp.mapheight/2);
    this.timeCounter+=0.01
    if(this.timeCounter>=1) {
      this.cells.forEach(x=>x.updatePoints(this.cells, this.food));
      this.timeCounter = 0;
    }
    this.cells.forEach(x=>x.moveXY(this.timeCounter))
    let a = 10 
    this.drawBackground();
    this.drawAllObjects();
    this.detectAllCellCollisions();
  }
}

let petri = new Environment([], [], ctx)

for(let i=0; i<30; i++) {
  petri.cells.push(new Cell(new Point(Math.random() * setUp.mapwidth, Math.random() * setUp.mapheight), Math.random() * 20 + 30, [Math.random() * 255, Math.random() * 255, Math.random() * 255], [Math.random(), Math.random(), Math.random()])); }

for(let i=0; i<500; i++) {
  petri.food.push(new Sugar(new Point(Math.round((setUp.borderRight - setUp.borderLeft) * Math.random()) + setUp.borderLeft-1, Math.round((setUp.borderBottom - setUp.borderTop)* Math.random()) + setUp.borderTop -1), [0,0,0])); 
}

function start() {
  petri.iterate();

  if(petri.timeCounter % 1 == 0) {
    let l= petri.cells.length;
    let n : Array<Cell> = [];
  for(let i=0; i<petri.cells.length; i++) {
      let currentCell = petri.cells[i];
      currentCell.updatePoints(petri.cells, petri.food);
      
    if(currentCell.size > 100) {
        //petri.cells.splice(i, 1)
        let s = currentCell.split();
        s[0].updatePoints(petri.cells, petri.food);
        s[1].updatePoints(petri.cells, petri.food);
        s[0].points[0][0] *=-1;
        s[0].points[0][1] *=-1;
        n.push(s[0])
        n.push(s[1])
        //petri.cells.push(s[0]);
        //petri.cells.push(s[1]);

      } else {n.push(currentCell)}
    }
        petri.cells = n;
    }
  if(petri.food.length < 400) {
    for(let i=0; i<200; i++) {
      petri.food.push(new Sugar(new Point(Math.round((setUp.borderRight - setUp.borderLeft) * Math.random()) + setUp.borderLeft-1, Math.round((setUp.borderBottom - setUp.borderTop)* Math.random()) + setUp.borderTop -1), [0,0,0])); 
    }
  }
  setTimeout(start, 1000/60) 

}

petri.initialize();
start();