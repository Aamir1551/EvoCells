import {GameObject} from './gameObject'
import {setUp, Point, Vertex} from './utils'

export class Sugar extends GameObject{

  public vx = Math.random() * 2 -1;
  public vy = Math.random() * 2 -1;

  constructor(position:Point, color:[number, number, number]) {
    super(position, color, 5);
    for(let i=0; i<Math.ceil(this.size); i++) {
      this.vertices.push(new Vertex(this, this.position, this.size, Math.random() - 0.5))
    }
    this.initialAngle= Math.random() * setUp.TAU;
  }

  movePoints(){
    if (this.position.x > 1800) {
      this.vx = -1 - Math.random();
    }
    else if (this.position.x < 0) {
      this.vx = 1 + Math.random();
    } else {
      this.vx *= 1 + (Math.random() * 0.005);
    }

    if (this.position.y > 700) {
      this.vy = -1 - Math.random();
    }
    else if (this.position.y < 0) {
      this.vy = 1 + Math.random();
    } else {
      this.vy *= 1 + (Math.random() * 0.005);
    }  
    this.position.x += this.vx;
    this.position.y += this.vy;
  }
  
}
