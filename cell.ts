import {Point, Vertex, bezierCurve, getRandomPositionOnCanvas, setUp, toRGB, getAverageColor, getColorGivenHash, sineCircleXYatAngle} from './utils'
import {GameObject} from './gameObject'
import { Sugar } from './sugar';

export class Cell extends GameObject{
  private static cellCount = 0;
  public readonly cellID:number;
  public readonly distanceThreshold = 25;
  protected initialAngle:number = Math.random() * setUp.TAU;
  public directionX : number = 0;
  public directionY : number = 0;
  public movementDirection:[number, number] = [0,0]; 
  public splitting:[number, [number, number]] = [-1, [0,0]];

  constructor(position:Point, size:number, color:[number, number, number], public DNA: [number, number, number], public targetSize = size) {
    //DNA = [speed, size, sense]
    super(position, color, size);
    this.cellID = Cell.cellCount;
    for(let i=0; i<Math.ceil(this.size); i++) {
      this.vertices.push(new Vertex(this, this.position, this.size, Math.random() - 0.5))
    }
    Cell.cellCount++;
    this.color = getAverageColor([[255, 0, 0], [0, 255, 0], [0,0,255]], this.DNA);
  }

  public looseMass() {
    this.targetSize = Math.sqrt((Math.pow(this.targetSize, 2) * Math.PI -10 * (1-this.DNA[1]))/Math.PI);
  }

  public eatFood(massEaten : number) {
    this.targetSize = Math.sqrt((Math.pow(this.targetSize, 2) * Math.PI+ massEaten * this.DNA[1])/Math.PI);
  }

  public split() : [Cell, Cell] {
    let s = Math.sqrt((Math.pow(this.targetSize, 2) * Math.PI / 2) / Math.PI)
    let a = new Cell(this.position, this.size, this.color, this.getDNAMutated());
    let b = new Cell(this.position, this.size, this.color, this.getDNAMutated());
    a.targetSize = s;
    b.targetSize = s;
    a.splitting = [100, [this.movementDirection[0] *-1, this.movementDirection[1] *-1]]
    return [a, b];
  }

  public getDNAMutated() : [number, number, number] {
    let [speed, size, sense] = this.DNA;
    speed = Math.max(Math.min(speed + Math.random() /10 , 1), 0);
    size = Math.max(Math.min(size + Math.random()/10, 1), 0);
    sense = Math.max(Math.min(sense + Math.random()/10, 1), 0);
    return [speed, size, sense];
  }

    
  public movePoints() : void {
    let n = this.vertices.length;
    
    for(let i=0; i<this.vertices.length; i++) {
      this.size += (this.targetSize - this.size) * 0.9;
      let limit = 10;
      let [current, before, after] : [Vertex, Vertex, Vertex] = [this.vertices[i], this.vertices[(i-1+n) % n], this.vertices[(i + 1) % n]];
      let acc = (before.velocity + after.velocity + 8*Math.min(Math.max((current.velocity+Math.random()-0.5)*0.7, -limit), limit))/10.0;
      let collision : boolean = this.vertices[i].colliding;
      let accAdd  = collision ? Math.min(acc, 0) - 1 : acc;
      let radius = (before.distance + after.distance + 8 * (9 * Math.max(current.distance + acc, 0) + this.size) / 10) / 10
      let angle = setUp.TAU * i / n + this.initialAngle;
      this.vertices[i] = new Vertex(this, new Point(this.position.x + Math.cos(angle) * radius, this.position.y + Math.sin(angle) * radius), radius, accAdd);
    }
  }

  public updatePoints(cells:Array<Cell>, food:Array<Sugar>) : void {
    if(this.splitting[0] > 0) {
      this.splitting[0]--;
      this.movementDirection = this.splitting[1];
      return;
    }
    let vectorGOTO : [number, number]= [0,0];
    let range : number = this.DNA[2] * 300;
    for(let i=0; i<cells.length; i++) {
      let dist: (number) = Math.max(cells[i].position.distanceSquared(this.position) - cells[i].size - this.size, 0.00001);
      if(dist <= range) {
        if(cells[i].size * 1.2 < this.size) {
          range = dist;
          vectorGOTO[0] = (cells[i].position.x - this.position.x);
          vectorGOTO[1] = (cells[i].position.y - this.position.y);
        }
        if(cells[i].size > this.size * 1.2) {
          range = dist;
          vectorGOTO[0] = (cells[i].position.x - this.position.x) * -1;
          vectorGOTO[1] = (cells[i].position.y - this.position.y) * -1;
        }
      }
    }
    if(vectorGOTO.toString() != [0,0].toString()){
      this.movementDirection = vectorGOTO;
      return;
    }
    for(let i=0; i<food.length; i++) {
      let dist:number = Math.max(food[i].position.distanceSquared(this.position) - this.size, 0.0001); 
      if(dist<=range) {
        vectorGOTO[0] += (food[i].position.x - this.position.x);
        vectorGOTO[1] += (food[i].position.y - this.position.y);
      }
    }
    if(vectorGOTO.toString() != [0,0].toString()) {
      this.movementDirection = [vectorGOTO[0] + this.movementDirection[0], vectorGOTO[1] + this.movementDirection[1]];
      return;
    }
  }

  public moveXY() : void{
    let speed = this.DNA[0] * 5;
    let distance = Math.max(Math.sqrt( Math.pow(this.movementDirection[0], 2) + Math.pow(this.movementDirection[1], 2)), 0.00001);
    this.movementDirection = [this.movementDirection[0] /distance, this.movementDirection[1] / distance]
    this.directionX = Math.max(Math.min(this.movementDirection[0] * speed, 10), -10);
    this.directionY = Math.max(Math.min(this.movementDirection[1] * speed, 10), -10);
    this.position = new Point(Math.max(Math.min(this.position.x + this.directionX, setUp.borderRight), setUp.borderLeft), Math.max(Math.min(this.position.y + this.directionY, setUp.borderBottom), setUp.borderTop)) 
  } 

  public drawSense(ctx:CanvasRenderingContext2D) :void {
    ctx.beginPath();
    ctx.fillStyle = "rgb(255,0,0, 0.4)"
    ctx.strokeStyle = "rgb(255,0,0, 0.4)"
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.arc(this.position.x, this.position.y, this.DNA[2] * 300 + this.size, 0, 2 * Math.PI);
    ctx.fill()
    ctx.stroke();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.drawSense(ctx)
    super.draw(ctx);
  }

}