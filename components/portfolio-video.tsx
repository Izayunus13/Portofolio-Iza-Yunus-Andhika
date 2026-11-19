'use client';

import {useEffect,useRef} from 'react';
import {voyageAudio} from '@/lib/voyage-audio';

function timestamp(seconds:number){
  return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
}

export function PortfolioVideo({src,poster,title,excerpt,dimensions={width:1280,height:720}}:{src:string;poster?:string;title:string;excerpt?:{start:number;end:number};dimensions?:{width:number;height:number}}){
  const video=useRef<HTMLVideoElement>(null);
  const ownsPlayback=useRef(false);
  const releaseSound=()=>{
    if(!ownsPlayback.current)return;
    ownsPlayback.current=false;
    voyageAudio.setMediaPlaying(false);
  };
  useEffect(()=>{
    const element=video.current;
    return()=>{
      element?.pause();
      if(ownsPlayback.current){
        ownsPlayback.current=false;
        voyageAudio.setMediaPlaying(false);
      }
    };
  },[src]);
  return <figure className="project-video" data-testid="portfolio-video" data-orientation={dimensions.width<dimensions.height?'portrait':'landscape'}>
    <video ref={video} src={src} poster={poster} controls playsInline preload="metadata" width={dimensions.width} height={dimensions.height} style={{aspectRatio:dimensions.width/dimensions.height}} aria-label={title}
      onPlay={()=>{ownsPlayback.current=true;voyageAudio.setMediaPlaying(true);}}
      onPause={releaseSound} onEnded={releaseSound} onError={releaseSound}>
      Your browser can open <a href={src}>this film excerpt</a> directly.
    </video>
    {excerpt&&<figcaption className="project-video-context">
      <span>{timestamp(excerpt.end-excerpt.start)} excerpt</span>
      <span>Source {timestamp(excerpt.start)} - {timestamp(excerpt.end)}</span>
    </figcaption>}
  </figure>;
}
