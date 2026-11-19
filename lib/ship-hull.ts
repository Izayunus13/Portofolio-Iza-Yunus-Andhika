import * as T from 'three';

// A restrained palette shared by the hull, fittings, captain and anchor.
export const shipColors = {
  wood: '#886346', plank: '#a78055', lightWood: '#c6a474', darkWood: '#594337',
  gold: '#c4a466', ivory: '#eee4ce', ink: '#2e4248', rope: '#77664e',
  iron: '#4c6063', ironEdge: '#73817c', seam: '#9a7c58',
};
export const hullOutline: [number, number][] = [
  [-3.25,-1.1],[-2.8,-1.48],[1.65,-1.48],[3.1,-.94],[3.95,0],
  [3.1,.94],[1.65,1.48],[-2.8,1.48],[-3.25,1.1],
];
export const hullLevels = [[.14,.38],[.38,.62],[.72,.82],[1.06,.94],[1.40,1],[1.74,1.03]];

/** One watertight indexed shell, including its keel and the full-width deck. */
export function createHullGeometry() {
  const geometry = new T.BufferGeometry(), vertices: number[] = [], indices: number[] = [];
  const n = hullOutline.length;
  for (const [y, scale] of hullLevels) for (const [x, z] of hullOutline) vertices.push(x * scale, y, z * scale);
  for (let level = 0; level < hullLevels.length - 1; level++) {
    const start = indices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, a = level * n + i, b = level * n + j, c = b + n, d = a + n;
      indices.push(a,c,b,a,d,c);
    }
    geometry.addGroup(start, indices.length - start, level);
  }
  const triangles = T.ShapeUtils.triangulateShape(hullOutline.map(([x,z]) => new T.Vector2(x,z)), []);
  for (const [level, material] of [[0,0],[hullLevels.length - 1,5]]) {
    const start = indices.length, base = level * n;
    for (const triangle of triangles) {
      let [a,b,c] = triangle;
      const pa = hullOutline[a], pb = hullOutline[b], pc = hullOutline[c];
      const normalY = (pb[1]-pa[1])*(pc[0]-pa[0])-(pb[0]-pa[0])*(pc[1]-pa[1]);
      if ((normalY > 0) !== (level > 0)) [b,c] = [c,b];
      indices.push(base+a,base+b,base+c);
    }
    geometry.addGroup(start, indices.length - start, material);
  }
  geometry.setAttribute('position', new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

/** Thick cloth with sealed perimeter edges; no invisible back faces or open seams. */
export function createSailGeometry(x: number, top: number, width: number, height: number) {
  const columns=18,rows=14,stride=columns+1,surface=stride*(rows+1);
  const vertices:number[]=[],indices:number[]=[];
  for(const side of [1,-1]) for(let row=0;row<=rows;row++) for(let col=0;col<=columns;col++) {
    const u=col/columns,v=row/rows;
    vertices.push(x+.72*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)+side*.014,top-v*height+.18*Math.sin(u*Math.PI)*v,(u-.5)*width);
  }
  for(let row=0;row<rows;row++) for(let col=0;col<columns;col++) {
    const a=row*stride+col,b=a+1,c=a+stride,d=c+1;
    indices.push(a,b,c,b,d,c,a+surface,c+surface,b+surface,b+surface,c+surface,d+surface);
  }
  const perimeter:number[]=[];
  for(let col=0;col<=columns;col++)perimeter.push(col);
  for(let row=1;row<=rows;row++)perimeter.push(row*stride+columns);
  for(let col=columns-1;col>=0;col--)perimeter.push(rows*stride+col);
  for(let row=rows-1;row>0;row--)perimeter.push(row*stride);
  for(let i=0;i<perimeter.length;i++) {
    const a=perimeter[i],b=perimeter[(i+1)%perimeter.length];
    indices.push(a,a+surface,b,b,a+surface,b+surface);
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

export function deckSpan(z: number) {
  const intersections:number[]=[];
  for(let i=0;i<hullOutline.length;i++) {
    const a=hullOutline[i],b=hullOutline[(i+1)%hullOutline.length];
    const az=a[1]*1.03,bz=b[1]*1.03;
    if((az<=z&&bz>z)||(bz<=z&&az>z))intersections.push((a[0]+(b[0]-a[0])*(z-az)/(bz-az))*1.03);
  }
  return [Math.min(...intersections)+.07,Math.max(...intersections)-.07];
}

/** Raised trim follows the faceted hull exactly, without spline overshoot or air gaps. */
export function createHullBand(y:number,height:number) {
  function scaleAt(value:number) {
    const index=Math.max(0,hullLevels.findIndex((level,i)=>i<hullLevels.length-1&&value<=hullLevels[i+1][0]));
    const a=hullLevels[index],b=hullLevels[index+1];
    return T.MathUtils.lerp(a[1],b[1],T.MathUtils.clamp((value-a[0])/(b[0]-a[0]),0,1));
  }
  const bottom=y-height/2,top=Math.min(1.738,y+height/2),n=hullOutline.length;
  const profile=[[bottom,scaleAt(bottom)-.006],[bottom,scaleAt(bottom)+.006],[top,scaleAt(top)+.006],[top,scaleAt(top)-.006]];
  const vertices:number[]=[],indices:number[]=[];
  profile.forEach(([height,scale])=>hullOutline.forEach(([x,z])=>vertices.push(x*scale,height,z*scale)));
  for(let ring=0;ring<4;ring++)for(let i=0;i<n;i++){
    const next=(i+1)%n,other=(ring+1)%4,a=ring*n+i,b=ring*n+next,c=other*n+next,d=other*n+i;
    indices.push(a,c,b,a,d,c);
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
