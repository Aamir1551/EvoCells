import {Point, Vertex, bezierCurve, getRandomPositionOnCanvas, setUp, toRGB, getAverageColor, getColorGivenHash} from './utils'
import {GameObject} from './gameObject'
import { Sugar } from './sugar';

export class Cell extends GameObject{
  private static cellCount = 0;
  public readonly cellID:number;
  public readonly distanceThreshold = 25;
  protected initialAngle:number = Math.random() * setUp.TAU;
  public directionX : number = 0;
  public directionY : number = 0;
  public points:[[number, number], [number, number], [number, number], [number, number]]; 

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
    let vectorGOTO : [number, number]= [0,0];
    let vectorSwirl : [number, number]= [0,0];
    let range : number = this.DNA[2] * 300;
    for(let i=0; i<cells.length; i++) {
      let dist: (number) = cells[i].position.distanceSquared(this.position) - cells[i].size - this.size;
      if(dist <= range) {
        if(cells[i].size * 1.2 < this.size) {
          vectorGOTO[0] += (cells[i].position.x - this.position.x) * 3;
          vectorGOTO[1] += (cells[i].position.y - this.position.y) * 3;
        }
        if(cells[i].size * 1.2 > this.size) {
          vectorGOTO[0] -= (cells[i].position.x - this.position.x) * 3;
          vectorGOTO[1] -= (cells[i].position.y - this.position.y) * 3;
        }
      }
    }
    
    for(let i=0; i<food.length; i++) {
      let dist:number = food[i].position.distanceSquared(this.position) - this.size; 
      if(dist<=range) {
        vectorSwirl[0] += (food[i].position.x - this.position.x) * 0.1;
        vectorSwirl[1] += (food[i].position.y - this.position.y) * 0.1;
      }
    }
    this.points = [vectorGOTO, vectorGOTO, vectorGOTO, vectorGOTO]
    if(vectorGOTO.toString() == [0,0].toString()) {
      this.points = [vectorSwirl, vectorSwirl, vectorSwirl, vectorSwirl]
      vectorGOTO = [Math.random() * 100 - 50, Math.random() * 100 - 50];
    }
    if(vectorSwirl.toString() == [0,0].toString()) {
      this.points = [[Math.random() * 100 - 50, Math.random() * 100 - 50], vectorSwirl, vectorSwirl, vectorSwirl]
    }
    
    
    /*



    if(vectorSwirl.toString() == [0,0].toString()) {
      vectorSwirl = [Math.random() * 100 - 50, Math.random() * 100 -50];
    }
    let [a,b] = vectorSwirl
    let [c,d] = vectorGOTO
    this.points = [[a/2 ,b/2], [ (a+c)/2, (b+d)/2],[c/2,d/2], [c,d]]; */
  }

  public moveXY(time:number) : void{

    let a = this.DNA[0] * 5;
    let [cx, cy]  = bezierCurve(this.points[0], this.points[1], this.points[2], this.points[3], time);
    let mouse = [cx, cy]
    mouse = [this.points[0][0], this.points[0][1]]
    let distance = Math.max(Math.sqrt(mouse[0]*mouse[0] + mouse[1]*mouse[1]), 0.00001);
    let thresh = 100;
    let mult = distance < thresh ? distance / thresh : 1
    this.directionX = mouse[0] / distance * mult;
    this.directionY = mouse[1] / distance * mult;
    this.position = new Point(Math.max(Math.min(this.position.x + a * this.directionX, setUp.borderRight), setUp.borderLeft), Math.max(Math.min(this.position.y + a * this.directionY, setUp.borderBottom), setUp.borderTop)) 
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