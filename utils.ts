import {GameObject} from './gameObject' //do check this, as this has been done to avoid circular dependencies

const WIDTH : number = 1800;
const HEIGHT : number = 700;

export function getRandomPositionOnCanvas() : [number, number] {
    return [Math.random() * WIDTH, Math.random() * HEIGHT];
}

export function bezierCurve(p0:[number, number], p1:[number, number], p2:[number, number], p3:[number, number], t:number) : [number, number] {
    return [bezierCurveX(p0[0], p1[0], p2[0], p3[0], t), bezierCurveX(p0[1], p1[1], p2[1], p3[1], t)];
}

export function bezierCurveX(p0:number, p1:number, p2:number, p3:number, t:number) : number {
    return Math.pow(1-t,3)*p0 + 3*t*Math.pow(1-t,2)*p1 + 3*t*t*(1-t)*p2 + Math.pow(t,3)*p3;
}

export function sineCircleXYatAngle(cx:number,cy:number,radius:number,amplitude:number,angle:number,sineCount:number) : {x:number, y:number}{
  var x = cx+(radius+amplitude*Math.sin(sineCount*angle))*Math.cos(angle);
  var y = cy+(radius+amplitude*Math.sin(sineCount*angle))*Math.sin(angle);
  return({x:x,y:y});
}

export function toRGB(color:[number, number, number]) : string {
    return "RGB(" + color[0].toString() + "," + color[1].toString() + "," + color[2].toString() + ")";
}

export class Point {

    constructor(public x:number = 0, public y:number = 0) {}
    public isInside() : Boolean {
        return this.x >= setUp.borderLeft && this.x <= setUp.borderRight && this.y >= setUp.borderTop && this.y <= setUp.borderBottom; //using setUp here, and setUp uses a point
    }
    public distanceSquared(point:Point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }
}

export class Vertex {
    public colliding : boolean = false;
    constructor(public objectPointer:GameObject, public position:Point, public distance:number, public velocity:number){};
}

export class setUp {
  public static readonly TAU = Math.PI * 2;
  public static square  = 50;
  public static width = WIDTH;
  public static height = HEIGHT;
  public static mapwidth = (setUp.width/setUp.square) * setUp.square;
  public static mapheight =(setUp.height / setUp.square) * setUp.square;
  public static borderLeft = 0;
  public static borderRight = setUp.mapwidth;
  public static borderTop = 0;
  public static borderBottom = setUp.mapheight;
  public static center =  new Point(setUp.mapwidth/2, setUp.mapheight/2);
  public static directionX = 0;
  public static directionY = 0;
}

export function getAverageColor(colors : Array<[number, number, number]>, weights : Array<number>) : [number, number, number] {
    let resuts : [number, number, number] = [0,0,0];
    for(let i=0; i<colors.length; i++) {
        resuts[0] += Math.pow(colors[i][0], 2) * weights[i];
        resuts[1] += Math.pow(colors[i][1], 2) * weights[i];
        resuts[2] += Math.pow(colors[i][2], 2) * weights[i];
    }
    resuts = [Math.sqrt(resuts[0]), Math.sqrt(resuts[1]), Math.sqrt(resuts[2])];
    return resuts;
}


export function getColorGivenHash(colors:Array<[number, number, number]>, probabilities: Array<number>, probability:number) : [number, number, number] {
    let index:number = -1;
    while(probability >= 0) {
        index++;
        probability -= probabilities[index];
    }
    return colors[index];
}