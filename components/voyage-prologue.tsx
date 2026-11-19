'use client';

import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {Anchor,ArrowUpRight,Compass,MoveUpRight} from 'lucide-react';
import {PirateGate} from './pirate-gate';
import {HangingPortrait} from './hanging-portrait';
import {PirateTreasure} from './pirate-treasure';
import {VoyageBirds} from './voyage-birds';
import {ProloguePirateScene} from './prologue-pirate-scene';
import {departureDuration,prologueDuration,welcomeDuration} from '../lib/prologue-timing';

type Phase='idle'|'welcoming'|'revealing'|'about'|'departing';

export function VoyagePrologue({onEnter}:{onEnter:()=>void}){
 const [phase,setPhase]=useState<Phase>('idle'),[imagesReady,setImagesReady]=useState(false),[harborReady,setHarborReady]=useState(false),[cabinReady,setCabinReady]=useState(false),[cabinActive,setCabinActive]=useState(false),[gateReady,setGateReady]=useState(false),[cabinVisible,setCabinVisible]=useState(false);
 const assetsReady=imagesReady&&harborReady&&cabinReady&&gateReady;
 // Prepare the captain's cabin after the harbor has rendered its first frame.
 useEffect(()=>{
  if(!harborReady||!imagesReady)return;
  const timer=setTimeout(()=>setCabinActive(true),650);
  return()=>clearTimeout(timer);
 },[harborReady,imagesReady]);
 const about=useRef<HTMLElement>(null),heading=useRef<HTMLHeadingElement>(null),enter=useRef(onEnter);enter.current=onEnter;
 useEffect(()=>{
  let cancelled=false;
  const fonts=['400 21px "DM Serif Display"','italic 400 43px "DM Serif Display"','400 16px "DM Sans"','400 96px Ringbearer'].map(font=>document.fonts.load(font).catch(()=>[]));
  const images=['/images/prologue/iza-red-cutout.webp','/images/prologue/iza-almet-cutout.webp','/textures/intro-seagull-atlas.webp'].map(async src=>{
   const image=new Image();image.src=src;try{await image.decode();}catch{/* Keep the entry usable if an optional asset cannot load. */}
  });
  void Promise.all([...fonts,...images]).then(()=>{if(!cancelled)setImagesReady(true);});
  return()=>{cancelled=true;};
 },[]);
 useLayoutEffect(()=>{
  const html=document.documentElement,previous=html.style.overflow;
  html.style.overflow='hidden';window.scrollTo(0,0);
  return()=>{html.style.overflow=previous;};
 },[]);
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(phase==='welcoming'){
   const timer=setTimeout(()=>setPhase('revealing'),reduced?180:welcomeDuration);
   return()=>clearTimeout(timer);
  }
  if(phase==='revealing'){
   const timer=setTimeout(()=>setPhase('about'),reduced?120:prologueDuration);
   return()=>clearTimeout(timer);
  }
  if(phase==='about'){
   heading.current?.focus({preventScroll:true});
  }
  if(phase==='departing'){
   const timer=setTimeout(()=>{window.scrollTo(0,0);enter.current();},reduced?120:departureDuration);
   return()=>clearTimeout(timer);
  }
 },[phase]);
 return <main className="voyage-prologue" data-testid="voyage-prologue" data-phase={phase} data-cabin-visible={cabinVisible} data-summit-ready={harborReady&&imagesReady} style={{'--prologue-duration':`${prologueDuration}ms`,'--departure-duration':`${departureDuration}ms`} as CSSProperties} aria-busy={!assetsReady}>
  <section className="summit-opening" aria-label="A pirate voyage beyond the horizon" aria-hidden={phase==='about'||phase==='departing'}>
   <div className="summit-opening-scene"><ProloguePirateScene scene="harbor" animated suspended={cabinVisible||phase==='about'||phase==='departing'} onReady={()=>setHarborReady(true)}/><VoyageBirds variant="harbor"/>
   <div className="summit-welcome" aria-hidden={!(phase==='welcoming'||phase==='revealing'&&!cabinVisible)} aria-live="polite">
    <p>BEYOND THE HORIZON. INTO THE UNKNOWN.</p>
    <h1>
     <span className="welcome-title-line welcome-title-kicker"><span className="welcome-title-depth" aria-hidden="true">Welcome To My</span><span className="welcome-title-face">Welcome To My</span></span>
     <span className="welcome-title-line welcome-title-main"><span className="welcome-title-depth" aria-hidden="true">Portofolio</span><span className="welcome-title-face">Portofolio</span></span>
    </h1>
   </div>
   <div className="summit-portrait" aria-hidden="true"><img src="/images/prologue/iza-red-cutout.webp" alt="" width="636" height="1432" fetchPriority="high" decoding="async" draggable={false}/></div>
   </div>
   <div className="summit-brand voyage-brand"><span className="brand-icon"><Anchor size={24}/></span><span className="brand-name">iza<span>.</span></span><span className="brand-caption">THE CREATIVE<br/>VOYAGE</span></div>
   <p className="summit-signature">IZA YUNUS ANDHIKA<span>CODE. DESIGN. STORIES.</span></p>
   <button type="button" className="summit-start" aria-label="Begin the voyage" disabled={!assetsReady||phase!=='idle'} onClick={()=>setPhase('welcoming')}>
    <span className="summit-start-label"><i><MoveUpRight size={22} strokeWidth={1.3}/></i><span>Begin the journey<small>EVERY VOYAGE STARTS WITH CURIOSITY</small></span></span>
   </button>
  </section>
  <section ref={about} className="prologue-about" data-testid="prologue-about" data-active={phase==='about'} inert={phase!=='about'} aria-hidden={phase!=='about'} aria-labelledby="prologue-about-name">
   <div className="prologue-about-atmosphere"><ProloguePirateScene scene="cabin" active={cabinActive} animated={cabinVisible||phase==='about'} suspended={!cabinVisible&&phase!=='about'||phase==='departing'} onReady={()=>setCabinReady(true)}/><div className="pirate-cabin-shade"/></div>
   <div className="prologue-about-content">
   <HangingPortrait active={phase==='about'}/>
   <div className="prologue-about-copy">
    <p className="prologue-eyebrow"><span/>THE PERSON BEHIND THE VOYAGE</p>
    <h2 ref={heading} id="prologue-about-name" tabIndex={-1}>Iza Yunus<br/><em>Andhika.</em></h2>
    <p className="prologue-role">Software Engineer <span>/</span> Website Designer</p>
    <p>I'm a Computer Science undergraduate at Diponegoro University. I build intuitive, reliable web applications with clean code, structured thinking, and thoughtful design.</p>
    <p>Alongside engineering, I explore website design and visual storytelling, bringing the same curiosity to an interface, a camera frame, and a new idea.</p>
    <p>I enjoy turning complex problems into clear, practical solutions. From the first sketch to the final interaction, I care about the details that make a product feel natural to use. Every project is a chance to learn, collaborate, and bring a useful idea to life.</p>
    <div className="prologue-languages">
     <p id="prologue-languages-label">LANGUAGES I WORK WITH</p>
     <ul aria-labelledby="prologue-languages-label" role="list">
      {['C','C++','Python','JavaScript','TypeScript','HTML','CSS','SQL'].map(language=><li key={language}>{language}</li>)}
     </ul>
    </div>
    <div className="prologue-about-actions">
     <button type="button" className="button pirate-explore" aria-label="Explore my portfolio" disabled={phase!=='about'} onClick={()=>setPhase('departing')}>
      <span className="pirate-explore-compass" aria-hidden="true"><Compass size={30} strokeWidth={1.3}/></span>
      <span className="pirate-explore-copy"><small aria-hidden="true">YOUR NEXT ADVENTURE</small><span>Explore my portfolio</span></span>
      <span className="pirate-explore-arrow" aria-hidden="true"><ArrowUpRight size={21} strokeWidth={1.5}/></span>
     </button>
     <span>Set sail toward new possibilities.</span>
    </div>
   </div>
   <PirateTreasure active={phase==='about'}/>
   <span className="prologue-about-mark" aria-hidden="true">A little curiosity.<br/>A sea of possibilities.</span>
   </div>
  </section>
  <PirateGate phase={phase} onReady={()=>setGateReady(true)} onCover={()=>setCabinVisible(true)}/>
  <div className="prologue-departure" aria-hidden="true"/>
 </main>;
}
