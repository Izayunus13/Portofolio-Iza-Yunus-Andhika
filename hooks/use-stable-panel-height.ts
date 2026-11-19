'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/** Retain the tallest page of a portfolio so shorter pages cannot clamp the paper's scroll position. */
export function useStablePanelHeight(ref:RefObject<HTMLDivElement|null>,enabled:boolean,contentKey:string,page:number){
  const measured=useRef<{key:string;width:number;height:number}|null>(null);
  useLayoutEffect(()=>{
    const panel=ref.current;
    if(!panel)return;
    if(!enabled){panel.style.removeProperty('min-height');measured.current=null;return;}
    if(measured.current?.key!==contentKey){panel.style.removeProperty('min-height');measured.current=null;}
    const content=panel.firstElementChild as HTMLElement|null;
    if(!content)return;
    const measure=()=>{
      const width=panel.clientWidth,height=content.offsetHeight;
      if(!width||!height)return;
      const previous=measured.current;
      const stable=previous?.key===contentKey&&Math.abs(previous.width-width)<1;
      const nextHeight=stable?Math.max(previous.height,height):height;
      measured.current={key:contentKey,width,height:nextHeight};
      const value=nextHeight+'px';
      if(panel.style.minHeight!==value)panel.style.minHeight=value;
    };
    measure();
    const observer=new ResizeObserver(measure);observer.observe(panel);observer.observe(content);
    return()=>observer.disconnect();
  },[ref,enabled,contentKey,page]);
}
