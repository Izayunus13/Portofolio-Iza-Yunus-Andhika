'use client';
import { useEffect, useRef, useState } from 'react';
import { voyageDestinations } from '@/lib/destinations';
import type { MiniatureHarbour } from '@/lib/miniature-harbour';

type Props={current:number;destination:number;traveling:boolean;ready:boolean;prepare?:boolean;onPrepared?:()=>void;onNavigate:(index:number)=>void};
export function IslandNavigation({current,destination,traveling,ready,prepare=true,onPrepared,onNavigate}:Props){
  const host=useRef<HTMLDivElement>(null),harbour=useRef<MiniatureHarbour|null>(null),latest=useRef({current,hover:-1});
  const prepared=useRef(onPrepared);prepared.current=onPrepared;
  const [hover,setHover]=useState(-1),[rendered,setRendered]=useState(false);latest.current={current,hover};
  useEffect(()=>{
    if(!prepare)return;
    let cancelled=false;
    import('@/lib/miniature-harbour').then(async({createMiniatureHarbour})=>{
      if(cancelled||!host.current)return;
      try{const engine=await createMiniatureHarbour(host.current,()=>{if(!cancelled){setRendered(true);prepared.current?.();}});if(cancelled){engine.dispose();return;}harbour.current=engine;engine.highlight(latest.current.current,latest.current.hover);}
      catch{if(!cancelled){setRendered(false);prepared.current?.();}}
    }).catch(()=>{if(!cancelled){setRendered(false);prepared.current?.();}});
    return()=>{cancelled=true;harbour.current?.dispose();harbour.current=null;};
  },[prepare]);
  useEffect(()=>{harbour.current?.highlight(current,hover);},[current,hover]);
  return <nav className={`island-archipelago ${rendered?'has-miniatures':''}`} aria-label="Voyage destinations">
    <div className="archipelago-miniatures" ref={host} aria-hidden="true" data-testid="miniature-islands"/>
    <svg className="archipelago-route" viewBox="0 0 800 100" preserveAspectRatio="none" aria-hidden="true"><path d="M85 62C180 100 195 18 297 54S440 94 501 57 655 18 713 64"/></svg>
    {voyageDestinations.map((port,i)=><button key={port.name} className={`archipelago-stop ${current===i?'selected':''} ${current>i?'visited':''} ${traveling&&destination===i?'incoming':''}`} aria-label={`Visit ${port.name}`} aria-current={current===i?'step':undefined} title={`${port.discipline} · ${port.meaning}`} disabled={traveling||!ready} onClick={()=>onNavigate(i)} onPointerEnter={()=>setHover(i)} onPointerLeave={()=>setHover(-1)} onFocus={()=>setHover(i)} onBlur={()=>setHover(-1)}><span className="mini-island-slot" aria-hidden="true"><i/><b/></span><span className="island-nav-label"><small>{port.discipline.split(' & ').map(part=>part.charAt(0)+part.slice(1).toLowerCase()).join(' & ')}</small><strong>{port.name}</strong><span className="island-current-dot"/></span></button>)}
  </nav>;
}
