'use client';

import {useEffect,useRef,useState} from 'react';
import {Play} from 'lucide-react';
import {voyageAudio} from '@/lib/voyage-audio';

type Player={playVideo:()=>void;destroy:()=>void};
type Events={onReady:(event:{target:Player})=>void;onStateChange:(event:{data:number})=>void;onError:()=>void;onAutoplayBlocked:()=>void};
type YouTubeAPI={Player:new(element:HTMLIFrameElement,options:{events:Events})=>Player};
type YouTubeWindow=Window&{YT?:YouTubeAPI;onYouTubeIframeAPIReady?:()=>void};
let apiReady:Promise<YouTubeAPI>|undefined;
function loadAPI(){
 const scope=window as YouTubeWindow;
 if(scope.YT?.Player)return Promise.resolve(scope.YT);
 return apiReady??=new Promise<YouTubeAPI>((resolve,reject)=>{
  const previous=scope.onYouTubeIframeAPIReady,script=document.createElement('script');
  const fail=()=>{clearTimeout(timer);script.remove();scope.onYouTubeIframeAPIReady=previous;apiReady=undefined;reject(new Error('YouTube player could not load'));};
  const timer=window.setTimeout(fail,15000);
  scope.onYouTubeIframeAPIReady=()=>{
   clearTimeout(timer);scope.onYouTubeIframeAPIReady=previous;previous?.();
   if(scope.YT?.Player)resolve(scope.YT);else fail();
  };
  script.src='https://www.youtube.com/iframe_api';script.async=true;script.onerror=fail;document.head.appendChild(script);
 });
}

/** The official player and its requests are deferred until the visitor chooses Play. */
export function YouTubeVideo({videoId,title,poster}:{videoId:string;title:string;poster?:string}){
 const host=useRef<HTMLDivElement>(null);
 const [activated,setActivated]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const watch='https://www.youtube.com/watch?v='+encodeURIComponent(videoId);
 useEffect(()=>{
  if(!activated||failed||!host.current)return;
  const container=host.current;let disposed=false,player:Player|undefined,ownsSound=false;
  const release=()=>{if(ownsSound){ownsSound=false;voyageAudio.setMediaPlaying(false);}};
  const fail=()=>{if(disposed)return;release();setFailed(true);};
  void loadAPI().then(api=>{
   if(disposed)return;
   const frame=document.createElement('iframe');
   const parameters=new URLSearchParams({enablejsapi:'1',origin:location.origin,playsinline:'1',rel:'0',controls:'1'});
   frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(videoId)+'?'+parameters;
   frame.title=title;frame.width='100%';frame.height='100%';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
   frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';container.replaceChildren(frame);
   player=new api.Player(frame,{events:{
    onReady:event=>{if(disposed)return;setReady(true);event.target.playVideo();},
    onStateChange:event=>{
     if(disposed)return;
     if(event.data===1||event.data===3){if(!ownsSound){ownsSound=true;voyageAudio.setMediaPlaying(true);}}
     else release();
    },
    onError:fail,onAutoplayBlocked:release,
   }});
  }).catch(fail);
  return()=>{disposed=true;player?.destroy();release();};
 },[activated,failed,videoId,title]);
 return <figure className="project-video project-youtube" data-testid="youtube-video">
  <div className="youtube-stage" aria-busy={activated&&!ready&&!failed}>
   {!activated?<button type="button" className="youtube-preview" aria-label={'Play '+title} onClick={()=>setActivated(true)}>
    {poster&&<img src={poster} alt="" width="1280" height="720" decoding="async"/>}
    <span className="youtube-play" aria-hidden="true"><Play size={27} fill="currentColor" strokeWidth={1.2}/></span>
    <span className="youtube-play-label">Play full video</span>
   </button>:failed?<div key="youtube-unavailable" className="youtube-unavailable" role="status"><p>Watch the full video on YouTube.</p><a href={watch} target="_blank" rel="noopener noreferrer">Open video on YouTube ?</a></div>:<>
    <div key="youtube-player" ref={host} className="youtube-player"/>
    {!ready&&<span className="youtube-loading" role="status">Loading video?</span>}
   </>}
  </div>
  <figcaption className="project-video-context"><span>Full video</span><a href={watch} target="_blank" rel="noopener noreferrer">Open on YouTube ?</a></figcaption>
 </figure>;
}
