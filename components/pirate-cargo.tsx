'use client';

import {useEffect,useRef,useState,type CSSProperties} from 'react';
import type {CargoEnvironment} from '../lib/pirate-cargo';

type Phase='idle'|'revealing'|'about'|'departing';
const gear=['barrel','anchor','chest','provisions','crate'];
export function PirateCargo({phase,onReady,onCover}:{phase:Phase;onReady:()=>void;onCover:()=>void}){
 const host=useRef<HTMLDivElement>(null),environment=useRef<CargoEnvironment|null>(null),currentPhase=useRef(phase),ready=useRef(onReady),cover=useRef(onCover);
 currentPhase.current=phase;ready.current=onReady;cover.current=onCover;
 const [renderer,setRenderer]=useState<'pending'|'webgl'|'fallback'>('pending');
 useEffect(()=>{
  let cancelled=false,instance:CargoEnvironment|null=null;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=()=>instance?.setReduced(media.matches);media.addEventListener('change',motion);
  void import('../lib/pirate-cargo').then(({createPirateCargo})=>{
   if(cancelled||!host.current)return;
   try{instance=createPirateCargo(host.current,media.matches,()=>cover.current());environment.current=instance;instance?.setPhase(currentPhase.current);}catch{instance=null;}
   if(!cancelled){setRenderer(instance?'webgl':'fallback');ready.current();}
  }).catch(()=>{if(!cancelled){setRenderer('fallback');ready.current();}});
  return()=>{cancelled=true;media.removeEventListener('change',motion);instance?.dispose();environment.current=null;};
 },[]);
 useEffect(()=>{environment.current?.setPhase(phase);},[phase]);
 useEffect(()=>{if(phase!=='revealing'||renderer!=='fallback')return;const timer=setTimeout(()=>cover.current(),4000);return()=>clearTimeout(timer);},[phase,renderer]);
 return <div className="pirate-cargo" data-testid="pirate-cargo" data-renderer={renderer} aria-hidden="true">
  <div className="cargo-fallback">
   <div className="cargo-fallback-base">{gear.map((name,i)=><i key={name} className={`cargo-fallback-${name}`} style={{'--gear-order':i} as CSSProperties}/>)}</div>
   <div className="cargo-fallback-stack">{Array.from({length:48},(_,i)=><i key={i} style={{'--rise-delay':`${(.12+(7-Math.floor(i/6))*.32+(i%6)*.035).toFixed(3)}s`,'--fall-delay':`${(4.35+((i*17)%48)/48*.72).toFixed(3)}s`} as CSSProperties}/>)}</div>
  </div>
  <div ref={host} className="cargo-canvas" data-testid="cargo-environment"/>
 </div>;
}
