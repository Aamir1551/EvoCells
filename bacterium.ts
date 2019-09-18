import {Point, Vertex, toRGB, bezierCurve, getRandomPositionOnCanvas} from './utils'
import { setupMaster } from 'cluster';

var canvas:HTMLCanvasElement=document.getElementsByTagName("canvas")[0];
var ctx=canvas.getContext("2d");


export class setUp {
  public static square  = 50;
  public static width = canvas.width;
  public static height = canvas.height;
  public static mapwidth = (setUp.width/setUp.square) * setUp.square;
  public static mapheight = (setUp.height / setUp.square) * setUp.square;
  public static borderLeft = 0;
  public static borderRight = setUp.mapwidth;
  public static borderTop = 0;
  public static borderBottom = setUp.mapheight;
  public static center =  new Point(setUp.mapwidth/2, setUp.mapheight/2);
  public static directionX = 0;
  public static directionY = 0;
  public static allVertices:Array<Vertex> = [];
}

export class Sugar {
  
}


export class Cell {
  private static cellCount = 0;
  public readonly cellID:number;
  public vertices:Array<Vertex> = [];
  public static readonly TAU = Math.PI * 2;
  public readonly distanceThreshold = 25;
  private readonly initialAngle:number = Math.random() * Cell.TAU;
  public directionX : number = 0;
  public directionY : number = 0;
  public points:[[number, number], [number, number], [number, number], [number, number]]; 

  constructor(public position:Point, public size:number, public color:[number, number, number], public cellType : string = "FOOD", public isActive:boolean = true) {
    this.updatePoints();
    this.cellID = Cell.cellCount;
    for(let i=0; i<Math.ceil(this.size); i++) {
      this.vertices.push(new Vertex(this, this.position, this.size, Math.random() - 0.5))
    }
    Cell.cellCount++;
  }
  
  //Returns True when there is a collision
  public detectCollisionForVertex(v:Vertex) : boolean {
    if(v.position.isInside() == false) {
      return true;
    }
    for(let i=0; i<setUp.allVertices.length; i++) {
      let dist = v.position.distanceSquared(setUp.allVertices[i].position)
      if(dist <= this.distanceThreshold && setUp.allVertices[i].cellPointer.cellID != v.cellPointer.cellID){

        if(dist<= this.distanceThreshold/4 && setUp.allVertices[i].cellPointer.cellType == "FOOD" && setUp.allVertices[i].cellPointer.isActive) {
          setUp.allVertices[i].cellPointer.isActive = false;
          v.cellPointer.size = Math.sqrt((v.cellPointer.size* v.cellPointer.size * Math.PI+ 10)/Math.PI);
        }
        if(dist<= this.distanceThreshold/2 && setUp.allVertices[i].cellPointer.cellType == "CELL" && setUp.allVertices[i].cellPointer.size < v.cellPointer.size && setUp.allVertices[i].cellPointer.isActive) {
          setUp.allVertices[i].cellPointer.isActive = false;
          v.cellPointer.size = Math.sqrt(Math.pow(v.cellPointer.size, 2) + Math.pow(setUp.allVertices[i].cellPointer.size, 2));
        }
        return true;
      };
    }
    return false;
  }
  
  public movePoints() : void {
    let n = this.vertices.length;
    let clonedVertices = [];
    for(let q = 0; q<this.vertices.length; q++) {
      let currentVertex = this.vertices[q];
      clonedVertices.push(new Vertex(currentVertex.cellPointer, new Point(currentVertex.position.x, currentVertex.position.y), currentVertex.distance, currentVertex.velocity));
    }
    for(let i=0; i<clonedVertices.length; i++) {
      let limit = 10;
      let [current, before, after] : [Vertex, Vertex, Vertex] = [this.vertices[i], this.vertices[(i-1+n) % n], this.vertices[(i + 1) % n]];
      let acc = (before.velocity + after.velocity + 8*Math.min(Math.max((current.velocity+Math.random()-0.5)*0.7, -limit), limit))/10.0;
      let collision : boolean = (this.cellType == "CELL" && this.detectCollisionForVertex(clonedVertices[i]));
      
      let accAdd  = collision ? Math.min(acc, 0) - 1 : acc;
      let radius = (before.distance + after.distance + 8 * (9 * Math.max(current.distance + acc, 0) + this.size) / 10) / 10
      let angle = Cell.TAU * i / n + this.initialAngle;
      this.vertices[i] = new Vertex(this, new Point(this.position.x + Math.cos(angle) * radius, this.position.y + Math.sin(angle) * radius), radius, accAdd);
    }
  }

  public draw() : boolean {
    if(!this.isActive){return false;}
    let corner = new Point(setUp.center.x - setUp.width /2, setUp.center.y - setUp.height / 2);
    this.movePoints();
    
    ctx.fillStyle =  toRGB(this.color);
    ctx.strokeStyle = toRGB(this.color);
    ctx.lineWidth = 7
    let n = this.vertices.length;
    ctx.beginPath();
    for(let i=0; i<n; i++) {
      let radius = this.vertices[i].distance;
      let angle = Cell.TAU * i / n + this.initialAngle;
      ctx.lineTo(this.position.x + Math.cos(angle) * radius - corner.x, this.position.y + Math.sin(angle) * radius - corner.y);
    }
    ctx.closePath();
    ctx.fill()
    ctx.stroke();
    return true;
  }


  public updatePoints() : void {
    this.points = [getRandomPositionOnCanvas(), getRandomPositionOnCanvas(), getRandomPositionOnCanvas(), getRandomPositionOnCanvas()]
  }

  public moveXY(time:number) : boolean {

    if(!this.isActive){return false;}
    
    let [cx, cy]  = bezierCurve(this.points[0], this.points[1], this.points[2], this.points[3], time);
    let mouse = [cx - setUp.width/2, cy - setUp.height/2];
    let distance = Math.sqrt(mouse[0]*mouse[0] + mouse[1]*mouse[1]);
    let thresh = 100;
    let mult = distance < thresh ? distance / thresh : 1
    this.directionX = mouse[0] / distance * mult;
    this.directionY = mouse[1] / distance * mult;

    let a= 4.0;
  
    this.position = new Point(Math.max(Math.min(this.position.x + a * this.directionX, setUp.borderRight), setUp.borderLeft), Math.max(Math.min(this.position.y + a * this.directionY, setUp.borderBottom), setUp.borderTop))
    return true;
  }
}

function drawBackground() {

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

function drawAllCells() {
  ctx.lineCap = "round";
  cells.sort((a,b)=>(a.size > b.size ? 1:-1))
  for(let i=0; i<sugar.length; i++) {
    sugar[i].draw();
  }
  for(let i=0; i<cells.length; i++) {
    cells[i].draw();
  }
}



let cells : Array<Cell> = []; 

for(let i=0; i<10; i++) {
  cells.push(new Cell(new Point(Math.random() * canvas.width, Math.random() * canvas.height), Math.random() * 50 + 70, [Math.random() * 255, Math.random() * 255, Math.random() * 255], "CELL"));
}


let sugar : Array<Cell> = [];
for(let i=0; i<50; i++) {
  sugar.push(new Cell(new Point(Math.round((setUp.borderRight - setUp.borderLeft) * Math.random()) + setUp.borderLeft-1, Math.round((setUp.borderBottom - setUp.borderTop)* Math.random()) + setUp.borderTop -1), 5, [0,0,0]));
}

var timeCounter = 0;
function start() {

  timeCounter+=0.01;
  if(timeCounter>=1) {
    for(let i=0; i<cells.length; i++) {
      cells[i].updatePoints();
    }
    timeCounter = 0;
  }

  for(let i=0; i<cells.length; i++) {
    cells[i].moveXY(timeCounter);
  }

  setUp.center = new Point(setUp.mapwidth/2, setUp.mapheight/2);
  

  drawBackground();
  setUp.allVertices = [];
  for(let i=0; i<sugar.length; i++) {
    setUp.allVertices.push(...sugar[i].vertices)
  }
  for(let i=0; i<cells.length; i++) {
    setUp.allVertices.push(...cells[i].vertices)
  }


  drawAllCells();
  setTimeout(start, 1000/60) 
}

start();