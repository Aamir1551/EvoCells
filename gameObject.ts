import {Vertex, Point, setUp, toRGB} from './utils'

export abstract class GameObject {

  public vertices:Array<Vertex>;
  protected initialAngle:number;
  constructor(public position:Point, public color:[number, number, number], public size : number){};

  public draw(ctx:CanvasRenderingContext2D) : void {
    let corner = new Point(setUp.center.x - setUp.width /2, setUp.center.y - setUp.height / 2);
    this.movePoints();
    
    ctx.fillStyle =  toRGB(this.color);
    ctx.strokeStyle = toRGB(this.color);
    ctx.lineWidth = 7
    let n = this.vertices.length;
    ctx.beginPath();
    for(let i=0; i<n; i++) {
      let radius = this.vertices[i].distance;
      let angle = setUp.TAU * i / n + this.initialAngle;
      ctx.lineTo(this.position.x + Math.cos(angle) * radius - corner.x, this.position.y + Math.sin(angle) * radius - corner.y);
    }
    ctx.closePath();
    ctx.fill()
    ctx.stroke();
  }

  public abstract movePoints() : void;
}

