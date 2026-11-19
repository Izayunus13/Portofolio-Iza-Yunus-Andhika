'use client';

import { useEffect, useRef } from 'react';
import { Anchor, Sailboat } from 'lucide-react';
import { voyageAudio } from '@/lib/voyage-audio';
import { VoyageBirds } from './voyage-birds';

let clouds:Promise<boolean>|undefined;
function prepareClouds(){return clouds??=Promise.all([
  matchMedia('(max-width: 700px)').matches?'/textures/loading-cloud-soft-640.webp':'/textures/loading-cloud-soft-1024.webp',
  '/textures/intro-seagull-atlas.webp'
].map(src=>{const image=new Image();image.src=src;return image.decode().then(()=>true,()=>false);})).then(results=>results[0]);}

export function CloudLoadingScreen({ready,onComplete,onReveal}:{ready:boolean;onComplete:()=>void;onReveal?:()=>void}){
  const root=useRef<HTMLDivElement>(null),started=useRef(0),complete=useRef(onComplete),reveal=useRef(onReveal);complete.current=onComplete;reveal.current=onReveal;
  useEffect(()=>{started.current=performance.now();let cancelled=false;void prepareClouds().then(loaded=>{if(!cancelled&&root.current)root.current.dataset.cloudsReady=String(loaded);});return()=>{cancelled=true;};},[]);
  useEffect(()=>{
    if(!ready)return;let cancelled=false,timer:number|undefined;const animations:Animation[]=[];
    const leave=()=>{
      const screen=root.current;if(cancelled||!screen)return;
      screen.dataset.phase='opening';reveal.current?.();
      voyageAudio.cloudOpening(matchMedia('(prefers-reduced-motion: reduce)').matches?.45:2.4);
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const animate=(element:Element,frames:Keyframe[],options:KeyframeAnimationOptions)=>{const animation=element.animate(frames,{fill:'both',...options});animations.push(animation);return animation;};
      if(reduced){animate(screen,[{opacity:1},{opacity:0}],{duration:160,easing:'ease-out'});}
      else{
        const duration=2400,options={duration,easing:'cubic-bezier(.45,0,.55,1)'};
        const bankWidth=screen.querySelector<HTMLElement>('.cloud-gate-left')!.clientWidth;
        const distance=screen.clientWidth/2+bankWidth*.12+56;
        for(const side of ['left','right']){
          const direction=side==='left'?-1:1,gate=screen.querySelector('.cloud-gate-'+side)!;
          const initial=getComputedStyle(gate).transform;
          const rise=screen.clientHeight*(side==='left'?-.026:.019),turn=direction*.85;
          animate(gate,[
            {transform:initial,opacity:1,offset:0},
            {transform:'translate3d('+direction*distance*.52+'px,'+rise*.45+'px,0) rotate('+turn*.4+'deg) scale(1.025)',opacity:1,offset:.52},
            {transform:'translate3d('+direction*distance+'px,'+rise+'px,0) rotate('+turn+'deg) scale(1.065)',opacity:0,offset:1}
          ],options);
          const mistDistance=direction*distance*(side==='left'?.74:.79),mistRise=screen.clientHeight*(side==='left'?-.035:.022);
          animate(screen.querySelector('.cloud-mist-'+side)!,[
            {transform:'translate3d(0,0,0) scale(1)',opacity:0,offset:0},
            {transform:'translate3d('+mistDistance*.12+'px,'+mistRise*.15+'px,0) scale(1.025)',opacity:.55,offset:.22},
            {transform:'translate3d('+mistDistance*.5+'px,'+mistRise*.55+'px,0) scale(1.085)',opacity:.52,offset:.58},
            {transform:'translate3d('+mistDistance+'px,'+mistRise+'px,0) scale(1.14)',opacity:0,offset:1}
          ],{duration,easing:'ease-in-out'});
        }
        animate(screen.querySelector('.cloud-loading-veil')!,[{opacity:1,offset:0},{opacity:.94,offset:.12},{opacity:.3,offset:.54},{opacity:.06,offset:.82},{opacity:0,offset:1}],{duration,easing:'ease-in-out'});
        animate(screen.querySelector('.cloud-white-wash')!,[{opacity:0,offset:0},{opacity:.25,offset:.2},{opacity:.17,offset:.52},{opacity:.04,offset:.8},{opacity:0,offset:1}],{duration,easing:'ease-in-out'});
        animate(screen.querySelector('.cloud-loading-copy')!,[{opacity:1,transform:'translate3d(0,0,0)'},{opacity:0,transform:'translate3d(0,-10px,0)'}],{duration:440,easing:'ease-out'});
        animate(screen.querySelector('.cloud-birds')!,[{opacity:1,offset:0},{opacity:1,offset:.58},{opacity:.55,offset:.8},{opacity:0,offset:1}],{duration,easing:'ease-in-out'});
      }
      void Promise.all(animations.map(animation=>animation.finished)).then(()=>{if(!cancelled)complete.current();}).catch(()=>{});
    };
    void prepareClouds().then(()=>{
      if(cancelled)return;const minimum=matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100;
      timer=window.setTimeout(leave,Math.max(0,minimum-(performance.now()-started.current)));
    });
    return()=>{cancelled=true;if(timer!==undefined)clearTimeout(timer);animations.forEach(animation=>animation.cancel());};
  },[ready]);
  return <div ref={root} className="cloud-loading" data-testid="cloud-loading" data-phase="loading" role="status" aria-live="polite" aria-label="Charting the creative seas. Preparing your voyage.">
    <div className="cloud-loading-veil" aria-hidden="true"/>
    <div className="cloud-white-wash" aria-hidden="true"/>
    <div className="cloud-mist cloud-mist-left" aria-hidden="true"/>
    <div className="cloud-mist cloud-mist-right" aria-hidden="true"/>
    {['left','right'].map(side=><div key={side} className={'cloud-gate cloud-gate-'+side} aria-hidden="true"><div className="cloud-soft-volume"/>{[0,1,2].map(index=><div key={index} className={'cloud-volume cloud-volume-'+index}><picture><source media="(max-width: 700px)" srcSet="/textures/loading-cloud-soft-640.webp"/><img className={'cloud-layer cloud-layer-'+index} src="/textures/loading-cloud-soft-1024.webp" width="1024" height="683" alt="" decoding="async" fetchPriority={index===0?'high':'auto'} draggable={false}/></picture></div>)}</div>)}
    <VoyageBirds/>
    <div className="cloud-loading-copy">
      <div className="sky-compass" aria-hidden="true"><span className="sky-compass-ring"/><span className="sky-compass-face"><Anchor size={30} strokeWidth={1.4}/></span><i/><b/></div>
      <p className="sky-loading-kicker">THE CREATIVE VOYAGE</p>
      <h2>Beyond the clouds,<br/><em>a sea of possibilities.</em></h2>
      <p className="sky-loading-caption">Your adventure is taking shape.</p>
      <div className="sky-loading-route" aria-hidden="true"><span/><Sailboat size={21} strokeWidth={1.3}/><i/><i/><i/></div>
      <span className="sky-loading-status">CHARTING THE CREATIVE SEAS</span>
    </div>
  </div>;
}
