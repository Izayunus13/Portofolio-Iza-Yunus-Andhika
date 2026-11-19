'use client';
import { useEffect, useRef, useState } from 'react';
import type { VoyageCallbacks, VoyageEngine } from '@/lib/voyage-engine';

type Props = VoyageCallbacks & { destination: number; suspended?: boolean };
export function VoyageScene(props:Props){
  const hostRef=useRef<HTMLDivElement>(null),engineRef=useRef<VoyageEngine|null>(null),latest=useRef(props);
  const [failed,setFailed]=useState(false);latest.current=props;
  useEffect(()=>{
    let cancelled=false;
    import('@/lib/voyage-engine').then(async({createVoyageEngine})=>{
      if(cancelled||!hostRef.current)return;
      try{const engine=await createVoyageEngine(hostRef.current,{onReady:()=>{if(!cancelled)latest.current.onReady();},onArrive:i=>latest.current.onArrive(i),onDistance:km=>latest.current.onDistance(km),onShipPosition:(x,y)=>latest.current.onShipPosition?.(x,y),onShip:()=>latest.current.onShip(),onPort:i=>latest.current.onPort(i),onCertificate:(port,index)=>latest.current.onCertificate?.(port,index),onError:()=>{if(!cancelled){setFailed(true);latest.current.onError();}}});if(cancelled){engine.dispose();return;}engineRef.current=engine;engine.setSuspended(!!latest.current.suspended);if(latest.current.destination)engine.moveTo(latest.current.destination);}
      catch{if(!cancelled){setFailed(true);latest.current.onError();}}
    }).catch(()=>{if(!cancelled){setFailed(true);latest.current.onError();}});
    return ()=>{cancelled=true;engineRef.current?.dispose();engineRef.current=null;};
  },[]);
  useEffect(()=>{engineRef.current?.moveTo(props.destination);},[props.destination]);
  useEffect(()=>{engineRef.current?.setSuspended(!!props.suspended);},[props.suspended]);
  return <div className="world-container" ref={hostRef} data-testid="voyage-world">{failed&&<div className="world-fallback"><span>✦</span><h2>A sea of possibilities.</h2><p>The 3D view is unavailable on this device.<br/>Your voyage continues with the destination controls below.</p></div>}</div>;
}
