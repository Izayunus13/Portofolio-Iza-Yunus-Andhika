'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { voyageAudio } from '@/lib/voyage-audio';

export function SoundToggle({compact=false,className=''}:{compact?:boolean;className?:string}){
  const sound=useSyncExternalStore(voyageAudio.subscribe,voyageAudio.getSnapshot,voyageAudio.getServerSnapshot);
  const active=sound.enabled;
  return <button type="button" data-sound-toggle className={'sound-toggle '+(compact?'sound-toggle-compact ':'')+className} aria-label={active?'Turn sound off':'Turn sound on'} aria-pressed={active} disabled={!sound.available||!sound.initialized} title={!sound.available?'Audio is unavailable on this browser':active&&!sound.unlocked?'Sound is on; playback starts with your first interaction':active?'Mute music and sound effects':'Enable music and sound effects'} onClick={()=>voyageAudio.toggle()}>
    {active?<Volume2 size={23} strokeWidth={1.6} aria-hidden="true"/>:<VolumeX size={23} strokeWidth={1.6} aria-hidden="true"/>}
  </button>;
}

export function VoyageSound(){
  const music=useRef<HTMLAudioElement>(null);
  const sound=useSyncExternalStore(voyageAudio.subscribe,voyageAudio.getSnapshot,voyageAudio.getServerSnapshot);
  useEffect(()=>{
    if(!music.current)return;
    const detach=voyageAudio.attach(music.current);
    const isToggle=(target:EventTarget|null)=>target instanceof Element&&!!target.closest('[data-sound-toggle]');
    const pointer=(event:PointerEvent)=>{if(event.isTrusted&&event.button===0&&!isToggle(event.target))voyageAudio.activate();};
    const key=(event:KeyboardEvent)=>{
      if(!event.isTrusted||event.ctrlKey||event.metaKey||event.altKey||isToggle(event.target))return;
      voyageAudio.activate();
      if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)&&event.target instanceof Element&&event.target.closest('button,[role="tab"]'))voyageAudio.click();
    };
    const click=(event:MouseEvent)=>{if(event.isTrusted&&!isToggle(event.target))voyageAudio.click();};
    const visibility=()=>voyageAudio.visibility(document.hidden);
    // Parchment components synchronize their rustle with unrolling. Other paper dialogs use this fallback.
    const dialogs=new MutationObserver(records=>{
      for(const record of records){
        const dialog=record.target;
        if(record.type==='attributes'&&dialog instanceof HTMLDialogElement&&dialog.open&&!dialog.classList.contains('treasure-dialog'))voyageAudio.paper(.7);
      }
    });
    dialogs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    document.addEventListener('pointerdown',pointer,true);document.addEventListener('keydown',key,true);document.addEventListener('click',click,true);document.addEventListener('visibilitychange',visibility);
    return()=>{dialogs.disconnect();document.removeEventListener('pointerdown',pointer,true);document.removeEventListener('keydown',key,true);document.removeEventListener('click',click,true);document.removeEventListener('visibilitychange',visibility);detach();};
  },[]);
  return <>
    <audio ref={music} src="/audio/ocean-birds.mp3" loop preload="none" data-testid="voyage-music" hidden/>
    <div className="voyage-sound-dock" data-audio-ready={sound.initialized} data-audio-enabled={sound.enabled} data-audio-unlocked={sound.unlocked} data-music-playing={sound.musicPlaying} data-water-playing={sound.waterPlaying}>
      <SoundToggle/>
    </div>
  </>;
}

/** Page state controls effects without remounting the shared soundtrack. */
export function VoyageSoundState({sailing,paused}:{sailing:boolean;paused:boolean}){
  useEffect(()=>{voyageAudio.setSailing(sailing&&!paused);return()=>voyageAudio.setSailing(false);},[sailing,paused]);
  return null;
}
