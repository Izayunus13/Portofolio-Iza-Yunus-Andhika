'use client';

import {useEffect,useRef,useState} from 'react';
import type {PirateEnvironment} from '../lib/prologue-pirate';

type Props={scene:'harbor'|'cabin';active?:boolean;animated?:boolean;suspended?:boolean;onReady?:()=>void};

/** The harbor starts on its real first frame and switches straight to the live ocean. */
export function ProloguePirateScene({scene,active=true,animated=true,suspended=false,onReady}:Props){
 const host=useRef<HTMLDivElement>(null),environment=useRef<PirateEnvironment|null>(null);
 const ready=useRef(onReady),motion=useRef(animated),paused=useRef(suspended);ready.current=onReady;motion.current=animated;paused.current=suspended;
 const [renderer,setRenderer]=useState<'pending'|'webgl'|'fallback'>('pending');
 useEffect(()=>{
  if(!active)return;
  let cancelled=false,instance:PirateEnvironment|null=null;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const updateMotion=()=>instance?.setReduced(media.matches||!motion.current);
  media.addEventListener('change',updateMotion);
  void import('../lib/prologue-pirate').then(({createPirateEnvironment})=>{
   if(cancelled||!host.current)return;
   try{instance=createPirateEnvironment(host.current,scene,media.matches||!motion.current);environment.current=instance;instance?.setSuspended(paused.current);}
   catch{instance=null;}
   if(!cancelled){setRenderer(instance?'webgl':'fallback');ready.current?.();}
  }).catch(()=>{if(!cancelled){setRenderer('fallback');ready.current?.();}});
  return()=>{cancelled=true;media.removeEventListener('change',updateMotion);instance?.dispose();environment.current=null;};
 },[active,scene]);
 useEffect(()=>{environment.current?.setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches||!animated);},[animated]);
 useEffect(()=>{environment.current?.setSuspended(suspended);},[suspended]);
 return <div className={`pirate-backdrop pirate-backdrop-${scene}`} data-testid={`pirate-${scene}`} data-renderer={renderer} aria-hidden="true">
  {scene==='harbor'?<picture className="pirate-harbor-poster">
   <source media="(max-width:700px)" srcSet="/images/prologue/harbor-opening-phone.jpg"/>
   <img src="/images/prologue/harbor-opening-desktop.jpg" alt="" width="1440" height="1000" fetchPriority="high" decoding="async" draggable={false}/>
  </picture>:<div className="pirate-scene-fallback">
   <div className="pirate-fallback-windows">{[0,1,2].map(i=><span key={i}/>)}</div>
   <div className="pirate-fallback-beam"/><div className="pirate-fallback-floor"/>
  </div>}
  <div ref={host} className="pirate-environment" data-testid={`pirate-environment-${scene}`}/>
  {scene==='harbor'&&<div className="pirate-sea-mist"/>}
 </div>;
}
