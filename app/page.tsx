'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Anchor, ArrowUpRight, ArrowRight, ArrowLeft, X, Code2, Palette, Film, Compass, Navigation, Box, Mail, AtSign, BriefcaseBusiness } from 'lucide-react';
import { VoyageScene } from '@/components/voyage-scene';
import { IslandNavigation } from '@/components/island-navigation';
import { voyageDestinations } from '@/lib/destinations';
import { ProjectArtwork } from '@/components/project-artwork';
import { categories, contact, type CategoryId } from '@/lib/portfolio';

const destinations=voyageDestinations.map(port=>port.name);
const portHeadings=[['A curious mind.', 'An open horizon.'],['Good ideas.', 'Beautifully built.'],['A little colour.', 'A lot of character.'],['Moments move.', 'Stories stay.']];

export default function Home(){
  const [current,setCurrent]=useState(0),[destination,setDestination]=useState(0),[traveling,setTraveling]=useState(false),[progress,setProgress]=useState(0),[ready,setReady]=useState(false),[fallback,setFallback]=useState(false);
  const [modal,setModal]=useState<CategoryId|null>(null),[projectIndex,setProjectIndex]=useState(0),[slideDirection,setSlideDirection]=useState('next');
  const [info,setInfo]=useState<'about'|'contact'|null>(null);
  const portfolioRef=useRef<HTMLDialogElement>(null),infoRef=useRef<HTMLDialogElement>(null),arrivalTimer=useRef<ReturnType<typeof setTimeout>|null>(null),touchStart=useRef<number|null>(null);
  const currentRef=useRef(current),travelingRef=useRef(traveling);currentRef.current=current;travelingRef.current=traveling;
  const selectedCategory=categories.find(c=>c.id===modal)||categories[0];
  const project=selectedCategory.projects[Math.min(projectIndex,selectedCategory.projects.length-1)];
  const activeCategory=current>0?categories[current-1]:null;
  const next=(current+1)%4;

  useEffect(()=>{const d=portfolioRef.current;if(modal&&!d?.open)d?.showModal();if(!modal&&d?.open)d.close();},[modal]);
  useEffect(()=>{const d=infoRef.current;if(info&&!d?.open)d?.showModal();if(!info&&d?.open)d.close();},[info]);
  useEffect(()=>()=>{if(arrivalTimer.current)clearTimeout(arrivalTimer.current);},[]);

  function openPortfolio(id:CategoryId,index=0){setProjectIndex(index);setSlideDirection('next');setModal(id);}
  const arrive=useCallback((index:number)=>{
    setCurrent(index);setTraveling(false);setProgress(1);travelingRef.current=false;
    if(arrivalTimer.current)clearTimeout(arrivalTimer.current);
    if(index>0)arrivalTimer.current=setTimeout(()=>{setProjectIndex(0);setSlideDirection('next');setModal(categories[index-1].id);},window.matchMedia('(prefers-reduced-motion: reduce)').matches?100:1000);
  },[]);
  function navigate(index:number){
    if(travelingRef.current)return;
    if(arrivalTimer.current)clearTimeout(arrivalTimer.current);
    setModal(null);setInfo(null);
    if(index===current){if(index>0)openPortfolio(categories[index-1].id);return;}
    setProgress(0);setTraveling(true);travelingRef.current=true;setDestination(index);
    if(fallback)arrivalTimer.current=setTimeout(()=>arrive(index),200);
  }
  function changeProject(step:number){setSlideDirection(step>0?'next':'previous');setProjectIndex(i=>(i+step+selectedCategory.projects.length)%selectedCategory.projects.length);}
  function handleError(){setFallback(true);setReady(true);if(travelingRef.current)arrive(destination);}
  const portIcon=(i:number,size=17)=>i===0?<Anchor size={size}/>:i===1?<Code2 size={size}/>:i===2?<Palette size={size}/>:<Film size={size}/>;

  return <main className={`voyage-app ${ready?'world-ready':''} ${traveling?'is-sailing':''}`} data-current-port={current} data-traveling={traveling}>
    <VoyageScene destination={destination} onReady={()=>setReady(true)} onArrive={arrive} onProgress={setProgress} onShip={()=>navigate((currentRef.current+1)%4)} onPort={navigate} onError={handleError}/>
    <div className="sea-atmosphere" aria-hidden="true"/>
    {!ready&&<div className="world-loading" role="status"><Anchor size={34}/><p>CHARTING THE CREATIVE SEAS</p><span>Your adventure is taking shape.</span><div><i/></div></div>}

    <header className="voyage-header"><button className="voyage-brand" onClick={()=>navigate(0)} aria-label="Iza, sail to home waters"><span className="brand-icon"><Anchor size={24}/></span><span className="brand-name">iza<span>.</span></span><span className="brand-caption">THE CREATIVE<br/>VOYAGE</span></button><div className="header-middle"><span/> A SMALL WORLD OF BIG IDEAS</div><nav aria-label="Main navigation"><button className="captain-link" onClick={()=>setInfo('about')}>Meet the captain</button><button className="ahoy-link" onClick={()=>setInfo('contact')}>Say ahoy <ArrowUpRight size={16}/></button></nav></header>

    <div className="world-edition"><Box size={13}/><span>AN ISOMETRIC ADVENTURE</span><i/> EXPLORE IN 3D</div>
    <div className="chapter-count"><span>{String(current+1).padStart(2,'0')}</span><i/><small>04</small></div>

    <section className={`captain-panel ${current===0?'home-panel':'island-panel'}`} key={current} aria-live="polite">
      <p className="eyebrow"><span className="tiny-wave">≈</span>{current===0?'AHOY, FELLOW EXPLORER':`YOU’VE ARRIVED AT ${destinations[current].toUpperCase()}`}</p>
      {current===0?<><h1>IZA YUNUS<br/><span>ANDHIKA<span className="title-dot">.</span></span></h1><div className="hero-specialties"><span>Software Engineer</span><i/><span>Website Designer</span></div><p className="captain-description">A curious mind with a creative compass.<br/>I build digital experiences, shape visual worlds,<br className="desktop-break"/> and turn everyday moments into stories.</p><div className="captain-actions"><button className="button button-dark" onClick={()=>navigate(1)} disabled={traveling||!ready}>Let’s set sail <Navigation size={16}/></button><button className="quiet-button" onClick={()=>setInfo('about')}>The person behind the voyage <ArrowUpRight size={14}/></button></div><p className="captain-footnote"><span/> CODE. DESIGN. STORIES. A SEA OF POSSIBILITIES.</p></>:<><div className="island-category">{portIcon(current,16)} {activeCategory?.subtitle}</div><h1 className="island-title">{portHeadings[current][0]}<br/><em>{portHeadings[current][1]}</em></h1><p className="captain-description">{activeCategory?.description}</p><div className="island-collection"><span>0{current}</span><div>{destinations[current]}<small>A COLLECTION IN THE MAKING</small></div><span className="collection-treasure">✧</span></div><div className="captain-actions"><button className="button button-dark" onClick={()=>openPortfolio(activeCategory!.id)}>Discover the work <ArrowUpRight size={17}/></button><button className="quiet-button" onClick={()=>navigate(next)}>Keep exploring <ArrowRight size={15}/></button></div></>}
    </section>

    <div className="world-annotation"><span className="annotation-line"/><div><span className="handwritten">{current===0?'Every adventure begins':'A new shore. A new story.'}<br/>{current===0?'with a little curiosity.':'Stay a little. Look around.'}</span><small>{current===0?'YOUR CREATIVE CAPTAIN IS READY':destinations[current].toUpperCase()+' · CREATIVE ARCHIPELAGO'}</small></div></div>

    {traveling&&<div className="sailing-status" role="status"><div><Navigation size={16}/><span>Sailing to <strong>{destinations[destination]}</strong></span><small>{Math.round(progress*100)}%</small></div><div className="sailing-track"><i style={{width:`${progress*100}%`}}/></div><span className="sailing-note">Follow the dots. Find something worth discovering.</span></div>}

    <div className="voyage-bottom"><div className="voyage-tip"><span className="mouse-icon"/><p><b>{traveling?'ENJOY THE LITTLE JOURNEY':'CLICK THE SHIP TO SET SAIL'}</b><span>{traveling?'Your next island is just ahead.':'Or choose your next island below.'}</span></p></div><IslandNavigation current={current} destination={destination} traveling={traveling} ready={ready} onNavigate={navigate}/><button className="next-island" onClick={()=>navigate(next)} disabled={traveling||!ready} aria-label={`Sail to ${destinations[next]}`}><span><small>NEXT HORIZON</small><strong>{destinations[next]}</strong></span><span className="next-island-arrow"><ArrowRight size={19}/></span></button></div>
    <div className="voyage-footer"><span>CRAFTED WITH CURIOSITY & A LITTLE SEA SALT.</span><span>IZA YUNUS ANDHIKA <i/> PERSONAL PORTFOLIO</span></div>

    <dialog ref={portfolioRef} className="portfolio-dialog" onClose={()=>setModal(null)} onClick={e=>{if(e.target===e.currentTarget)setModal(null);}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();changeProject(1);}if(e.key==='ArrowLeft'){e.preventDefault();changeProject(-1);}}} aria-labelledby="portfolio-dialog-title"><div className="dialog-shell"><div className="dialog-topbar"><div className="dialog-brand"><Anchor size={20}/><span>THE TREASURE COLLECTION</span></div><button className="icon-button close-dialog" aria-label="Close portfolio" onClick={()=>setModal(null)}><X size={20}/></button></div><div className="dialog-category-nav" aria-label="Portfolio categories">{categories.map(c=><button key={c.id} className={modal===c.id?'selected':''} onClick={()=>{setModal(c.id);setProjectIndex(0);}}>{c.number}<span>{c.port}</span></button>)}</div><div key={`${modal}-${projectIndex}`} className={`project-slide ${projectIndex%2?'media-right':''} slide-${slideDirection}`} onTouchStart={e=>{touchStart.current=e.changedTouches[0].clientX;}} onTouchEnd={e=>{if(touchStart.current===null)return;const delta=touchStart.current-e.changedTouches[0].clientX;if(Math.abs(delta)>60)changeProject(delta>0?1:-1);touchStart.current=null;}}><div className="project-media">{project.media?project.mediaType==='video'?<video src={project.media} controls preload="metadata" aria-label={project.title}/>:<img src={project.media} alt={project.title}/>:<><ProjectArtwork type={selectedCategory.id} index={projectIndex}/><span className="placeholder-note">ILLUSTRATIVE PREVIEW · YOUR {project.mediaType==='video'?'VIDEO':'MEDIA'} GOES HERE</span></>}</div><div className="project-details"><p className="eyebrow">{project.label} / {String(projectIndex+1).padStart(2,'0')}</p><h2 id="portfolio-dialog-title">{project.title}</h2><p>{project.description}</p><div className="project-tags">{project.tags.map(t=><span key={t}>{t}</span>)}</div>{project.url?<a className="button button-dark" href={project.url} target="_blank" rel="noopener noreferrer">View project <ArrowUpRight size={16}/></a>:<div className="project-pending"><span className="status-dot"/> A space for a future adventure.</div>}</div></div><div className="dialog-bottom"><span className="slide-instruction">A little treasure, one story at a time.</span><div className="slide-controls"><button className="icon-button" aria-label="Previous project" onClick={()=>changeProject(-1)}><ArrowLeft size={18}/></button><span aria-live="polite">{String(projectIndex+1).padStart(2,'0')} <i>/</i> {String(selectedCategory.projects.length).padStart(2,'0')}</span><button className="icon-button" aria-label="Next project" onClick={()=>changeProject(1)}><ArrowRight size={18}/></button></div><button className="text-link next-port" onClick={()=>navigate((categories.findIndex(c=>c.id===modal)+2)%4)}>Sail to the next island <Navigation size={16}/></button></div></div></dialog>

    <dialog ref={infoRef} className={`info-dialog ${info==='about'?'about-dialog':''}`} onClose={()=>setInfo(null)} onClick={e=>{if(e.target===e.currentTarget)setInfo(null);}} aria-labelledby="info-title"><button className="icon-button close-info" onClick={()=>setInfo(null)} aria-label="Close dialog"><X size={20}/></button><span className="info-symbol">{info==='about'?<Compass size={36}/>:<Anchor size={32}/>}</span><p className="eyebrow">{info==='about'?'THE PERSON BEHIND THE VOYAGE':'A MESSAGE IN A BOTTLE'}</p><h2 id="info-title">{info==='about'?<>Part logic.<br/>Part imagination.<br/><em>All curiosity.</em></>:<>Good things<br/><em>are on the horizon.</em></>}</h2>{info==='about'?<><p>I’m Iza Yunus Andhika, a creative explorer working across programming, website design, and videography. I enjoy connecting the way things work with the way they look and feel.</p><p>Whether I’m building an interface, shaping a visual identity, or piecing together a story, I follow the same compass: stay curious, care about the details, and make something meaningful.</p><div className="info-skills"><span><Code2 size={15}/> Code with purpose</span><span><Palette size={15}/> Design with feeling</span><span><Film size={15}/> Stories with soul</span></div><button className="button button-dark" onClick={()=>navigate(1)}>Explore my creative seas <ArrowRight size={16}/></button></>:contact.email||contact.instagram||contact.linkedin?<div className="contact-links">{contact.email&&<a href={`mailto:${contact.email}`}><Mail size={18}/> Email me <ArrowUpRight size={16}/></a>}{contact.instagram&&<a href={contact.instagram} target="_blank" rel="noopener noreferrer"><AtSign size={18}/> Instagram <ArrowUpRight size={16}/></a>}{contact.linkedin&&<a href={contact.linkedin} target="_blank" rel="noopener noreferrer"><BriefcaseBusiness size={18}/> LinkedIn <ArrowUpRight size={16}/></a>}</div>:<><p>My contact channels are coming aboard soon.<br/>Until then, take a look around my creative seas.</p><button className="button button-dark" onClick={()=>navigate(1)}>Explore the voyage <ArrowRight size={16}/></button></>}<span className="handwritten info-signoff">Thanks for stopping by, fellow explorer.</span></dialog>
  </main>;
}
