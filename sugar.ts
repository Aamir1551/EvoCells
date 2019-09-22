import {GameObject} from './gameObject'
import {setUp, Point, Vertex} from './utils'

export class Sugar extends GameObject{

  constructor(position:Point, color:[number, number, number]) {
    super(position, color, 5);
    for(let i=0; i<Math.ceil(this.size); i++) {
      this.vertices.push(new Vertex(this, this.position, this.size, Math.random() - 0.5))
    }
    this.initialAngle= Math.random() * setUp.TAU;
  }

  movePoints(){}
  
}
