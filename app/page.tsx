'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, ArrowLeft, Anchor, Code2, Palette, Film, X, Menu, Mail, AtSign, BriefcaseBusiness, Sparkles, MapPin } from 'lucide-react';
import { Ship, OceanScene, Fish, Compass, Seaweed } from '@/components/nautical-art';
import { categories, contact, type CategoryId } from '@/lib/portfolio';

function ProjectArtwork({ type, index = 0 }: { type: CategoryId; index?: number }) {
  if (type === 'programming') return <div className={`project-art code-art variant-${index}`} aria-label="Illustrative software project preview">
    <div className="browser-window"><div className="browser-toolbar"><i /><i /><i /><span>something-great.dev</span><Code2 size={13} /></div><div className="browser-content"><div className="mock-sidebar"><span className="mock-logo">s.</span><i /><i /><i /><i /><div className="mock-avatar" /></div><div className="mock-dashboard"><div className="mock-greeting">Good things start here.<span>A little clarity for your everyday.</span></div><div className="mock-stats"><div><small>THE BIG PICTURE</small><strong>Make it<br />happen.</strong><div className="mini-spark">↗</div></div><div className="mock-chart"><i /><i /><i /><i /><i /><i /><i /></div></div><div className="mock-lines"><i /><i /><i /></div></div></div></div>
    <span className="art-sticker"><Code2 size={15} /> Built from an idea</span>
  </div>;
  if (type === 'design') return <div className={`project-art design-art variant-${index}`} aria-label="Illustrative design project preview"><div className="design-poster"><div className="poster-top">SLOW DAYS STUDIO <span>EST. WITH INTENTION</span></div><div className="poster-title">Less rush.<br /><em>More wonder.</em></div><div className="poster-flower"><i /><i /><i /><i /><i /><i /><b /></div><div className="poster-bottom">A LITTLE SPACE TO JUST BE. <ArrowUpRight size={24} /></div></div><div className="palette-strip"><i /><i /><i /><i /></div><span className="art-sticker"><Palette size={15} /> A thoughtful little world</span></div>;
  return <div className={`project-art film-art variant-${index}`} aria-label="Illustrative video project preview"><div className="film-frame"><div className="film-sun" /><div className="film-mountain mountain-back" /><div className="film-mountain mountain-front" /><span className="film-caption">somewhere,<br /><em>in between.</em></span><div className="film-info"><span>AN UNTOLD STORY</span><span>16:9 / VISUAL CONCEPT</span></div></div><div className="film-timeline"><span /><i /><i /><i /><i /><i /><i /><i /></div><span className="art-sticker"><Film size={15} /> Every frame, a feeling</span></div>;
}

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeStop, setActiveStop] = useState(-1);
  const [modal, setModal] = useState<CategoryId | null>(null);
  const [projectIndex, setProjectIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [contactOpen, setContactOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contactRef = useRef<HTMLDialogElement>(null);
  const travelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<number | null>(null);
  const selectedCategory = categories.find(c => c.id === modal) || categories[0];
  const project = selectedCategory.projects[projectIndex];
  const nextStop = activeStop < 2 ? activeStop + 1 : -1;

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('iza-welcome') === 'seen'; sessionStorage.setItem('iza-welcome', 'seen'); } catch { /* Optional session preference. */ }
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setIntro(false); return; }
    const leave = setTimeout(() => setIntroLeaving(true), 1800);
    const done = setTimeout(() => setIntro(false), 2350);
    return () => { clearTimeout(leave); clearTimeout(done); };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (modal && dialog && !dialog.open) dialog.showModal();
    if (!modal && dialog?.open) dialog.close();
    document.body.classList.toggle('dialog-open', Boolean(modal || contactOpen));
    return () => { document.body.classList.remove('dialog-open'); };
  }, [modal, contactOpen]);

  useEffect(() => {
    const dialog = contactRef.current;
    if (contactOpen && dialog && !dialog.open) dialog.showModal();
    if (!contactOpen && dialog?.open) dialog.close();
  }, [contactOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveStop(categories.findIndex(c => c.id === entry.target.id)); });
    }, { rootMargin: '-15% 0px -45% 0px', threshold: 0 });
    ['home', ...categories.map(c => c.id)].forEach(id => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => { observer.disconnect(); if (travelTimer.current) clearTimeout(travelTimer.current); };
  }, []);

  function openPortfolio(id: CategoryId, index = 0) { setProjectIndex(index); setSlideDirection('next'); setModal(id); }
  function sailTo(index: number) {
    if (travelTimer.current) clearTimeout(travelTimer.current);
    setModal(null);
    setMobileMenu(false);
    setActiveStop(index);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(index < 0 ? 'home' : categories[index].id)?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    if (index >= 0) travelTimer.current = setTimeout(() => { openPortfolio(categories[index].id); }, reduce ? 50 : 700);
  }
  function changeProject(step: number) {
    setSlideDirection(step > 0 ? 'next' : 'previous');
    setProjectIndex(i => (i + step + selectedCategory.projects.length) % selectedCategory.projects.length);
  }

  return <>
    {intro && <div className={`intro ${introLeaving ? 'intro-leaving' : ''}`} role="status"><div className="intro-stars">✧ &nbsp; &nbsp; ✦ &nbsp; &nbsp; ✧</div><Ship className="intro-ship" /><p className="eyebrow">A NEW ADVENTURE AWAITS</p><h2>Ahoy, welcome aboard.</h2><div className="intro-progress"><span /></div><button className="text-link intro-skip" onClick={() => setIntro(false)}>Skip intro <ArrowRight size={14} /></button></div>}

    <header className="site-header"><a className="wordmark" href="#home" aria-label="Iza, back to home"><Anchor size={26} strokeWidth={1.8} /><span>iza<span className="wordmark-dot">.</span></span><span className="wordmark-caption">THE CREATIVE<br />VOYAGE</span></a><nav className={mobileMenu ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation"><a href="#home" onClick={() => setMobileMenu(false)}>Home</a><a href="#voyage" onClick={() => setMobileMenu(false)}>The voyage</a><a href="#about" onClick={() => setMobileMenu(false)}>Meet the captain</a></nav><a className="header-contact" href="#contact">Let’s talk <ArrowUpRight size={17} /></a><button className="menu-toggle" aria-label={mobileMenu ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button></header>

    <main>
      <section id="home" className="hero section-anchor">
        <div className="hero-copy"><div className="eyebrow hero-eyebrow"><span className="little-wave">〰</span> AHOY THERE, I’M</div><h1>IZA YUNUS<br /><span>ANDHIKA<span className="coral-dot">.</span></span></h1><div className="roles"><span>Software Engineer</span><i /> <span>Website Designer</span></div><p className="hero-description">A curious mind with a creative compass.<br />I build digital experiences, craft thoughtful designs,<br className="desktop-break" /> and tell stories through a different lens.</p><div className="hero-actions"><button className="button button-dark" onClick={() => sailTo(0)}>Explore my work <ArrowUpRight size={18} /></button><a className="text-link" href="#about">A little about me <ArrowRight size={17} /></a></div><div className="hero-footnote"><span className="status-dot" /> OPEN TO IDEAS. ALWAYS UP FOR AN ADVENTURE.</div></div>
        <div className="hero-visual"><span className="handwritten hero-scribble">A creative soul,<br />on an endless voyage.<svg viewBox="0 0 100 50" aria-hidden="true"><path d="M7 8q70-7 69 27m-11-8 12 10 7-14" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></span><OceanScene onSail={() => sailTo(0)} /><div className="hero-seal"><Compass /><span>GUIDED BY<br /><b>CURIOSITY</b></span></div></div>
        <a className="scroll-hint" href="#voyage"><span>SCROLL TO SET SAIL</span><ArrowDown size={16} /></a><span className="hero-edition">A PERSONAL PORTFOLIO · VOL. 01</span>
      </section>

      <section id="voyage" className="voyage-map section-anchor"><div className="map-heading"><div><p className="eyebrow">FOLLOW THE LITTLE DOTTED LINE</p><h2>One curious mind. <em>Three creative seas.</em></h2></div><p>Every good adventure starts with a first step.<br />Pick a destination, or let the ship lead the way.</p></div><div className="route-map"><svg className="route-line" viewBox="0 0 1100 150" preserveAspectRatio="none" aria-hidden="true"><path d="M55 74C155 10 265 140 402 74S600 10 752 74 952 140 1050 74" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 8" strokeLinecap="round" /></svg><button className="route-start" onClick={() => sailTo(0)} aria-label="Sail to the programming portfolio"><Ship /><span>CLICK TO SET SAIL</span></button>{categories.map((category, i) => <button className={`route-stop ${activeStop === i ? 'is-active' : ''}`} key={category.id} onClick={() => sailTo(i)}><span className="route-pin">{i === 0 ? <Code2 size={21} /> : i === 1 ? <Palette size={21} /> : <Film size={21} />}</span><small>DESTINATION {category.number}</small><strong>{category.port}</strong><span>{i === 0 ? 'Programming' : i === 1 ? 'Design' : 'Videography'} <ArrowUpRight size={13} /></span></button>)}</div><div className="map-footer"><span><MapPin size={13} /> THREE PORTS. ENDLESS POSSIBILITIES.</span><span className="handwritten">The best treasures are the things we create.</span></div></section>

      <div className="ocean-portfolio">
        {categories.map((category, i) => <section id={category.id} key={category.id} className={`portfolio-section section-anchor section-${category.id}`}><div className="section-waterline" aria-hidden="true">〰 &nbsp; 〰 &nbsp; 〰</div><div className="portfolio-inner"><div className="portfolio-copy"><p className="eyebrow"><span className="port-number">{category.number}</span> A SHORE WORTH EXPLORING</p><div className="port-label">{i === 0 ? <Code2 size={17} /> : i === 1 ? <Palette size={17} /> : <Film size={17} />} {category.subtitle}</div><h2>{category.title.split(' ').slice(0, -1).join(' ')}<br /><em>{category.title.split(' ').slice(-1)}</em></h2><p className="section-description">{category.description}</p><button className="button button-outline" onClick={() => openPortfolio(category.id)}>Explore {i === 0 ? 'programming' : i === 1 ? 'design' : 'videography'} <ArrowUpRight size={17} /></button><span className="collection-note">A COLLECTION IN THE MAKING</span></div><button className="portfolio-preview" onClick={() => openPortfolio(category.id)} aria-label={`Open ${category.subtitle} portfolio`}><ProjectArtwork type={category.id} /><span className="preview-caption"><span>THE {category.port.toUpperCase()} COLLECTION</span><span className="preview-open"><ArrowUpRight size={19} /></span></span></button></div><Fish className={`section-fish section-fish-${i}`} color={i === 1 ? '#E7B69A' : '#C7DECC'} /><Seaweed className="section-seaweed" /><span className="water-coordinate">{category.number} / 03 &nbsp; — &nbsp; {category.port.toUpperCase()}</span></section>)}
      </div>

      <section id="about" className="about-section section-anchor"><div className="captain-card"><div className="captain-card-top"><span>THE PERSON BEHIND THE PIXELS</span><Sparkles size={17} /></div><div className="captain-portrait"><div className="portrait-sun" /><Ship /><span className="captain-hello handwritten">Your friendly<br />creative captain.</span></div><div className="captain-card-bottom"><span>IZA YUNUS ANDHIKA</span><Anchor size={18} /></div></div><div className="about-copy"><p className="eyebrow">A LITTLE ABOUT THE CAPTAIN</p><h2>Part logic.<br />Part imagination.<br /><em>All curiosity.</em></h2><p>I’m Iza, a creative explorer working across programming, design, and videography. I enjoy connecting the way things work with the way they look and feel.</p><p>Whether I’m building an interface, shaping a visual identity, or piecing together a story, I follow the same compass: stay curious, care about the details, and make something meaningful.</p><div className="about-skills"><span><Code2 size={15} /> Code with purpose</span><span><Palette size={15} /> Design with feeling</span><span><Film size={15} /> Stories with soul</span></div></div></section>

      <section id="contact" className="contact-section section-anchor"><Compass className="contact-compass" /><p className="eyebrow">THERE’S ALWAYS ANOTHER HORIZON</p><h2>Have an idea?<br /><em>Let’s make waves.</em><span>✳</span></h2><p>Great things start with a conversation.<br />Let’s create something worth sailing toward.</p><button className="button button-dark" onClick={() => setContactOpen(true)}>Say ahoy <ArrowUpRight size={18} /></button><Fish className="contact-fish" color="#94B7A3" /><div className="contact-ripples" aria-hidden="true"><span /><span /><span /></div></section>
    </main>

    <footer className="site-footer"><a className="footer-wordmark" href="#home"><Anchor size={18} /> iza.</a><span>CRAFTED WITH CURIOSITY & A LITTLE SEA SALT.</span><a className="text-link" href="#home">Back to the surface <ArrowUpRight size={14} /></a></footer>

    <button className={`sailing-button ${modal ? 'above-dialog' : ''}`} onClick={() => sailTo(nextStop)} aria-label={`Sail to ${nextStop < 0 ? 'the introduction' : categories[nextStop].port}`}><span className="sailing-label"><small>NEXT DESTINATION</small><strong>{nextStop < 0 ? 'Back to shore' : categories[nextStop].port} <ArrowDown size={13} /></strong></span><span className="sailing-icon"><Ship /></span></button>

    <dialog ref={dialogRef} className="portfolio-dialog" onClose={() => setModal(null)} onClick={e => { if (e.target === e.currentTarget) setModal(null); }} onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); changeProject(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); changeProject(-1); } }} aria-labelledby="portfolio-dialog-title"><div className="dialog-shell"><div className="dialog-topbar"><div className="dialog-brand"><Anchor size={20} /><span>THE TREASURE COLLECTION</span></div><button className="icon-button close-dialog" aria-label="Close portfolio" onClick={() => setModal(null)}><X size={20} /></button></div><div className="dialog-category-nav" aria-label="Portfolio categories">{categories.map(c => <button className={modal === c.id ? 'selected' : ''} key={c.id} onClick={() => { setModal(c.id); setProjectIndex(0); }}>{c.number}<span>{c.port}</span></button>)}</div><div className={`project-slide ${projectIndex % 2 ? 'media-right' : ''} slide-${slideDirection}`} key={`${modal}-${projectIndex}`} onTouchStart={e => { touchStart.current = e.changedTouches[0].clientX; }} onTouchEnd={e => { if (touchStart.current === null) return; const delta = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(delta) > 60) changeProject(delta > 0 ? 1 : -1); touchStart.current = null; }}><div className="project-media">{project.media ? project.mediaType === 'video' ? <video src={project.media} controls preload="metadata" aria-label={project.title} /> : <img src={project.media} alt={project.title} /> : <><ProjectArtwork type={selectedCategory.id} index={projectIndex} /><span className="placeholder-note">ILLUSTRATIVE PREVIEW · YOUR {project.mediaType === 'video' ? 'VIDEO' : 'MEDIA'} GOES HERE</span></>}</div><div className="project-details"><p className="eyebrow">{project.label} / {String(projectIndex + 1).padStart(2, '0')}</p><h2 id="portfolio-dialog-title">{project.title}</h2><p>{project.description}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{project.url ? <a className="button button-dark" href={project.url} target="_blank" rel="noopener noreferrer">View project <ArrowUpRight size={16} /></a> : <div className="project-pending"><span className="status-dot" /> A space for a future adventure.</div>}</div></div><div className="dialog-bottom"><span className="slide-instruction">A little treasure, one story at a time.</span><div className="slide-controls"><button className="icon-button" aria-label="Previous project" onClick={() => changeProject(-1)}><ArrowLeft size={18} /></button><span aria-live="polite">{String(projectIndex + 1).padStart(2, '0')} <i>/</i> {String(selectedCategory.projects.length).padStart(2, '0')}</span><button className="icon-button" aria-label="Next project" onClick={() => changeProject(1)}><ArrowRight size={18} /></button></div><button className="text-link next-port" onClick={() => sailTo((categories.findIndex(c => c.id === modal) + 1) % 3)}>Sail to the next port <Ship /></button></div></div></dialog>

    <dialog ref={contactRef} className="contact-dialog" onClose={() => setContactOpen(false)} onClick={e => { if (e.target === e.currentTarget) setContactOpen(false); }} aria-labelledby="contact-title"><button className="icon-button close-contact" aria-label="Close contact" onClick={() => setContactOpen(false)}><X size={20} /></button><Anchor size={32} /><p className="eyebrow">A MESSAGE IN A BOTTLE</p><h2 id="contact-title">Good things<br /><em>are on the horizon.</em></h2>{contact.email || contact.instagram || contact.linkedin ? <div className="contact-links">{contact.email && <a href={`mailto:${contact.email}`}><Mail size={18} /> Email me <ArrowUpRight size={16} /></a>}{contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer"><AtSign size={18} /> Instagram <ArrowUpRight size={16} /></a>}{contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noopener noreferrer"><BriefcaseBusiness size={18} /> LinkedIn <ArrowUpRight size={16} /></a>}</div> : <><p>My contact channels are coming aboard soon.<br />Until then, take a look around my creative seas.</p><button className="button button-dark" onClick={() => { setContactOpen(false); sailTo(0); }}>Explore the voyage <ArrowRight size={16} /></button></>}<span className="handwritten">Thanks for stopping by, fellow explorer.</span></dialog>
  </>;
}


