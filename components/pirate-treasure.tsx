'use client';

import {useEffect,useId,useRef,type CSSProperties} from 'react';

const scattered=Array.from({length:18},(_,i)=>({
 x:34+(i*17.37)%49,y:3+(i*11)%22,size:29+(i*7)%20,angle:(i*47)%180-90,
}));
const stacks=[{x:48,y:13,count:5},{x:65,y:8,count:7},{x:76,y:17,count:5}].flatMap((stack,j)=>
 Array.from({length:stack.count},(_,i)=>({x:stack.x+Math.sin(i*2+j)*.30,y:stack.y+i*3.4,size:40+j*2,angle:i*27+j*19})));
const coins=[...scattered,...stacks];

/** Decorative SVG doubloons sit on the deck; one coin hops and flips at a time. */
export function PirateTreasure({active}:{active:boolean}){
 const root=useRef<HTMLDivElement>(null),id='voyage-doubloon-'+useId().replace(/:/g,'');
 useEffect(()=>{
  const host=root.current;if(!host)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let timer:ReturnType<typeof setTimeout>|undefined,animations:Animation[]=[],generation=0,last=-1,cycles=0;
  const coinNodes=Array.from(host.querySelectorAll<HTMLElement>('.pirate-floor-coin'));
  const clear=()=>{
   generation++;clearTimeout(timer);animations.forEach(animation=>animation.cancel());animations=[];
   coinNodes.forEach(coin=>{coin.dataset.state='resting';});delete host.dataset.activeCoin;
  };
  const flip=async()=>{
   if(!active||reduced.matches||document.hidden)return;
   let index=Math.floor(Math.random()*coinNodes.length);
   if(index===last)index=(index+1)%coinNodes.length;last=index;
   const coin=coinNodes[index],angle=Number(coin.dataset.angle),version=generation;
   const jump=coin.querySelector<HTMLElement>('.pirate-coin-hop')!,body=coin.querySelector<HTMLElement>('.pirate-coin-body')!,shadow=coin.querySelector<HTMLElement>('.pirate-coin-shadow')!;
   coin.dataset.state='flipping';host.dataset.activeCoin=String(index);
   const duration=1340,rotation=(x:number)=>`rotateX(${x}deg) rotateZ(${angle}deg)`;
   animations=[
    jump.animate([
     {transform:'translateY(0px)',offset:0,easing:'cubic-bezier(.18,.75,.32,1)'},
     {transform:'translateY(-78px)',offset:.44,easing:'cubic-bezier(.64,0,.85,.34)'},
     {transform:'translateY(0px)',offset:.85,easing:'ease-out'},
     {transform:'translateY(-7px)',offset:.93,easing:'ease-in'},
     {transform:'translateY(0px)',offset:1},
    ],{duration}),
    body.animate([
     {transform:rotation(62),offset:0},
     {transform:rotation(-298),offset:.43},
     {transform:rotation(-658),offset:.85},
     {transform:rotation(-652),offset:.93},
     {transform:rotation(-658),offset:1},
    ],{duration,easing:'linear'}),
    shadow.animate([
     {transform:'scale(1)',opacity:.42,offset:0},
     {transform:'scale(.55)',opacity:.13,offset:.44},
     {transform:'scale(1.1)',opacity:.48,offset:.85},
     {transform:'scale(1)',opacity:.42,offset:1},
    ],{duration}),
   ];
   try{await Promise.all(animations.map(animation=>animation.finished));}catch{return;}
   if(version!==generation)return;
   animations=[];coin.dataset.state='resting';delete host.dataset.activeCoin;
   host.dataset.flipCount=String(++cycles);
   if(active&&!reduced.matches&&!document.hidden)timer=setTimeout(flip,3400+Math.random()*900);
  };
  const sync=()=>{
   clear();host.dataset.motion=reduced.matches?'reduced':active?'playing':'resting';
   if(active&&!reduced.matches&&!document.hidden)timer=setTimeout(flip,2200);
  };
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
  return()=>{clear();reduced.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
 },[active]);
 return <div ref={root} className="pirate-treasure-floor" data-testid="pirate-treasure" data-flip-count="0" aria-hidden="true">
  <svg className="pirate-coin-definitions" width="0" height="0" focusable="false">
   <defs>
    <radialGradient id={id+'-face'} cx=".32" cy=".23" r=".85"><stop stopColor="#fff1a5"/><stop offset=".3" stopColor="#e9c45e"/><stop offset=".65" stopColor="#d39b36"/><stop offset="1" stopColor="#a56c22"/></radialGradient>
    <linearGradient id={id+'-rim'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff1b4"/><stop offset=".28" stopColor="#ecbf50"/><stop offset=".52" stopColor="#8f591a"/><stop offset=".76" stopColor="#f7d87c"/><stop offset="1" stopColor="#704315"/></linearGradient>
    <g id={id+'-blank'}>
     <circle cx="48" cy="48" r="45" fill={'url(#'+id+'-rim)'} stroke="#764916" strokeWidth="2"/>
     <circle cx="48" cy="48" r="39" fill={'url(#'+id+'-face)'} stroke="#fff0ab" strokeWidth="1.6"/>
     <circle cx="48" cy="48" r="34" fill="none" stroke="#8f6025" strokeWidth=".9"/>
     {Array.from({length:32},(_,i)=><path key={i} d="M48 5V9" stroke="#85521e" strokeWidth="1.6" transform={`rotate(${i*11.25} 48 48)`}/>)}
     <path d="M19 33A34 34 0 0 1 57 15" fill="none" stroke="#fff7c7" strokeWidth="2" opacity=".7"/>
    </g>
    <g id={id+'-front'}>
     <use href={'#'+id+'-blank'}/>
     <g fill="none" stroke="#9b6a25" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="48" cy="31" r="5"/><path d="M48 36V67 M38 43H58 M30 51Q30 66 48 67Q66 66 66 51 M30 51L26 57 M66 51L70 57"/>
     </g>
     <path d="M47 37V64 M31 52Q32 63 43 65" fill="none" stroke="#ffe69a" strokeWidth="1.1"/>
     <text x="48" y="80" textAnchor="middle" fontFamily="Georgia,serif" fontSize="7" letterSpacing="2" fill="#85571d">VOYAGE</text>
    </g>
    <g id={id+'-back'}>
     <use href={'#'+id+'-blank'}/>
     <circle cx="48" cy="48" r="23" fill="none" stroke="#a06e27" strokeWidth="1.5"/>
     <path d="M48 21L53 42L75 48L53 54L48 75L42 54L21 48L42 42Z" fill="#a6752b" stroke="#fce49a" strokeWidth="1"/>
     <path d="M48 25V71 M25 48H71" stroke="#e6c16a" strokeWidth="1"/>
     <circle cx="48" cy="48" r="4" fill="#eac56d" stroke="#916022"/>
    </g>
   </defs>
  </svg>
  <div className="pirate-treasure-ground"/>
  {coins.map((coin,index)=><div key={index} className="pirate-floor-coin" data-state="resting" data-angle={coin.angle}
   style={{'--coin-x':coin.x+'%','--coin-mobile-x':(8+(coin.x-34)*1.65)+'%','--coin-y':coin.y+'px','--coin-size':coin.size+'px','--coin-angle':coin.angle+'deg'} as CSSProperties}>
   <i className="pirate-coin-shadow"/>
   <div className="pirate-coin-hop"><div className="pirate-coin-body">
    {[0,1,2].map(edge=><i key={edge} className="pirate-coin-edge" style={{transform:`translateZ(${edge-1}px)`}}/>)}
    <svg className="pirate-coin-face pirate-coin-obverse" viewBox="0 0 96 96" focusable="false"><use href={'#'+id+'-front'}/></svg>
    <svg className="pirate-coin-face pirate-coin-reverse" viewBox="0 0 96 96" focusable="false"><use href={'#'+id+'-back'}/></svg>
   </div></div>
  </div>)}
 </div>;
}
