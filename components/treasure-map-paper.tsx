'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { voyageAudio } from '@/lib/voyage-audio';

let paperAssets:Promise<void>|undefined;
function preparePaper(){
  return paperAssets??=Promise.all(['/textures/pirate-parchment.webp','/textures/parchment-torn-edge.png'].map(async src=>{
    const image=new Image();image.src=src;await image.decode();
  })).then(()=>{}).catch(()=>{});
}

/** Static paper layers are revealed with compositor transforms, without resizing the sheet. */
export type TreasureMapPaperController={close:()=>Promise<void>};
export function TreasureMapPaper({controllerRef,openingDuration=2050}:{controllerRef?:RefObject<TreasureMapPaperController|null>;openingDuration?:number}={}){
  const decorationRef=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    const decoration=decorationRef.current,dialog=decoration?.closest('dialog');
    const sheet=dialog?.querySelector<HTMLElement>('.scroll-sheet'),content=dialog?.querySelector<HTMLElement>('.treasure-content');
    if(!decoration||!dialog||!sheet||!content)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let animations:Animation[]=[],generation=0,lastWidth=0,lastHeight=0;
    function stop(){generation++;animations.forEach(animation=>animation.cancel());animations=[];}
    function finish(){stop();dialog!.dataset.scrollPhase=dialog!.open?'open':'closed';}
    async function openPaper(closing=false){
      stop();const run=generation;
      voyageAudio.paper(closing?.62:openingDuration/1000,closing);
      if(reduced.matches){finish();if(closing)dialog!.close();return;}
      if(!closing)dialog!.dataset.scrollPhase='preparing';
      await preparePaper();
      if(run!==generation||!dialog!.open)return;
      const width=dialog!.clientWidth,height=dialog!.clientHeight,half=width/2;
      if(!width||!height){finish();return;}
      lastWidth=width;lastHeight=height;
      decoration!.style.setProperty('--paper-width',width+'px');
      decoration!.style.setProperty('--paper-half',half+'px');
      const leftRoll=decoration!.querySelector<HTMLElement>('.scroll-roll-left')!;
      const rightRoll=decoration!.querySelector<HTMLElement>('.scroll-roll-right')!;
      const diameter=parseFloat(getComputedStyle(leftRoll).width);
      const frames=Array.from({length:161},(_,index)=>{
        const t=index/160,ease=t*t*t*(t*(t*6-15)+10),p=closing?1-ease:ease,radius=Math.sqrt(.04+.96*(1-p));
        const inset=(1-p)*half,curl=(1-p)*diameter*radius/2;
        return {offset:t,p,radius,inset,left:inset-curl-diameter/2,right:width-inset+curl-diameter/2};
      });
      const duration=closing?620:openingDuration;
      function animate(element:Element,keyframes:Keyframe[],options:KeyframeAnimationOptions={}){
        const animation=element.animate(keyframes,{duration,easing:'linear',fill:'both',...options});
        animation.pause();animation.currentTime=0;animations.push(animation);return animation;
      }
      function translate(selector:string,position:(frame:typeof frames[number])=>number){
        return animate(decoration!.querySelector(selector)!,frames.map(frame=>({offset:frame.offset,transform:'translate3d('+position(frame).toFixed(4)+'px,0,0)'})));
      }
      translate('.scroll-paper-half-left .scroll-paper-reveal',frame=>frame.inset);
      translate('.scroll-paper-half-left .scroll-paper-surface',frame=>-frame.inset);
      translate('.scroll-paper-half-right .scroll-paper-reveal',frame=>-frame.inset);
      translate('.scroll-paper-half-right .scroll-paper-surface',frame=>frame.inset);
      const completed=translate('.scroll-roll-left',frame=>frame.left);
      translate('.scroll-roll-right',frame=>frame.right);
      for(const roll of [leftRoll,rightRoll]){
        animate(roll.querySelector('.scroll-roll-surface')!,frames.map(frame=>({offset:frame.offset,transform:'scaleX('+frame.radius.toFixed(6)+')'})));
        for(const cap of roll.querySelectorAll('.scroll-roll-cap'))animate(cap,frames.map(frame=>({offset:frame.offset,transform:'scale('+frame.radius.toFixed(6)+')'})));
        animate(roll,frames.map(frame=>({offset:frame.offset,opacity:Math.min(1,(1-frame.p)*8)})));
      }
      animate(decoration!.querySelector('.scroll-ground-shadow')!,frames.map(frame=>({offset:frame.offset,transform:'scaleX('+Math.max(.025,frame.p).toFixed(6)+')',opacity:frame.p*.6})));
      if(closing)animate(dialog!,[{opacity:1,transform:'translate3d(0,0,0)'},{opacity:0,transform:'translate3d(0,16px,0)'}],{duration:260,delay:360,easing:'ease-in'});
      else animate(dialog!,[{opacity:0,transform:'translate3d(0,10px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
      dialog!.dataset.scrollPhase=closing?'closing':'opening';
      const start=document.timeline.currentTime;
      animations.forEach(animation=>{animation.play();animation.startTime=start;});
      try{await completed.finished;}catch{return;}
      if(run!==generation||!dialog!.open)return;
      animations.forEach(animation=>animation.cancel());animations=[];
      if(closing){dialog!.close();finish();return;}
      dialog!.dataset.scrollPhase='revealing';
      const reveal=animate(content!,[{opacity:0,transform:'translate3d(0,5px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:420,delay:100,easing:'cubic-bezier(.22,.8,.25,1)'});
      reveal.play();
      try{await reveal.finished;}catch{return;}
      if(run===generation&&dialog!.open)finish();
    }
    if(controllerRef)controllerRef.current={close:()=>openPaper(true)};
    void preparePaper();
    let wasOpen=dialog.open;
    const openObserver=new MutationObserver(()=>{
      if(dialog.open===wasOpen)return;wasOpen=dialog.open;
      if(wasOpen)void openPaper();else finish();
    });
    openObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
    const sizeObserver=new ResizeObserver(()=>{
      const width=dialog.clientWidth,height=dialog.clientHeight;
      if(lastWidth&&lastHeight&&(Math.abs(width-lastWidth)>.5||Math.abs(height-lastHeight)>.5)&&['opening','revealing'].includes(dialog.dataset.scrollPhase??''))finish();
      lastWidth=width;lastHeight=height;
    });
    sizeObserver.observe(dialog);
    const motionChange=()=>{if(reduced.matches){const closing=dialog.dataset.scrollPhase==='closing';finish();if(closing)dialog.close();}};reduced.addEventListener('change',motionChange);
    if(wasOpen)void openPaper();else dialog.dataset.scrollPhase='closed';
    return()=>{stop();if(controllerRef)controllerRef.current=null;openObserver.disconnect();sizeObserver.disconnect();reduced.removeEventListener('change',motionChange);};
  },[controllerRef,openingDuration]);

  return <div ref={decorationRef} className="scroll-decoration" aria-hidden="true">
    <div className="scroll-ground-shadow"/>
    <div className="scroll-opening-visuals">
      <div className="scroll-paper-half scroll-paper-half-left"><div className="scroll-paper-reveal"><div className="scroll-paper-surface"/></div></div>
      <div className="scroll-paper-half scroll-paper-half-right"><div className="scroll-paper-reveal"><div className="scroll-paper-surface"/></div></div>
      <div className="scroll-roll scroll-roll-left"><span className="scroll-roll-surface"/><span className="scroll-roll-cap scroll-roll-cap-top"/><span className="scroll-roll-cap scroll-roll-cap-bottom"/></div>
      <div className="scroll-roll scroll-roll-right"><span className="scroll-roll-surface"/><span className="scroll-roll-cap scroll-roll-cap-top"/><span className="scroll-roll-cap scroll-roll-cap-bottom"/></div>
    </div>
  </div>;
}
