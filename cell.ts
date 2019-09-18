import {getRandomPositionOnCanvas, bezierCurve, sineCircleXYatAngle} from './utils'


//make Sure the amount of food in system goes down, AND MAKE SURE MASS IS NOT MADE PROPORTIONAL TO THE RADIUS!!!

export class Cell {
    
    constructor(public readonly DNA:[number, number, number, number], public readonly DNAcolors:[string, string, string, string]) {
        for(let i =0; i<this.DNA.length; i++) {
            this.DNAMagnitude += this.DNA[i];
        }
        this.mass = 50;
        this.targetMass = 50;
        this.foodCollected = 50;
    }
    
    public health : number = 100;
    public foodCollected : number = 50;
    public DNAMagnitude : number = 0;
    public position:[number, number] = getRandomPositionOnCanvas();
    public isAlive:boolean = true;
    public covered:number = 0;
    public p0:[number, number] = this.position;
    public p1:[number, number] = getRandomPositionOnCanvas();
    public p2:[number, number] = getRandomPositionOnCanvas();
    public p3:[number, number] = getRandomPositionOnCanvas();
    public color:[number, number, number] = [Math.round(Math.random()*255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)];
    public mass:number = 5;
    public immuneStrength:number;
    public speed:number;
    public targetMass:number;

    public useEnergy() : void {
        let [speed, immunseStrength, mass, metabolicRate] = this.DNA;
        let scale = (this.foodCollected) / this.DNAMagnitude * metabolicRate;
        this.speed = speed * scale;
        this.immuneStrength = immunseStrength * scale;
        this.mass = Math.sqrt(scale) * mass; //take good care when changing these values, as the cells can just blow up
        this.foodCollected -= 0.02;
    }
    
    public cellDivide() : [Cell, Cell] {
        let child1 = new Cell(this.DNA, this.DNAcolors);
        let child2 = new Cell(this.DNA, this.DNAcolors);
        child1.mass = this.mass;
        child2.mass = this.mass;
        child1.targetMass = this.mass /2;
        child2.targetMass = this.mass /2;
        child1.foodCollected = this.foodCollected/2;
        child2.foodCollected = this.foodCollected/2;
        child1.position = this.position;
        child2.position = this.position;
        this.isAlive = false;
        return [child1, child2]
    }
    
    public eatCell(otherCell : Cell) : void {
        this.foodCollected += otherCell.getProteinValue();
        otherCell.isAlive = false;
   }
   
   public draw(canvas:HTMLCanvasElement):void {
       
    let ctx = canvas.getContext("2d");
       /*ctx.beginPath();
       ctx.arc(this.position[0], this.position[1], this.mass, 0, 2*Math.PI);
       ctx.fillStyle = this.color; 
       ctx.fill();
       ctx.fillStyle = "black";
       ctx.textAlign = "center";
       ctx.fillText(Math.round(this.foodCollected).toString(), this.position[0], this.position[1]);
       ctx.closePath()*/
       
       ctx.beginPath();
       for(let i=0;i<360;i++){
           let angle=(i)*Math.PI/180 ;
           let pt=sineCircleXYatAngle(this.position[0],this.position[1],this.mass,(3+Math.random()*1.8)/100 * this.mass,angle,5);
           ctx.lineTo(pt.x,pt.y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "rgb(" + this.color[0].toString() + "," + this.color[1].toString()  + "," + this.color[2].toString() + ")"
        ctx.fill();
        ctx.lineWidth = 27 / 100 * this.mass;
        ctx.strokeStyle = "rgb(" + this.color[0].toString() + "," + this.color[1].toString()  + "," + this.color[2].toString() + ")"
        console.log(ctx.fillStyle, ctx.strokeStyle)
        //this.drawDNA(canvas);
    }

   public drawDNA(canvas:HTMLCanvasElement) : void {
        let colorPercentages = [0];
        for(let i=0; i<this.DNA.length; i++) {
            colorPercentages.push(this.DNA[i] * Math.PI * 2 / this.DNAMagnitude + colorPercentages[i]);
            this.drawBorder(canvas, this.DNAcolors[i], colorPercentages[i], colorPercentages[i+1], 2);
        }
   }


   public drawBorder(canvas:HTMLCanvasElement, color:string, start:number = 0, end:number = Math.PI * 2, lineWidth:number) : void {
       let ctx = canvas.getContext("2d");
       ctx.beginPath();
       ctx.arc(this.position[0], this.position[1], this.mass, start, end);
       ctx.strokeStyle = color;
       ctx.lineWidth = lineWidth;
       ctx.stroke();
       ctx.closePath();
   }

   public static fight(cell1:Cell, cell2:Cell) {
       let eatRatio = 1;
       cell1.mass > cell2.mass * eatRatio  ? cell1.eatCell(cell2) : cell2.mass > cell1.mass * eatRatio ? cell2.eatCell(cell1) : null;
   }

   public getProteinValue(): number {
       return this.mass* 0.7;
   }

   public move():void {
       this.useEnergy();
       this.isAlive = this.mass >0 && this.targetMass > 0;
       if(this.covered > 0.8) {
           this.covered = 0;
       }
       this.mass += (this.targetMass - this.mass) * 0.9;

       if(this.covered == 0) {
           //pick new bezierpoints
           this.p0 = this.position;
           this.p1 = this.p3 ;
           this.p2 = getRandomPositionOnCanvas();
           this.p3 = getRandomPositionOnCanvas();
       }
       
       this.covered += 0.001 * this.speed / this.mass;
       this.position = bezierCurve(this.p0, this.p1, this.p2, this.p3, this.covered);
   }

}
