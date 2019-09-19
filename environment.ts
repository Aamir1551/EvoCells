import {Cell} from './cell'
import {setUp, Point} from './utils'
import {Sugar} from './sugar'

var canvas:HTMLCanvasElement=document.getElementsByTagName("canvas")[0];
var ctx=canvas.getContext("2d");

export class Environment {
  
  public food:Array<Sugar>;
  public cells:Array<Cell>;
  public timeCounter = 0;

  constructor(food:Array<Sugar> = [], cells:Array<Cell> = [], public ctx:CanvasRenderingContext2D) {
    [this.food, this.cells] = [food, cells]
  }
  
  public drawAllObjects() {
    for(let i=0; i<this.food.length; i++) {
      this.food[i].draw(ctx);
    }
    for(let i=0; i<this.cells.length; i++) {
      this.cells[i].draw(ctx);
    }
  }

  public detectAllCellCollisions() : void{
    this.cells.forEach(x=>x.vertices.forEach(y=>y.colliding = false))
    
    for(let i=0; i<this.cells.length; i++) {
      let currentCell : Cell = this.cells[i];
      let distanceThreshold = currentCell.distanceThreshold;
      
      for(let j=0; j<currentCell.vertices.length; j++) {
        let currentVertex = currentCell.vertices[j];
        currentVertex.colliding = false;
        if(!currentVertex.position.isInside()) {currentVertex.colliding = true; continue}

        for(let k = 0; k<this.food.length; k++) {
          let dist = currentVertex.position.distanceSquared(this.food[i].position);
          if(dist <= distanceThreshold) {
            this.food.splice(j, 1) 
            currentCell.eatFood(10)
          }
        }
        
        for(let k=i+1; k<this.cells.length; k++) {
          let otherCell : Cell= this.cells[k];
          for(let l=0; l<this.cells[k].vertices.length; l++) {
            let otherCellVertex = this.cells[k].vertices[l];
            let dist = otherCellVertex.position.distanceSquared(currentVertex.position);
            if(dist <= distanceThreshold){ [currentVertex.colliding, otherCellVertex.colliding] = [false, false] }

            if( -dist / 2 >= 0.7 * otherCell.size && currentCell.size > otherCell.size) {
              currentCell.eatFood(otherCell.size * otherCell.size * Math.PI);
            } //eat it
          }
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
    this.timeCounter+=0.01

    if(this.timeCounter>=1) {
      this.cells.forEach(x=>x.updatePoints());
      this.timeCounter = 0;
    }

    this.cells.forEach(x=>x.moveXY(this.timeCounter))
    setUp.center = new Point(setUp.mapwidth/2, setUp.mapheight/2);

    this.drawBackground();
    this.drawAllObjects();
  }
}

let petri = new Environment([], [], ctx)

for(let i=0; i<10; i++) {
  petri.cells.push(new Cell(new Point(Math.random() * canvas.width, Math.random() * canvas.height), Math.random() * 50 + 70, [Math.random() * 255, Math.random() * 255, Math.random() * 255]));
}

for(let i=0; i<50; i++) {
  petri.food.push(new Cell(new Point(Math.round((setUp.borderRight - setUp.borderLeft) * Math.random()) + setUp.borderLeft-1, Math.round((setUp.borderBottom - setUp.borderTop)* Math.random()) + setUp.borderTop -1), 5, [0,0,0]));
}

function start() {

  petri.iterate();

  setTimeout(start, 1000/60) 
}

start();