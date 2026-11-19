import {useId} from 'react';

// One coordinate system and one unbroken shoreline span the whole prologue.
// Coordinates map to tenths of an svh; About Me's content cannot rescale the coast.
const shore='M-120 712C160 712 300 792 590 792C880 792 980 905 1090 1060C1200 1215 1170 1380 1295 1555C1420 1730 1530 1850 1640 2020';

export function PrologueCoast(){
 const id='coast-'+useId().replace(/[^a-zA-Z0-9]/g,'');
 const paint=(name:string)=>`url(#${id}-${name})`;
 return <div className="shore-background" data-testid="vector-coast" aria-hidden="true">
  <svg className="coast-landscape" viewBox="0 0 1440 2600" preserveAspectRatio="none" focusable="false">
   <defs>
    <linearGradient id={`${id}-sky`} x2=".25" y2="1"><stop stopColor="#829fa2"/><stop offset=".6" stopColor="#abbba9"/><stop offset="1" stopColor="#ced0ad"/></linearGradient>
    <radialGradient id={`${id}-sunlight`}><stop stopColor="#f3dfaa" stopOpacity=".6"/><stop offset=".4" stopColor="#e9d2a0" stopOpacity=".22"/><stop offset="1" stopColor="#d5c49b" stopOpacity="0"/></radialGradient>
    <linearGradient id={`${id}-sea`} gradientUnits="userSpaceOnUse" x1="0" y1="526" x2="0" y2="2200"><stop stopColor="#426a70"/><stop offset=".1" stopColor="#315d67"/><stop offset=".4" stopColor="#4c807d"/><stop offset="1" stopColor="#355e52"/></linearGradient>
    <radialGradient id={`${id}-reflection`}><stop stopColor="#ebdba7" stopOpacity=".25"/><stop offset="1" stopColor="#b2c7a5" stopOpacity="0"/></radialGradient>
    <linearGradient id={`${id}-sand`} gradientUnits="userSpaceOnUse" x1="0" y1="710" x2="0" y2="2600"><stop stopColor="#aaa387"/><stop offset=".27" stopColor="#92977c"/><stop offset=".68" stopColor="#7c8971"/><stop offset="1" stopColor="#76816c"/></linearGradient>
    <linearGradient id={`${id}-wet`} gradientUnits="userSpaceOnUse" x1="0" y1="710" x2="0" y2="2100"><stop stopColor="#6b897b"/><stop offset=".5" stopColor="#5a7b6a"/><stop offset="1" stopColor="#405e4c"/></linearGradient>
    <linearGradient id={`${id}-cliff`} x2=".4" y2="1"><stop stopColor="#8e9c7c"/><stop offset=".5" stopColor="#607f6d"/><stop offset="1" stopColor="#365c53"/></linearGradient>
    <linearGradient id={`${id}-ripple`}><stop stopColor="#d9d0a7" stopOpacity="0"/><stop offset=".35" stopColor="#d9d0a7" stopOpacity=".35"/><stop offset="1" stopColor="#d9d0a7" stopOpacity="0"/></linearGradient>
    <linearGradient id={`${id}-dune-shadow`}><stop stopColor="#273c2b" stopOpacity="0"/><stop offset=".35" stopColor="#273c2b" stopOpacity=".09"/><stop offset="1" stopColor="#273c2b" stopOpacity="0"/></linearGradient>
    <filter id={`${id}-soften`} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <radialGradient id={`${id}-shadow`}><stop stopColor="#273e31" stopOpacity=".36"/><stop offset="1" stopColor="#273e31" stopOpacity="0"/></radialGradient>
    <radialGradient id={`${id}-sandlight`}><stop stopColor="#d6c394" stopOpacity=".19"/><stop offset="1" stopColor="#d6c394" stopOpacity="0"/></radialGradient>
    <linearGradient id={`${id}-texture-fade`} x2="0" y2="1"><stop stopColor="white"/><stop offset=".25" stopColor="white" stopOpacity=".6"/><stop offset=".7" stopColor="white" stopOpacity=".12"/></linearGradient>
    <mask id={`${id}-texture-mask`}><path d="M0 700H1440V2600H0Z" fill={paint('texture-fade')}/></mask>
    <pattern id={`${id}-grain`} width="113" height="83" patternUnits="userSpaceOnUse"><circle cx="9" cy="19" r=".8" fill="#364d36" opacity=".2"/><circle cx="61" cy="52" r=".65" fill="#dfd3ad" opacity=".25"/><path d="m91 9 3 1M28 71l2-1" stroke="#324b35" strokeWidth=".7" opacity=".16"/></pattern>
    <path id={`${id}-edge`} d={shore}/>
    <path id={`${id}-sand-shape`} d={`${shore}L1640 2700H-200Z`}/>
   </defs>
   <path fill={paint('sky')} d="M0 0H1440V550H0Z"/>
   <ellipse cx="210" cy="370" rx="535" ry="340" fill={paint('sunlight')}/>
   <path d="M0 526H1440V2600H0Z" fill={paint('sea')}/>
   <path d="M0 526H1440" fill="none" stroke="#bdc9ae" strokeWidth="1.4" opacity=".55"/>
   <ellipse cx="214" cy="690" rx="190" ry="150" fill={paint('reflection')}/>
   <path d="M-20 500C70 481 146 505 231 516S332 525 390 526H-20Z" fill="#849e89" opacity=".5"/>
   <path d="M-20 474C62 477 98 502 160 512C193 518 215 521 256 526H-20Z" fill={paint('cliff')}/>
   <path d="M-20 474C62 477 98 502 160 512C119 507 61 499-20 495Z" fill="#b0b18c" opacity=".6"/>
   <g className="coast-water-lines" fill="none" stroke="#c5d5bd" strokeLinecap="round">
    {Array.from({length:16},(_,i)=>{
     const y=543+i*i*1.38,depth=i/15;
     return <path key={i} d={`M-180 ${y}C190 ${y-2-depth*7} 382 ${y+3+depth*12} 735 ${y}S1240 ${y-3-depth*10} 1620 ${y}`} strokeWidth={.6+depth*1.5} opacity={.1+(i%3)*.025}/>;
    })}
   </g>
   <g className="coast-shimmer" fill="none" stroke="#e5d7ab" strokeLinecap="round">
    {Array.from({length:13},(_,i)=><path key={i} d={`M${179-i*7+(i%3)*14} ${540+i*i*1.07}q${27+i*4} ${-1-i*.12} ${55+i*8} 0`} strokeWidth={.75+i*.12} opacity={.42-i*.02}/>)}
   </g>
   <g className="coast-swell coast-swell-far" fill="none"><path d="M-180 637C155 614 440 672 735 648S1270 613 1620 635" stroke="#1f454b" strokeWidth="12" opacity=".2"/><path d="M-180 632C155 609 440 667 735 643S1270 608 1620 630" stroke="#c7d5bd" strokeWidth="2" opacity=".52"/></g>
   <g className="coast-swell coast-swell-near" fill="none"><path d="M-180 748C155 703 440 790 735 758S1270 711 1620 742" stroke="#193e41" strokeWidth="19" opacity=".2"/><path d="M-180 739C155 694 440 781 735 749S1270 702 1620 733" stroke="#d0dbc2" strokeWidth="3.5" opacity=".58"/></g>
   <g className="coast-shore" data-testid="vector-landfall" strokeLinecap="round" strokeLinejoin="round">
    <use href={`#${id}-edge`} fill="none" stroke="#244a43" strokeWidth="89" opacity=".2"/>
    <use href={`#${id}-edge`} fill="none" stroke={paint('wet')} strokeWidth="65"/>
    <use href={`#${id}-sand-shape`} fill={paint('sand')}/>
    <use href={`#${id}-sand-shape`} fill={paint('grain')} mask={paint('texture-mask')}/>
    <use href={`#${id}-edge`} fill="none" stroke="#b9c3a3" strokeWidth="3" opacity=".6"/>
    <use className="coast-foam" href={`#${id}-edge`} fill="none" stroke="#d2d8bb" strokeWidth="3.5" transform="translate(15 -13)"/>
    <path d="M1110 949C1280 1094 1250 1269 1375 1444S1610 1739 1720 1909" fill="none" stroke="#bdcfb7" strokeWidth="2.5" opacity=".28"/>
    <path d="M1250 913C1420 1058 1390 1233 1515 1408S1750 1703 1860 1873" fill="none" stroke="#b0c9b2" strokeWidth="2" opacity=".22"/>
    <ellipse cx="290" cy="1030" rx="640" ry="235" fill={paint('sandlight')}/>
    <path d="M-160 881C140 820 340 957 660 900M-160 1008C130 948 330 1104 731 1045M-160 1260C185 1172 394 1320 780 1287" fill="none" stroke={paint('dune-shadow')} strokeWidth="12" filter={paint('soften')}/>
    <path d="M-160 873C140 812 340 949 660 892M-160 999C130 939 330 1095 731 1036M-160 1248C185 1160 394 1308 780 1275" fill="none" stroke={paint('ripple')} strokeWidth="2"/>
    <ellipse cx="770" cy="982" rx="205" ry="30" fill={paint('shadow')}/>
   </g>
  </svg>
  <div className="coast-sky-details"><svg className="coast-sun" viewBox="0 0 100 100" focusable="false"><circle cx="50" cy="50" r="50" fill="#e8d7a1"/></svg><CoastClouds/></div>
 </div>;
}

function CoastClouds(){
 const id='cloud-'+useId().replace(/[^a-zA-Z0-9]/g,'');
 return <div className="coast-clouds" data-testid="vector-clouds">
  <svg width="0" height="0" className="coast-definitions" focusable="false"><defs>
   <linearGradient id={`${id}-body`} x1=".3" y1="0" x2=".7" y2="1"><stop stopColor="#e5e5ce"/><stop offset=".43" stopColor="#d8ddc8"/><stop offset=".77" stopColor="#aabfb5"/><stop offset="1" stopColor="#7d9f9f"/></linearGradient>
   <linearGradient id={`${id}-light`} x2=".6" y2="1"><stop stopColor="#eee8cf"/><stop offset="1" stopColor="#bacbb9"/></linearGradient>
   <symbol id={`${id}-shape`} viewBox="0 0 600 240">
    <path d="M42 188C15 180 19 143 57 136C48 99 83 73 119 85C130 33 197 20 232 54C267-2 356 1 385 65C429 36 483 65 486 104C529 88 558 117 550 146C596 143 600 190 562 202C459 230 143 226 42 188Z" fill={`url(#${id}-body)`}/>
    <path d="M61 137C59 107 91 89 121 103C129 59 187 42 220 71C237 37 278 26 309 42C266 39 245 66 249 96C212 69 166 90 165 127C130 103 96 115 91 146Z" fill={`url(#${id}-light)`} opacity=".86"/>
    <path d="M331 40C359 44 377 66 380 88C423 63 463 90 461 126C498 100 538 126 529 153C501 130 474 138 460 154C444 123 404 112 376 136C389 91 363 57 331 40Z" fill={`url(#${id}-light)`} opacity=".7"/>
    <path d="M72 186C185 203 332 209 521 184C452 221 171 228 72 186Z" fill="#9dbdbb" opacity=".2"/>
   </symbol>
  </defs></svg>
  {['west','east','distant'].map(position=><svg key={position} className={`coast-cloud coast-cloud-${position}`} viewBox="0 0 600 240" focusable="false"><use href={`#${id}-shape`}/></svg>)}
 </div>;
}

