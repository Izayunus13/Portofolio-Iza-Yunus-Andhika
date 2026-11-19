'use client';

import {useLayoutEffect,useId,useRef} from 'react';
import {Anchor} from 'lucide-react';



/** Project the hanging end onto the moving gold clasp; the upper chain stays offscreen. */
function drawChain(svg:SVGSVGElement,width:number,overflow:number,drop:number,roll=0,pitch=0){
 if(width<=0||!Number.isFinite(width+overflow+drop+roll+pitch))return;
 const z=roll*Math.PI/180,x=pitch*Math.PI/180,lever=drop-60;
 const depth=Math.sin(x)*lever,projection=1100/(1100-depth);
 const endX=width/2-Math.sin(z)*Math.cos(x)*lever*projection;
 const endY=overflow+8+Math.cos(z)*Math.cos(x)*lever*projection;
 const height=overflow+drop;
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
 for(const strand of ['back','front']){
  const path=svg.querySelector<SVGPathElement>(`[data-chain-path="${strand}"]`)!;
  const end=endX+(strand==='back'?-5:5);
  path.setAttribute('d',strand==='back'
   ?`M ${width*.28} 0 C ${width*.22} ${height*.40}, ${end-width*.15} ${endY-66}, ${end} ${endY}`
   :`M ${width*.79} 0 C ${width*.83} ${height*.36}, ${end+width*.12} ${endY-56}, ${end} ${endY}`);
  const length=path.getTotalLength();
  svg.querySelectorAll<SVGGElement>(`[data-chain-link="${strand}"]`).forEach((link,index)=>{
   const distance=length-index*12.5;
   link.style.display=distance<0?'none':'';
   if(distance<0)return;
   const point=path.getPointAtLength(distance),before=path.getPointAtLength(Math.max(0,distance-1));
   const angle=Math.atan2(point.y-before.y,point.x-before.x)*180/Math.PI-90;
   link.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${angle})`);
  });
 }
}

function PirateChain({id}:{id:string}){
 return <svg className="portrait-gold-chain" data-testid="portrait-gold-chain" viewBox="0 0 400 500" aria-hidden="true" focusable="false">
  <defs>
   <linearGradient id={id+'-gold'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0b1"/><stop offset=".22" stopColor="#f0c460"/><stop offset=".46" stopColor="#a46b23"/><stop offset=".7" stopColor="#ffe5a1"/><stop offset="1" stopColor="#825319"/></linearGradient>
   <path data-chain-path="back" d="M112 0 Q100 250 195 450"/>
   <path data-chain-path="front" d="M316 0 Q330 300 205 450"/>
  </defs>
  {(['back','front'] as const).map(strand=><g key={strand} className={`gold-chain-strand gold-chain-${strand}`}>
   {Array.from({length:64},(_,index)=><g key={index} data-chain-link={strand} className={index%2?'gold-chain-link-edge':'gold-chain-link-face'}>
    <ellipse rx={index%2?2.3:5.3} ry="8.5" cy="1.2" fill="none" stroke="#35230f" strokeWidth="4.3"/>
    <ellipse rx={index%2?2.3:5.3} ry="8.5" fill="none" stroke={'url(#'+id+'-gold)'} strokeWidth={index%2?3.7:3.3}/>
    <path d={index%2?'M-.5-6.5Q-2.7-1-.7 5.8':'M1-7Q-6.6-7-5.4.7'} fill="none" stroke="#fff2be" strokeWidth=".8" strokeLinecap="round" opacity=".85"/>
   </g>)}
  </g>)}
 </svg>;
}

export function HangingPortrait({active}:{active:boolean}){
 const id=useId().replace(/:/g,'');
 const rig=useRef<HTMLDivElement>(null),pendulum=useRef<HTMLDivElement>(null),portrait=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const root=rig.current,moving=pendulum.current,frame=portrait.current;
  if(!root||!moving||!frame)return;
  const chain=root.querySelector<SVGSVGElement>('.portrait-gold-chain')!;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  const scrollArea=root.closest('.prologue-about');
  let raf=0,last=0,elapsed=0,pointer:{x:number;y:number}|null=null,side=1;
  let bounds={left:0,top:0,width:0,height:0,drop:0},leftLimit=6,rightLimit=6;
  const pose={roll:0,pitch:0,yaw:0},velocity={roll:0,pitch:0,yaw:0};
  const measure=()=>{
   if(!root.isConnected||!moving.isConnected||!frame.isConnected)return;
   const box=root.getBoundingClientRect(),drop=parseFloat(getComputedStyle(moving).paddingTop);
   if(box.width<=0||!Number.isFinite(drop))return;
   const overflow=Math.max(100,box.top+90);
   root.style.setProperty('--chain-overflow',overflow+'px');
   drawChain(chain,box.width,overflow,drop,pose.roll,pose.pitch);
   bounds={left:box.left,top:box.top,width:box.width,height:frame.offsetHeight,drop};
   const lever=bounds.height+drop;
   leftLimit=Math.max(0,Math.min(7.5,(box.left-18)/Math.max(1,lever)*180/Math.PI));
   rightLimit=Math.max(0,Math.min(7.5,(innerWidth-box.right-18)/Math.max(1,lever)*180/Math.PI));
  };
  const reset=()=>{
   pose.roll=pose.pitch=pose.yaw=velocity.roll=velocity.pitch=velocity.yaw=0;
   moving.style.removeProperty('--portrait-roll');moving.style.removeProperty('--portrait-pitch');moving.style.removeProperty('--portrait-yaw');
   if(bounds.width)drawChain(chain,bounds.width,parseFloat(root.style.getPropertyValue('--chain-overflow')),bounds.drop);
  };
  const tick=(now:number)=>{
   const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;elapsed+=dt;
   let roll=Math.sin(elapsed*.83)*.24,pitch=Math.sin(elapsed*.61)*.15,yaw=Math.sin(elapsed*.49)*.2;
   if(pointer&&fine.matches){
    const nx=(pointer.x-bounds.left-bounds.width/2)/Math.max(1,bounds.width*.7);
    const ny=(pointer.y-bounds.top-bounds.drop-bounds.height/2)/Math.max(1,bounds.height*.68);
    const influence=Math.max(0,1-Math.hypot(nx,ny)/1.55);
    if(Math.abs(nx)>.06)side=Math.sign(nx);
    // The clasp and frame sway together; the chain remains attached above the screen.
    roll+=side*(2.7+Math.min(1,Math.abs(nx))*6)*influence;
    pitch+=Math.max(-1,Math.min(1,-ny))*4*influence;
    yaw+=Math.max(-1,Math.min(1,-nx))*5*influence;
   }
   const target={roll:Math.max(-rightLimit,Math.min(leftLimit,roll)),pitch,yaw};
   for(let step=0;step<2;step++)for(const axis of ['roll','pitch','yaw'] as const){
    const h=dt/2;
    velocity[axis]+=((target[axis]-pose[axis])*42-velocity[axis]*8.8)*h;
    pose[axis]+=velocity[axis]*h;
   }
   pose.roll=Math.max(-rightLimit,Math.min(leftLimit,pose.roll));
   moving.style.setProperty('--portrait-roll',pose.roll.toFixed(4)+'deg');
   moving.style.setProperty('--portrait-pitch',pose.pitch.toFixed(4)+'deg');
   moving.style.setProperty('--portrait-yaw',pose.yaw.toFixed(4)+'deg');
   drawChain(chain,bounds.width,parseFloat(root.style.getPropertyValue('--chain-overflow')),bounds.drop,pose.roll,pose.pitch);
   raf=requestAnimationFrame(tick);
  };
  const sync=()=>{
   cancelAnimationFrame(raf);last=0;pointer=null;
   root.dataset.motion=reduced.matches?'reduced':active?'swinging':'resting';
   reset();measure();
   if(active&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(tick);
  };
  const move=(event:PointerEvent)=>{if(event.pointerType==='touch'||!fine.matches){pointer=null;return;}pointer={x:event.clientX,y:event.clientY};};
  const leave=()=>{pointer=null;};
  const observer=new ResizeObserver(measure);observer.observe(root);observer.observe(frame);
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('blur',leave);
  document.documentElement.addEventListener('pointerleave',leave);
  window.addEventListener('resize',measure);scrollArea?.addEventListener('scroll',measure,{passive:true});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);fine.addEventListener('change',sync);
  sync();
  return()=>{
   cancelAnimationFrame(raf);observer.disconnect();reset();
   window.removeEventListener('pointermove',move);window.removeEventListener('blur',leave);
   document.documentElement.removeEventListener('pointerleave',leave);
   window.removeEventListener('resize',measure);scrollArea?.removeEventListener('scroll',measure);
   document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);fine.removeEventListener('change',sync);
  };
 },[active]);
 return <div ref={rig} className="prologue-portrait-rig" data-testid="hanging-portrait">
  <PirateChain id={'portrait-chain-'+id}/>
  <div ref={pendulum} className="portrait-pendulum">
   <div className="portrait-chain-hardware" aria-hidden="true"><i className="chain-split-ring"/><i className="chain-swivel"/><i className="chain-snap-hook"/></div>
   <figure ref={portrait} className="prologue-about-portrait" data-testid="about-portrait-frame" data-frame-style="captains-timber">
    <div className="portrait-frame-tab" aria-hidden="true"><i/></div>
    <div className="portrait-nautical-trim" aria-hidden="true">{['nw','ne','se','sw'].map(corner=><i key={corner} className={`portrait-frame-corner portrait-frame-corner-${corner}`}/>)}</div>
    <div className="prologue-portrait-window"><img src="/images/prologue/iza-almet-cutout.webp" alt="Iza Yunus Andhika wearing his Diponegoro University blazer" decoding="async" draggable={false}/></div>
    <figcaption><span className="portrait-caption-name"><Anchor size={15} strokeWidth={1.4} aria-hidden="true"/><span>IZA YUNUS ANDHIKA</span></span><small>Diponegoro University</small></figcaption>
   </figure>
  </div>
 </div>;
}


