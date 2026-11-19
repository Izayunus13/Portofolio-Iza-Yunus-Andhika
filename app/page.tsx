'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Anchor, ArrowUpRight, ArrowRight, ArrowLeft, X, Code2, Palette, Film, Compass, Navigation, Box, Mail, AtSign, BriefcaseBusiness, Database, Expand } from 'lucide-react';
import { VoyageScene } from '@/components/voyage-scene';
import { IslandNavigation } from '@/components/island-navigation';
import { voyageDestinations } from '@/lib/destinations';
import { ProjectArtwork } from '@/components/project-artwork';
import { PortfolioVideo } from '@/components/portfolio-video';
import { YouTubeVideo } from '@/components/youtube-video';
import { TreasureMapPaper, type TreasureMapPaperController } from '@/components/treasure-map-paper';
import { CloudLoadingScreen } from '@/components/cloud-loading-screen';
import { VoyagePrologue } from '@/components/voyage-prologue';
import { categories, contact, type CategoryId } from '@/lib/portfolio';
import { certificateCollections, certificateHref, certificateSummary } from '@/lib/certificates';
import { CertificateGallery } from '@/components/certificate-gallery';
import { VoyageSoundState, SoundToggle } from '@/components/voyage-sound';

const destinations=voyageDestinations.map(port=>port.name);
const portHeadings=[['A curious mind.', 'An open horizon.'],['Good ideas.', 'Beautifully built.'],['A little colour.', 'A lot of character.'],['Moments move.', 'Stories stay.']];

export default function Home(){
  const [prologueComplete,setPrologueComplete]=useState(false);
  const [current,setCurrent]=useState(0),[destination,setDestination]=useState(0),[traveling,setTraveling]=useState(false),[showSailingStatus,setShowSailingStatus]=useState(false),[ready,setReady]=useState(false),[introComplete,setIntroComplete]=useState(false),[introOpening,setIntroOpening]=useState(false),[navigationReady,setNavigationReady]=useState(false),[fallback,setFallback]=useState(false);
  const [modal,setModal]=useState<CategoryId|null>(null),[portfolioIndex,setPortfolioIndex]=useState(0),[mediaIndex,setMediaIndex]=useState(0),[slideDirection,setSlideDirection]=useState('next');
  const [panelPort,setPanelPort]=useState(0),[panelHidden,setPanelHidden]=useState(false);
  const [info,setInfo]=useState<'about'|'contact'|null>(null);
  const portfolioRef=useRef<HTMLDialogElement>(null),infoRef=useRef<HTMLDialogElement>(null),arrivalTimer=useRef<ReturnType<typeof setTimeout>|null>(null),touchStart=useRef<number|null>(null);
  const [certificateSelection,setCertificateSelection]=useState<{port:number;index:number}|null>(null);
  const portfolioTabsRef=useRef<HTMLDivElement>(null),paperRef=useRef<TreasureMapPaperController|null>(null),portfolioClosing=useRef(false);
  const sailingStatusRef=useRef<HTMLParagraphElement>(null),remainingDistanceRef=useRef<HTMLSpanElement>(null);
  const labelLayout=useRef({halfWidth:0,height:0,stageWidth:0}),printedDistance=useRef(''),approachingRef=useRef(false);
  const currentRef=useRef(current),destinationRef=useRef(destination),travelingRef=useRef(traveling);currentRef.current=current;destinationRef.current=destination;travelingRef.current=traveling;
  const selectedCategory=categories.find(c=>c.id===modal)||categories[0];
  const portfolio=selectedCategory.projects[Math.min(portfolioIndex,selectedCategory.projects.length-1)];
  const slide=portfolio.slides[Math.min(mediaIndex,portfolio.slides.length-1)];
  const next=(current+1)%4;
  useLayoutEffect(()=>{
    const sheet=portfolioRef.current?.querySelector<HTMLElement>('.dialog-shell');
    if(sheet)sheet.scrollTop=0;
  },[modal,portfolio.id,mediaIndex]);

  useEffect(()=>{const d=portfolioRef.current;if(modal&&!d?.open)d?.showModal();if(!modal&&d?.open)d.close();},[modal]);
  useEffect(()=>{const d=infoRef.current;if(info&&!d?.open)d?.showModal();if(!info&&d?.open)d.close();},[info]);
  useEffect(()=>()=>{if(arrivalTimer.current)clearTimeout(arrivalTimer.current);},[]);

  useEffect(()=>{
    const label=sailingStatusRef.current;if(!label||!showSailingStatus)return;
    const measure=()=>{labelLayout.current={halfWidth:label.offsetWidth/2,height:label.offsetHeight,stageWidth:label.parentElement?.clientWidth??window.innerWidth};};
    const observer=new ResizeObserver(measure);observer.observe(label);if(label.parentElement)observer.observe(label.parentElement);measure();
    return()=>observer.disconnect();
  },[showSailingStatus,destination]);

  const positionSailingStatus=useCallback((x:number,y:number)=>{
    const label=sailingStatusRef.current;if(!label)return;
    const {halfWidth,stageWidth,height}=labelLayout.current;if(!stageWidth)return;
    const left=Math.max(halfWidth+16,Math.min(stageWidth-halfWidth-16,x));
    label.style.setProperty('--ship-label-x',left.toFixed(2)+'px');
    label.style.setProperty('--ship-label-y',Math.max(height+28,y).toFixed(2)+'px');
    if(label.dataset.positioned!=='true')label.dataset.positioned='true';
  },[]);

  const updateRemainingDistance=useCallback((km:number)=>{
    const text=km>0?'('+Math.max(.01,Math.ceil(km*100)/100).toFixed(2)+' km)':'(0 km)';
    if(remainingDistanceRef.current&&text!==printedDistance.current){remainingDistanceRef.current.textContent=text;printedDistance.current=text;}
    if(travelingRef.current&&km<=5&&!approachingRef.current){approachingRef.current=true;setPanelPort(destinationRef.current);setPanelHidden(false);}
  },[]);

  function openPortfolio(id:CategoryId,index=0){portfolioClosing.current=false;setPortfolioIndex(index);setMediaIndex(0);setSlideDirection('next');setModal(id);}
  const arrive=useCallback((index:number)=>{
    setCurrent(index);setPanelPort(index);setPanelHidden(false);setTraveling(false);updateRemainingDistance(0);travelingRef.current=false;
    if(arrivalTimer.current)clearTimeout(arrivalTimer.current);
    arrivalTimer.current=setTimeout(()=>{setShowSailingStatus(false);if(index>0){setPortfolioIndex(0);setMediaIndex(0);setSlideDirection('next');setModal(categories[index-1].id);}},window.matchMedia('(prefers-reduced-motion: reduce)').matches?100:1000);
  },[updateRemainingDistance]);
  function navigate(index:number){
    if(!introComplete||travelingRef.current)return;
    if(arrivalTimer.current)clearTimeout(arrivalTimer.current);
    setModal(null);setInfo(null);
    if(window.matchMedia('(max-width: 900px)').matches&&index!==current){
      document.querySelector('.world-container')?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
    if(index===current){setShowSailingStatus(false);if(index>0)openPortfolio(categories[index-1].id);return;}
    approachingRef.current=false;printedDistance.current='';labelLayout.current={halfWidth:0,height:0,stageWidth:0};setPanelHidden(true);setShowSailingStatus(true);setTraveling(true);travelingRef.current=true;setDestination(index);
    if(fallback)arrivalTimer.current=setTimeout(()=>arrive(index),200);
  }
  useEffect(()=>{
    if(!introComplete)return;
    const params=new URLSearchParams(window.location.search);
    const collection=certificateCollections.find(item=>item.id===params.get('certificates'));
    if(collection){
      const index=collection.certificates.findIndex(item=>item.id===params.get('certificate'));
      setCertificateSelection({port:collection.port,index:Math.max(0,index)});
    }
  },[introComplete]);
  function openCertificates(port:number,index=0){
    if(!introComplete||travelingRef.current)return;
    if(arrivalTimer.current)clearTimeout(arrivalTimer.current);
    setModal(null);setInfo(null);setCertificateSelection({port,index});
  }
  function closeCertificates(){
    setCertificateSelection(null);
    const url=new URL(window.location.href);
    if(url.searchParams.has('certificates')){
      url.searchParams.delete('certificates');url.searchParams.delete('certificate');
      window.history.replaceState(null,'',url.pathname+url.search+url.hash);
    }
  }
  async function closePortfolio(){
    const dialog=portfolioRef.current;
    if(!dialog?.open||portfolioClosing.current)return;
    portfolioClosing.current=true;
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const content=dialog.querySelector('.treasure-content');
      if(content){
        const fade=content.animate([{opacity:1},{opacity:0}],{duration:140,easing:'ease-out',fill:'forwards'});
        try{await fade.finished;}catch{return;}
        fade.cancel();
      }
    }
    if(paperRef.current)await paperRef.current.close();else dialog.close();
    portfolioClosing.current=false;
  }
  function changeMedia(step:number){if(portfolioClosing.current)return;setSlideDirection(step>0?'next':'previous');setMediaIndex(i=>(i+step+portfolio.slides.length)%portfolio.slides.length);}
  function selectPortfolio(index:number){if(portfolioClosing.current||index===portfolioIndex)return;setPortfolioIndex(index);setMediaIndex(0);setSlideDirection('next');touchStart.current=null;}
  function handlePortfolioTabKeyDown(event:KeyboardEvent<HTMLButtonElement>,index:number){
    let target=index;
    if(event.key==='ArrowRight')target=(index+1)%selectedCategory.projects.length;
    else if(event.key==='ArrowLeft')target=(index-1+selectedCategory.projects.length)%selectedCategory.projects.length;
    else if(event.key==='Home')target=0;
    else if(event.key==='End')target=selectedCategory.projects.length-1;
    else return;
    event.preventDefault();event.stopPropagation();selectPortfolio(target);
    portfolioTabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[target]?.focus();
  }
  function handleError(){setFallback(true);setReady(true);if(travelingRef.current)arrive(destination);}
  const portIcon=(i:number,size=17)=>i===0?<Anchor size={size}/>:i===1?<Code2 size={size}/>:i===2?<Palette size={size}/>:<Film size={size}/>;

  if(!prologueComplete)return <VoyagePrologue onEnter={()=>setPrologueComplete(true)}/>;

  return <main className={`voyage-app ${ready?'world-ready':''} ${traveling?'is-sailing':''}`} data-current-port={current} data-traveling={traveling} data-intro-complete={introComplete} aria-busy={!introComplete}>
    <VoyageSoundState sailing={traveling} paused={modal!==null||info!==null||certificateSelection!==null}/>
    <VoyageScene suspended={modal!==null||info!==null||certificateSelection!==null||(ready&&!introComplete&&!introOpening)} destination={destination} onReady={()=>setReady(true)} onArrive={arrive} onDistance={updateRemainingDistance} onShipPosition={positionSailingStatus} onShip={()=>navigate((currentRef.current+1)%4)} onPort={navigate} onCertificate={openCertificates} onError={handleError}/>
    <div className="sea-atmosphere" data-hidden={panelHidden} aria-hidden="true"/>
    {!introComplete&&<CloudLoadingScreen ready={ready&&navigationReady} onReveal={()=>setIntroOpening(true)} onComplete={()=>setIntroComplete(true)}/>}

    <header className="voyage-header" inert={!introComplete}><button className="voyage-brand" onClick={()=>navigate(0)} aria-label="Iza, sail to home waters"><span className="brand-icon"><Anchor size={24}/></span><span className="brand-name">iza<span>.</span></span><span className="brand-caption">THE CREATIVE<br/>VOYAGE</span></button><div className="header-middle"><span/> A SMALL WORLD OF BIG IDEAS</div><nav aria-label="Main navigation"><button className="captain-link" onClick={()=>setInfo('about')}>Meet the captain</button><button className="ahoy-link" onClick={()=>setInfo('contact')}>Say ahoy <ArrowUpRight size={16}/></button></nav></header>

    <div className="world-edition"><Box size={13}/><span>AN ISOMETRIC ADVENTURE</span><i/> EXPLORE IN 3D</div>
    <div className="chapter-count"><span>{String(current+1).padStart(2,'0')}</span><i/><small>04</small></div>

    <section className="captain-panel" data-hidden={panelHidden} data-panel-port={panelPort} aria-hidden={panelHidden} inert={panelHidden||traveling||!introComplete} aria-live="polite" aria-labelledby={'captain-heading-'+panelPort}>
      {destinations.map((name,index)=>{
        const category=index>0?categories[index-1]:null,active=index===panelPort&&!panelHidden;
        return <div key={name} className={'captain-panel-layer '+(index===0?'home-panel':'island-panel')} data-active={active} aria-hidden={!active} inert={!active||traveling||!introComplete}>
      <p className="eyebrow"><span className="tiny-wave">≈</span>{index===0?'AHOY, WELCOME THE PORTOFOLIO':`YOU’VE ARRIVED AT ${destinations[index].toUpperCase()}`}</p>
      {index===0?<><h1 id={'captain-heading-'+index}>IZA YUNUS<br/><span>ANDHIKA<span className="title-dot">.</span></span></h1><div className="hero-specialties"><span>Software Engineer</span><i/><span>Website Designer</span></div><p className="captain-description">Computer Science undergraduate at Diponegoro University.<br/> I turn complex business needs into thoughtful web solutions,<br className="desktop-break"/> guided by clean code and a creative compass.</p><div className="captain-actions"><button className="button button-dark" onClick={()=>navigate(1)} disabled={traveling||!ready||!introComplete}>Let’s set sail <Navigation size={16}/></button><button className="quiet-button" onClick={()=>setInfo('about')}>The person behind the voyage <ArrowUpRight size={14}/></button></div><p className="captain-footnote"><span/> CODE. DESIGN. STORIES. A SEA OF POSSIBILITIES.</p></>:<><div className="island-category">{portIcon(index,16)} {category?.subtitle}</div><h1 id={'captain-heading-'+index} className="island-title">{portHeadings[index][0]}<br/><em>{portHeadings[index][1]}</em></h1><p className="captain-description">{category?.description}</p><div className="island-collection"><span>0{index}</span><div>{destinations[index]}<small>A COLLECTION IN THE MAKING</small></div><span className="collection-treasure">✧</span></div><div className="captain-actions"><button className="button button-dark" onClick={()=>openPortfolio(category!.id)}>Discover the work <ArrowUpRight size={17}/></button><button className="quiet-button" onClick={()=>navigate((index+1)%4)}>Keep exploring <ArrowRight size={15}/></button></div><a className="certificate-panel-link" href={certificateHref(index)} onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();openCertificates(index);}}}>Explore the certificate island <ArrowUpRight size={14}/><span>{certificateSummary(certificateCollections[index-1])}</span></a></>}
        </div>;
      })}
    </section>

    <div className="world-annotation"><span className="annotation-line"/><div><span className="handwritten">{current===0?'Every adventure begins':'A new shore. A new story.'}<br/>{current===0?'with a little curiosity.':'Stay a little. Look around.'}</span><small>{current===0?'YOUR CREATIVE CAPTAIN IS READY':destinations[current].toUpperCase()+' · CREATIVE ARCHIPELAGO'}</small></div></div>

    {showSailingStatus&&<p ref={sailingStatusRef} className="sailing-status" role="status" aria-atomic="true"><em>going to {destinations[destination]} <span ref={remainingDistanceRef} className="sailing-distance">(0 km)</span></em></p>}

    <div className="voyage-bottom"><div className="harbour-navigation"><IslandNavigation prepare={ready} onPrepared={()=>setNavigationReady(true)} current={current} destination={destination} traveling={traveling} ready={ready&&introComplete} onNavigate={navigate}/><div className="voyage-tip"><p><b>{traveling?'ENJOY THE LITTLE JOURNEY':'CLICK THE SHIP TO SET SAIL'}</b><span>{traveling?'Your next island is just ahead.':'Or choose your next island above.'}</span></p></div></div><button className="next-island" onClick={()=>navigate(next)} disabled={traveling||!ready||!introComplete} aria-label={`Sail to ${destinations[next]}`}><span><small>NEXT HORIZON</small><strong>{destinations[next]}</strong></span><span className="next-island-arrow"><ArrowRight size={19}/></span></button></div>
    <div className="voyage-footer"><span>CRAFTED WITH CURIOSITY & A LITTLE SEA SALT.</span><span>IZA YUNUS ANDHIKA <i/> PERSONAL PORTFOLIO</span></div>

    <dialog ref={portfolioRef} className="portfolio-dialog treasure-dialog" onCancel={e=>{e.preventDefault();void closePortfolio();}} onClose={()=>{portfolioClosing.current=false;setModal(null);}} onClick={e=>{if(e.target===e.currentTarget)void closePortfolio();}} onKeyDown={e=>{
      if(e.target instanceof Element&&e.target.closest('video,input,textarea,[contenteditable="true"]'))return;
      if(e.key==='ArrowRight'){e.preventDefault();changeMedia(1);}
      if(e.key==='ArrowLeft'){e.preventDefault();changeMedia(-1);}
    }} aria-labelledby="portfolio-dialog-title">
      <TreasureMapPaper controllerRef={paperRef} openingDuration={1550}/>
      <div className="scroll-sheet"><div className="dialog-shell"><div className="treasure-content">
        <div className="dialog-topbar">
          <div className="dialog-brand"><Anchor size={20}/><span><small className="collection-port">{selectedCategory.port}</small>THE TREASURE COLLECTION</span></div>
          <SoundToggle compact/>
          <button className="icon-button close-dialog" aria-label="Close portfolio" onClick={()=>void closePortfolio()}><X size={20}/></button>
        </div>
        <div ref={portfolioTabsRef} className="dialog-category-nav" data-count={selectedCategory.projects.length} style={{gridTemplateColumns:`repeat(${selectedCategory.projects.length},minmax(0,1fr))`}} role="tablist" aria-label={'Portfolios in '+selectedCategory.port}>
          {selectedCategory.projects.map((item,index)=><button key={item.id} id={'portfolio-tab-'+item.id} role="tab" aria-selected={portfolioIndex===index} aria-controls={'portfolio-panel-'+selectedCategory.id} tabIndex={portfolioIndex===index?0:-1} className={portfolioIndex===index?'selected':''} onClick={()=>selectPortfolio(index)} onKeyDown={event=>handlePortfolioTabKeyDown(event,index)}>
            {String(index+1).padStart(2,'0')}<span>{item.name}</span>
          </button>)}
        </div>
        <div id={'portfolio-panel-'+selectedCategory.id} className="portfolio-panel" role="tabpanel" aria-labelledby={'portfolio-tab-'+portfolio.id} tabIndex={0}>
          <div key={selectedCategory.id+'-'+portfolio.id+'-'+mediaIndex} className={'project-slide '+(mediaIndex%2?'media-right':'')+' slide-'+slideDirection+(slide.media?' has-project-media':'')} onTouchStart={e=>{
            touchStart.current=e.target instanceof Element&&e.target.closest('video,button,a,input')?null:e.changedTouches[0].clientX;
          }} onTouchEnd={e=>{
            if(touchStart.current===null)return;const delta=touchStart.current-e.changedTouches[0].clientX;
            if(Math.abs(delta)>60)changeMedia(delta>0?1:-1);touchStart.current=null;
          }}>
            <div className="project-media">
              {slide.media?slide.mediaType==='youtube'?<YouTubeVideo videoId={slide.media} title={slide.title} poster={slide.poster}/>:slide.mediaType==='video'?<PortfolioVideo src={slide.media} poster={slide.poster} title={slide.title} excerpt={slide.excerpt} dimensions={slide.videoDimensions}/>:<a className="project-image-link" href={slide.media} target="_blank" rel="noopener noreferrer" aria-label={'Open full-size '+(slide.imageLabel??'screenshot')+': '+slide.title}><img src={slide.media} alt={slide.title}/><span><Expand size={15}/> View full-size {slide.imageLabel??'screenshot'}</span></a>:<>
                <ProjectArtwork type={selectedCategory.id} index={(portfolioIndex+mediaIndex)%3}/>
                <span className="placeholder-note">ILLUSTRATIVE PREVIEW · YOUR {slide.mediaType==='video'?'VIDEO':'MEDIA'} GOES HERE</span>
              </>}
            </div>
            <div className="project-details">
              <p className="eyebrow">{portfolio.name} / {slide.label} / {String(mediaIndex+1).padStart(2,'0')}</p>
              <h2 id="portfolio-dialog-title">{slide.title}</h2>
              <p>{slide.emphasizedText?slide.description.split(slide.emphasizedText).map((part,index)=><Fragment key={index}>{index>0&&<strong>{slide.emphasizedText}</strong>}{part}</Fragment>):slide.description}</p>
              {slide.highlights&&<dl className="project-highlights" aria-label="Three account types">{slide.highlights.map(item=><div key={item.title}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}</dl>}
              <div className="project-tags">{slide.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
              {slide.url?<a className="button button-dark" href={slide.url} target="_blank" rel="noopener noreferrer">{slide.linkLabel??'View project'} <ArrowUpRight size={16}/></a>:<div className="project-pending"><span className="status-dot"/> {portfolio.status??'A space for a future adventure.'}</div>}
            </div>
          </div>
        </div>
        <div className="dialog-bottom">
          <span className="slide-instruction">A closer look at {portfolio.name}.</span>
          <div className="slide-controls">
            <button className="icon-button" aria-label="Previous media" onClick={()=>changeMedia(-1)} disabled={portfolio.slides.length<2}><ArrowLeft size={18}/></button>
            <span aria-live="polite" aria-label={'Media '+(mediaIndex+1)+' of '+portfolio.slides.length+' in '+portfolio.name}>{String(mediaIndex+1).padStart(2,'0')} <i>/</i> {String(portfolio.slides.length).padStart(2,'0')}</span>
            <button className="icon-button" aria-label="Next media" onClick={()=>changeMedia(1)} disabled={portfolio.slides.length<2}><ArrowRight size={18}/></button>
          </div>
          <button className="text-link next-port" onClick={()=>navigate((categories.findIndex(category=>category.id===modal)+2)%4)}>Sail to the next island <Navigation size={16}/></button>
        </div>
      </div></div></div>
    </dialog>

    {certificateSelection&&<CertificateGallery collection={certificateCollections[certificateSelection.port-1]} initialIndex={certificateSelection.index} onClose={closeCertificates}/>}
    <dialog ref={infoRef} className={`info-dialog ${info==='about'?'about-dialog':''}`} onClose={()=>setInfo(null)} onClick={e=>{if(e.target===e.currentTarget)setInfo(null);}} aria-labelledby="info-title"><SoundToggle compact className="dialog-sound-toggle"/><button className="icon-button close-info" onClick={()=>setInfo(null)} aria-label="Close dialog"><X size={20}/></button><span className="info-symbol">{info==='about'?<Compass size={36}/>:<Anchor size={32}/>}</span><p className="eyebrow">{info==='about'?'THE PERSON BEHIND THE VOYAGE':'A MESSAGE IN A BOTTLE'}</p><h2 id="info-title">{info==='about'?<>Part logic.<br/>Part imagination.<br/><em>All curiosity.</em></>:<>Good things<br/><em>are on the horizon.</em></>}</h2>{info==='about'?<><p>I’m Iza Yunus Andhika, a Computer Science undergraduate at Diponegoro University focused on software engineering. I turn complex business requirements into intuitive, reliable web applications that make everyday work simpler.</p><p>My foundation spans modern web development, software architecture, and structured databases. I build responsive interfaces and internal tools with clean, maintainable code, an analytical mindset, and attention to detail.</p><p>I value collaboration and keep refining my workflows to build efficient, scalable systems. Alongside engineering, I explore website design and videography, bringing technical precision, visual clarity, and storytelling into the same creative voyage.</p><div className="info-skills"><span><Code2 size={15}/> Clean code</span><span><Database size={15}/> Structured data</span><span><Palette size={15}/> Thoughtful interfaces</span></div><button className="button button-dark" onClick={()=>navigate(1)}>Explore my creative seas <ArrowRight size={16}/></button></>:contact.email||contact.instagram||contact.linkedin?<div className="contact-links">{contact.email&&<a href={`mailto:${contact.email}`}><Mail size={18}/> Email me <ArrowUpRight size={16}/></a>}{contact.instagram&&<a href={contact.instagram} target="_blank" rel="noopener noreferrer"><AtSign size={18}/> Instagram <ArrowUpRight size={16}/></a>}{contact.linkedin&&<a href={contact.linkedin} target="_blank" rel="noopener noreferrer"><BriefcaseBusiness size={18}/> LinkedIn <ArrowUpRight size={16}/></a>}</div>:<><p>My contact channels are coming aboard soon.<br/>Until then, take a look around my creative seas.</p><button className="button button-dark" onClick={()=>navigate(1)}>Explore the voyage <ArrowRight size={16}/></button></>}<span className="handwritten info-signoff">Thanks for stopping by, fellow explorer.</span></dialog>
  </main>;
}
