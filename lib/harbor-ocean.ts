import * as T from 'three';
import {voyageSeaPalette} from './sea-palette';

export const harborSeaLevel=-.075;
// Metres: long swell, crossing wind waves, then two small capillary wave trains.
const waves=[
 {dx:.93,dz:.37,amplitude:.13,wavelength:11.5,steepness:.22},
 {dx:-.48,dz:.88,amplitude:.085,wavelength:6.4,steepness:.20},
 {dx:.72,dz:.69,amplitude:.038,wavelength:3.1,steepness:.15},
 {dx:-.81,dz:.59,amplitude:.018,wavelength:1.65,steepness:.12},
].map(wave=>{
 const length=Math.hypot(wave.dx,wave.dz),k=Math.PI*2/wave.wavelength;
 return {...wave,dx:wave.dx/length,dz:wave.dz/length,k,omega:Math.sqrt(9.81*k)};
});

function displacement(x:number,z:number,time:number){
 let dx=0,dz=0,height=0;
 for(const wave of waves){
  const phase=wave.k*(wave.dx*x+wave.dz*z)-wave.omega*time;
  height+=wave.amplitude*Math.sin(phase);
  dx+=wave.steepness*wave.amplitude*wave.dx*Math.cos(phase);
  dz+=wave.steepness*wave.amplitude*wave.dz*Math.cos(phase);
 }
 return {dx,dz,height};
}

/** Invert horizontal Gerstner displacement so the hull samples the rendered surface. */
export function harborWaterHeight(x:number,z:number,time:number){
 let px=x,pz=z;
 for(let i=0;i<3;i++){const offset=displacement(px,pz,time);px=x-offset.dx;pz=z-offset.dz;}
 return harborSeaLevel+displacement(px,pz,time).height;
}

const waveCalls=waves.map(w=>` addWave(p,vec2(${w.dx.toFixed(8)},${w.dz.toFixed(8)}),${w.amplitude.toFixed(8)},${w.k.toFixed(8)},${w.omega.toFixed(8)},${w.steepness.toFixed(8)},footprint,offset,tx,tz);`).join('\n');
const waveShader=`
 uniform float oceanTime;
 void addWave(vec2 p,vec2 d,float amplitude,float k,float omega,float steepness,float footprint,inout vec3 offset,inout vec3 tx,inout vec3 tz){
  float phase=k*dot(d,p)-omega*oceanTime;
  float a=amplitude*exp(-.35*k*k*footprint*footprint);
  float s=sin(phase),c=cos(phase),q=steepness*a*k;
  offset+=vec3(steepness*a*d.x*c,a*s,steepness*a*d.y*c);
  tx+=vec3(-q*d.x*d.x*s,a*k*d.x*c,-q*d.x*d.y*s);
  tz+=vec3(-q*d.x*d.y*s,a*k*d.y*c,-q*d.y*d.y*s);
 }
 void oceanSample(vec2 p,float footprint,out vec3 offset,out vec3 normal){
  vec3 tx=vec3(1.,0.,0.),tz=vec3(0.,0.,1.);offset=vec3(0.);
  ${waveCalls}
  normal=normalize(cross(tz,tx));
 }
`;

/** Lit, opaque water using the portfolio sea palette, with displaced waves and per-pixel normals. */
export function createHarborOcean(scene:T.Scene,phone:boolean){
 const clock={value:0};
 const material=new T.ShaderMaterial({
  uniforms:{
   oceanTime:clock,
   deepColor:{value:new T.Color(voyageSeaPalette.water).multiplyScalar(.72)},
   waterColor:{value:new T.Color(voyageSeaPalette.water).multiplyScalar(1.16)},
   skyHorizon:{value:new T.Color(voyageSeaPalette.horizon)},
   skyZenith:{value:new T.Color(voyageSeaPalette.sky)},
   sunColor:{value:new T.Color('#fff1d8')},
   sunDirection:{value:new T.Vector3(-.22,.36,-.91).normalize()},
   hazeDensity:{value:.0055},
  },
  vertexShader:`
   varying vec2 oceanBase;
   varying vec3 waterWorld;
   ${waveShader}
   void main(){
    oceanBase=position.xz;
    vec3 offset,normal;oceanSample(oceanBase,0.,offset,normal);
    vec4 world=modelMatrix*vec4(position+offset,1.);
    waterWorld=world.xyz;
    gl_Position=projectionMatrix*viewMatrix*world;
   }
  `,
  fragmentShader:`
   uniform vec3 deepColor,waterColor,skyHorizon,skyZenith,sunColor,sunDirection;
   uniform float hazeDensity;
   varying vec2 oceanBase;
   varying vec3 waterWorld;
   ${waveShader}
   void main(){
    float footprint=max(length(dFdx(oceanBase)),length(dFdy(oceanBase)));
    vec3 offset,n;oceanSample(oceanBase,footprint,offset,n);
    vec3 view=normalize(cameraPosition-waterWorld);
    float facing=clamp(dot(n,view),0.,1.);
    float fresnel=.02+.98*pow(1.-facing,5.);
    vec3 reflected=reflect(-view,n);
    vec3 sky=mix(skyHorizon,skyZenith,smoothstep(0.,.75,reflected.y));
    float surfaceLight=.60+.40*max(dot(n,normalize(vec3(-.4,.8,.3))),0.);
    float waveBody=clamp(.45+offset.y*.6,0.,1.);
    vec3 body=mix(deepColor,waterColor,waveBody)*surfaceLight;
    vec3 color=mix(body,sky,fresnel*.79);
    float sun=pow(max(dot(reflect(-sunDirection,n),view),0.),150.);
    color+=sunColor*sun*.7;
    float distanceToCamera=length(cameraPosition-waterWorld);
    float haze=1.-exp(-hazeDensity*hazeDensity*distanceToCamera*distanceToCamera);
    color=mix(color,skyHorizon,clamp(haze,0.,1.));
    gl_FragColor=vec4(color,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }
  `,
  depthWrite:true,
  depthTest:true,
 });
 // The dense near grid resolves real small waves; progressively wider cells cover the horizon.
 const geometry=new T.PlaneGeometry(1,1,phone?168:256,phone?190:290);
 const position=geometry.attributes.position;
 for(let i=0;i<position.count;i++){
  const u=position.getX(i)+.5,v=.5-position.getY(i),distance=v*v;
  position.setXYZ(i,(u-.5)*(120+distance*1100),harborSeaLevel,24-distance*750);
 }
 const indices=geometry.index!;
 for(let i=0;i<indices.count;i+=3){const b=indices.getX(i+1);indices.setX(i+1,indices.getX(i+2));indices.setX(i+2,b);}
 geometry.computeVertexNormals();geometry.computeBoundingSphere();
 const water=new T.Mesh(geometry,material);water.name='harbor-rolling-ocean';water.frustumCulled=false;scene.add(water);
 return {color:voyageSeaPalette.water,update(time:number){clock.value=time;}};
}
