'use client';

import {useEffect,useRef,useState} from 'react';
import {Anchor,ShipWheel} from 'lucide-react';
import type {GateEnvironment} from '../lib/pirate-gate';

type Phase='idle'|'welcoming'|'revealing'|'about'|'departing';
export function PirateGate({phase,onReady,onCover}:{phase:Phase;onReady:()=>void;onCover:()=>void}){
 const host=useRef<HTMLDivElement>(null),environment=useRef<GateEnvironment|null>(null),currentPhase=useRef(phase),ready=useRef(onReady),cover=useRef(onCover);
 currentPhase.current=phase;ready.current=onReady;cover.current=onCover;
 const [renderer,setRenderer]=useState<'pending'|'webgl'|'fallback'>('pending');
 useEffect(()=>{
  let cancelled=false,instance:GateEnvironment|null=null;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=()=>instance?.setReduced(media.matches);media.addEventListener('change',motion);
  void import('../lib/pirate-gate').then(({createPirateGate})=>{
   if(cancelled||!host.current)return;
   try{instance=createPirateGate(host.current,media.matches,()=>cover.current());environment.current=instance;instance?.setPhase(currentPhase.current);}catch{instance?.dispose();environment.current=null;instance=null;}
   if(!cancelled){setRenderer(instance?'webgl':'fallback');ready.current();}
  }).catch(()=>{if(!cancelled){setRenderer('fallback');ready.current();}});
  return()=>{cancelled=true;media.removeEventListener('change',motion);instance?.dispose();environment.current=null;};
 },[]);
 useEffect(()=>{environment.current?.setPhase(phase);},[phase]);
 useEffect(()=>{if(phase!=='revealing'||renderer!=='fallback')return;const timer=setTimeout(()=>cover.current(),1700);return()=>clearTimeout(timer);},[phase,renderer]);
 return <div className="pirate-gate" data-testid="pirate-gate" data-renderer={renderer} aria-hidden="true">
  {renderer==='fallback'&&<div className="gate-fallback">
   <div className="gate-fallback-leaf gate-fallback-left"><span className="gate-door-title">CAPTAIN’S</span><span className="gate-porthole"/><Anchor className="gate-door-emblem" strokeWidth={1.2}/><i className="gate-door-handle"/></div>
   <div className="gate-fallback-leaf gate-fallback-right"><span className="gate-door-title">QUARTERS</span><span className="gate-porthole"/><ShipWheel className="gate-door-emblem" strokeWidth={1.2}/><i className="gate-door-handle"/></div>
  </div>}
  <div ref={host} hidden={renderer==='fallback'} className="gate-canvas" data-testid="gate-environment"/>
  <div className="gate-entry-threshold" data-testid="entry-threshold"><i/><i/></div>
 </div>;
}
