import * as T from 'three';
export type V3 = [number, number, number];
export const colors = { wood: '#87543f', plank: '#b98255', lightWood: '#d6a470', darkWood: '#543d38', gold: '#e4bc68', ivory: '#f5ebd2', ink: '#243f47', rope: '#645b49', green: '#6a9779' };
export function createKit() {
  const materials = new Map<string, T.MeshStandardMaterial>();
  function mat(color: string, metalness = 0) {
    const key = color + metalness;
    if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({ color, roughness: metalness ? .4 : .82, metalness, flatShading: true }));
    return materials.get(key)!;
  }
  function mesh(parent: T.Object3D, geo: T.BufferGeometry, color: string | T.Material, position: V3 = [0,0,0], rotation: V3 = [0,0,0]) {
    const m = new T.Mesh(geo, typeof color === 'string' ? mat(color) : color);
    m.position.set(...position); m.rotation.set(...rotation); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function box(parent: T.Object3D, size: V3, position: V3, color: string, rotation: V3 = [0,0,0]) { return mesh(parent, new T.BoxGeometry(...size), color, position, rotation); }
  function cylinder(parent: T.Object3D, radius: number, height: number, position: V3, color: string, rotation: V3 = [0,0,0], top = radius) { return mesh(parent, new T.CylinderGeometry(top, radius, height, 12), color, position, rotation); }
  function sphere(parent: T.Object3D, radius: number, position: V3, color: string, scale: V3 = [1,1,1]) { const m=mesh(parent,new T.IcosahedronGeometry(radius,1),color,position);m.scale.set(...scale);return m; }
  function rope(parent: T.Object3D, points: V3[], color = colors.rope, radius = .025) { const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))); return mesh(parent,new T.TubeGeometry(curve,Math.max(8,points.length*5),radius,5,false),color); }
  function ring(parent: T.Object3D, radius: number, tube: number, position: V3, color: string, rotation: V3=[0,0,0]) { return mesh(parent,new T.TorusGeometry(radius,tube,6,20),mat(color,.3),position,rotation); }
  return { mat, mesh, box, cylinder, sphere, rope, ring };
}
export type Kit = ReturnType<typeof createKit>;
export function makeFlagTexture() {
  const canvas = document.createElement('canvas'); canvas.width=256;canvas.height=160;
  const c=canvas.getContext('2d')!;c.fillStyle='#23363e';c.fillRect(0,0,256,160);c.fillStyle='#f8efd8';
  c.beginPath();c.ellipse(128,65,28,30,0,0,Math.PI*2);c.fill();c.fillRect(112,83,32,17);
  c.fillStyle='#23363e';c.beginPath();c.arc(117,66,7,0,Math.PI*2);c.arc(140,66,7,0,Math.PI*2);c.fill();
  c.beginPath();c.moveTo(128,75);c.lineTo(122,84);c.lineTo(134,84);c.fill();
  c.strokeStyle='#f8efd8';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(92,109);c.lineTo(163,137);c.moveTo(92,137);c.lineTo(163,109);c.stroke();
  [117,128,139].forEach(x=>{c.fillStyle='#23363e';c.fillRect(x,92,3,9);});
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
