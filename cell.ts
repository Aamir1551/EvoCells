import {Point, Vertex, bezierCurve, getRandomPositionOnCanvas, setUp} from './utils'
import {GameObject} from './gameObject'

export class Cell extends GameObject{
  private static cellCount = 0;
  public readonly cellID:number;
  public vertices:Array<Vertex> = [];
  public readonly distanceThreshold = 25;
  protected initialAngle:number = Math.random() * setUp.TAU;
  public directionX : number = 0;
  public directionY : number = 0;
  public points:[[number, number], [number, number], [number, number], [number, number]]; 

  constructor(position:Point, size:number, color:[number, number, number]) {
    super(position, color, size);
    this.updatePoints();
    this.cellID = Cell.cellCount;
    for(let i=0; i<Math.ceil(this.size); i++) {
      this.vertices.push(new Vertex(this, this.position, this.size, Math.random() - 0.5))
    }
    Cell.cellCount++;
  }

  public eatFood(massEaten : number) {
    this.size = Math.sqrt((Math.pow(this.size, 2) * Math.PI+ massEaten)/Math.PI);
  }

    
  public movePoints() : void {
    let n = this.vertices.length;
    
    for(let i=0; i<this.vertices.length; i++) {
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

  public updatePoints() : void {
    this.points = [getRandomPositionOnCanvas(), getRandomPositionOnCanvas(), getRandomPositionOnCanvas(), getRandomPositionOnCanvas()]
  }

  public moveXY(time:number) : void{

    let a = 10.0;
    let [cx, cy]  = bezierCurve(this.points[0], this.points[1], this.points[2], this.points[3], time);
    let mouse = [cx - setUp.width/2, cy - setUp.height/2];
    let distance = Math.sqrt(mouse[0]*mouse[0] + mouse[1]*mouse[1]);
    let thresh = 100;
    let mult = distance < thresh ? distance / thresh : 1
    this.directionX = mouse[0] / distance * mult;
    this.directionY = mouse[1] / distance * mult;
  
    this.position = new Point(Math.max(Math.min(this.position.x + a * this.directionX, setUp.borderRight), setUp.borderLeft), Math.max(Math.min(this.position.y + a * this.directionY, setUp.borderBottom), setUp.borderTop))
  }
}