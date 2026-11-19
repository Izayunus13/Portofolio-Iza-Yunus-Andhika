'use client';

import { useEffect, useRef, useState } from 'react';
import { Anchor, ArrowLeft, ArrowRight, ArrowUpRight, Award, Compass, Expand, X } from 'lucide-react';
import { TreasureMapPaper, type TreasureMapPaperController } from '@/components/treasure-map-paper';
import type { CertificateCollection } from '@/lib/certificates';
import { SoundToggle } from '@/components/voyage-sound';

type Props={collection:CertificateCollection;initialIndex?:number;onClose:()=>void};

export function CertificateGallery({collection,initialIndex=0,onClose}:Props){
  const [index,setIndex]=useState(()=>Math.max(0,Math.min(initialIndex,collection.certificates.length-1)));
  const [expanded,setExpanded]=useState(false),[imageFailed,setImageFailed]=useState(false),[direction,setDirection]=useState('next');
  const dialogRef=useRef<HTMLDialogElement>(null),zoomRef=useRef<HTMLDialogElement>(null);
  const paperRef=useRef<TreasureMapPaperController|null>(null),closingRef=useRef(false),zoomClosing=useRef(false),touchStart=useRef<number|null>(null);
  const certificate=collection.certificates[index],count=collection.certificates.length;
  useEffect(()=>{const dialog=dialogRef.current;if(dialog&&!dialog.open)dialog.showModal();},[]);
  useEffect(()=>{
    const dialog=zoomRef.current;
    if(expanded&&!dialog?.open)dialog?.showModal();
    if(!expanded&&dialog?.open)dialog.close();
  },[expanded]);
  function select(next:number){
    if(closingRef.current)return;
    const selected=(next+count)%count;
    if(selected===index)return;
    setDirection(next>index?'next':'previous');setIndex(selected);setImageFailed(false);
    const url=new URL(window.location.href);
    if(url.searchParams.has('certificates')){
      url.searchParams.set('certificate',collection.certificates[selected].id);
      window.history.replaceState(null,'',url.pathname+url.search+url.hash);
    }
  }
  async function close(){
    if(closingRef.current)return;
    closingRef.current=true;
    if(paperRef.current)await paperRef.current.close();
    else dialogRef.current?.close();
  }
  async function closeZoom(){
    const dialog=zoomRef.current;if(!dialog||zoomClosing.current)return;
    zoomClosing.current=true;
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      try{await dialog.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.93) translateY(12px)'}],{duration:220,easing:'ease-in',fill:'forwards'}).finished;}catch{/* Dialog may be removed with its parent. */}
    }
    dialog.close();zoomClosing.current=false;setExpanded(false);
    dialog.getAnimations().forEach(animation=>animation.cancel());
  }
  return <dialog ref={dialogRef} className="portfolio-dialog treasure-dialog certificate-dialog" aria-label={'Certificates from '+collection.island} onCancel={event=>{event.preventDefault();void close();}} onClose={event=>{if(event.target===event.currentTarget)onClose();}} onClick={event=>{if(event.target===event.currentTarget)void close();}} onKeyDown={event=>{
    if(expanded||event.altKey||event.ctrlKey||event.metaKey||event.target instanceof Element&&event.target.closest('a'))return;
    if(event.key==='ArrowRight'){event.preventDefault();select(index+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();select(index-1);}
  }}>
    <TreasureMapPaper controllerRef={paperRef} openingDuration={1150}/>
    <div className="scroll-sheet"><div className="dialog-shell"><div className="treasure-content certificate-map-content">
      <div className="certificate-map-ornaments" aria-hidden="true"><Compass/><svg viewBox="0 0 800 450" preserveAspectRatio="none"><path d="M-40 370C100 440 80 200 210 270S400 420 500 220 650 140 850 40" fill="none" stroke="currentColor" strokeDasharray="4 9"/><circle cx="500" cy="220" r="11" fill="none"/><path d="m492 212 16 16m0-16-16 16"/></svg></div>
      <header className="dialog-topbar certificate-map-header">
        <div className="dialog-brand"><Anchor size={24}/><span><small className="collection-port">{collection.island}</small>THE CERTIFICATE TREASURY</span></div>
        <span className="certificate-map-edition">LEARNING LOG / VOL. 0{collection.port}</span>
        <SoundToggle compact/>
        <button className="icon-button close-dialog" aria-label="Close certificates" onClick={()=>void close()} autoFocus><X size={20}/></button>
      </header>
      <div className="certificate-map-intro"><p className="eyebrow"><Award size={14}/>{collection.discipline}</p><p>Every discovery leaves a mark.</p><span>0{index+1} / 0{count}</span></div>
      <div key={certificate.id} className="certificate-slide" data-direction={direction} onTouchStart={event=>{touchStart.current=event.target instanceof Element&&event.target.closest('button,a')?null:event.changedTouches[0].clientX;}} onTouchEnd={event=>{
        if(touchStart.current===null)return;const distance=touchStart.current-event.changedTouches[0].clientX;
        if(Math.abs(distance)>60)select(index+(distance>0?1:-1));touchStart.current=null;
      }}>
        <div className="certificate-artwork">
          <div className="certificate-display">
            {imageFailed?<p className="certificate-image-error">This certificate image is currently unavailable.</p>:<button className={'certificate-enlarge'+(certificate.comingSoon?' certificate-pending-frame':'')} disabled={certificate.comingSoon} onClick={()=>setExpanded(true)} aria-label={certificate.comingSoon?'Certificate coming soon':'Enlarge certificate: '+certificate.title} onPointerMove={event=>{
              if(event.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
              const bounds=event.currentTarget.getBoundingClientRect(),x=(event.clientX-bounds.left)/bounds.width-.5,y=(event.clientY-bounds.top)/bounds.height-.5;
              event.currentTarget.style.setProperty('--frame-rx',(4-y*7)+'deg');event.currentTarget.style.setProperty('--frame-ry',(-7+x*10)+'deg');
            }} onPointerLeave={event=>{event.currentTarget.style.removeProperty('--frame-rx');event.currentTarget.style.removeProperty('--frame-ry');}}>
              <img src={certificate.image} alt={certificate.title+(certificate.sample?' - sample certificate':'')} onError={()=>setImageFailed(true)}/>
              <i className="frame-pin pin-tl"/><i className="frame-pin pin-tr"/><i className="frame-pin pin-bl"/><i className="frame-pin pin-br"/>
              <span className="certificate-expand-hint">{certificate.comingSoon?<><Compass size={13}/> Coming soon</>:<><Expand size={13}/> Inspect the certificate</>}</span>
            </button>}
          </div>
          <div className="certificate-frame-plaque"><span/><Award size={13}/><span>THE LEARNING COLLECTION / 0{index+1}</span><span/></div>
        </div>
        <section className="certificate-story" aria-live="polite" aria-atomic="true">
          <p className="eyebrow">{certificate.comingSoon?'THE NEXT HORIZON':'A MILESTONE ALONG THE VOYAGE'}</p>
          <p className="certificate-number">0{index+1}<span> / 0{count}</span></p>
          <h2>{certificate.title}</h2>
          <p className="certificate-description">{certificate.description}</p>
          <div className="certificate-skills">{certificate.skills.map(skill=><span key={skill}>{skill}</span>)}</div>
          {(certificate.issuer||certificate.issuedAt||certificate.credentialId)&&<dl className="certificate-metadata">
            {certificate.issuer&&<div><dt>Issued by</dt><dd>{certificate.issuer}</dd></div>}
            {certificate.issuedAt&&<div><dt>Issued</dt><dd>{certificate.issuedAt}</dd></div>}
            {certificate.credentialId&&<div><dt>Credential ID</dt><dd>{certificate.credentialId}</dd></div>}
          </dl>}
          {certificate.comingSoon&&<p className="certificate-pending-note"><Compass size={15}/> More milestones ahead.</p>}
          {certificate.sample&&<p className="certificate-sample-note"><span/>Illustrative preview, ready for an earned certificate.</p>}
          {certificate.document&&<a className="button button-dark certificate-document" href={certificate.document} target="_blank" rel="noopener noreferrer">Open certificate PDF <ArrowUpRight size={16}/></a>}
          {certificate.verificationUrl&&<a className="button button-dark" href={certificate.verificationUrl} target="_blank" rel="noopener noreferrer">Verify credential <ArrowUpRight size={16}/></a>}
          <div className="certificate-map-signoff"><span aria-hidden="true">&#10023;</span><i>Knowledge, gathered at sea.</i></div>
        </section>
      </div>
      <div className="certificate-thumbnails" data-count={count} aria-label="Choose a certificate">
        {collection.certificates.map((item,i)=><button key={item.id} aria-label={'Show certificate '+(i+1)+': '+item.title} aria-pressed={index===i} onClick={()=>select(i)}><img src={item.image} alt=""/><span><small>0{i+1} / {item.comingSoon?'COMING SOON':item.sample?'SAMPLE':'CERTIFICATE'}</small>{item.title}</span></button>)}
      </div>
      <footer className="dialog-bottom certificate-map-footer">
        <span className="slide-instruction">Every certificate. A wider horizon.</span>
        <div className="certificate-paging"><button className="icon-button" aria-label="Previous certificate" onClick={()=>select(index-1)}><ArrowLeft size={18}/></button><span aria-live="polite" aria-label={'Certificate '+(index+1)+' of '+count}>0{index+1} <i>/</i> 0{count}</span><button className="icon-button" aria-label="Next certificate" onClick={()=>select(index+1)}><ArrowRight size={18}/></button></div>
        <button className="text-link" onClick={()=>void close()}>Back to the voyage <ArrowRight size={15}/></button>
      </footer>
    </div></div></div>
    <dialog ref={zoomRef} className="certificate-lightbox" aria-label="Full certificate" onCancel={event=>{event.preventDefault();event.stopPropagation();void closeZoom();}} onClose={event=>{event.stopPropagation();setExpanded(false);}} onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)void closeZoom();}}>
      <SoundToggle compact className="dialog-sound-toggle"/>
      <button className="icon-button" aria-label="Close full certificate" onClick={()=>void closeZoom()}><X size={22}/></button>
      <img src={certificate.image} alt={certificate.title+(certificate.sample?' - sample certificate':'')}/>
      <a href={certificate.document??certificate.originalImage??certificate.image} target="_blank" rel="noopener noreferrer">{certificate.document?'Open original PDF':'Open original image'} <ArrowUpRight size={14}/></a>
    </dialog>
  </dialog>;
}
