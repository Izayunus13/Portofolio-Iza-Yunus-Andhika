import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';

type Scene='summit'|'forest';

// Show the vector landscape only if 3D fails, so loading never switches between two mountains.
const mainMountain='M420 872C510 807 579 724 638 669C689 624 719 567 768 528C805 498 839 465 866 416C881 390 901 383 914 360C925 338 938 324 952 330C968 334 969 353 986 367C1003 391 1019 402 1038 431C1066 476 1097 501 1132 529C1188 574 1212 631 1281 667C1350 712 1430 740 1510 845V1040H420Z';
const gullies=[
 ['M916 369C895 429 859 463 838 509S771 587 732 651S648 765 574 849','M924 363C907 426 874 470 850 520S794 591 755 660S679 782 603 870'],
 ['M934 344C921 424 900 474 878 532S846 634 807 694S758 802 718 934','M940 348C932 427 915 485 898 544S871 650 836 711S792 829 771 946'],
 ['M950 338C956 415 939 460 947 529S930 622 955 692S952 821 973 956','M956 349C967 427 954 478 969 547S956 646 981 721S988 839 1011 968'],
 ['M975 379C998 441 1000 490 1032 555S1054 656 1095 716S1137 830 1191 932','M983 383C1015 449 1017 507 1050 569S1079 679 1120 742S1167 854 1220 937'],
 ['M1033 429C1059 490 1090 521 1117 577S1172 661 1209 709S1311 808 1391 896','M1042 437C1077 490 1110 535 1141 594S1193 677 1232 729S1331 828 1412 910']
];

export function MountainLandscape({scene,active=true,animated=true,onReady}:{scene:Scene;active?:boolean;animated?:boolean;onReady?:()=>void}){
 const host=useRef<HTMLDivElement>(null),ready=useRef(onReady),motionEnabled=useRef(animated),environmentRef=useRef<import('../lib/prologue-terrain').MountainEnvironment|null>(null);ready.current=onReady;motionEnabled.current=animated;
 const [renderer,setRenderer]=useState<'pending'|'webgl'|'fallback'>('pending');
 useEffect(()=>{
  if(!active)return;let cancelled=false,environment:import('../lib/prologue-terrain').MountainEnvironment|null=null;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=()=>environment?.setReduced(media.matches||!motionEnabled.current);media.addEventListener('change',motion);
  void import('../lib/prologue-terrain').then(({createMountainEnvironment})=>{
   if(cancelled||!host.current)return;
   try{environment=createMountainEnvironment(host.current,scene,media.matches||!motionEnabled.current);environmentRef.current=environment;}catch{environment=null;}
   if(!cancelled){setRenderer(environment?'webgl':'fallback');ready.current?.();}
  }).catch(()=>{if(!cancelled){setRenderer('fallback');ready.current?.();}});
  return()=>{cancelled=true;media.removeEventListener('change',motion);environment?.dispose();environmentRef.current=null;};
 },[active,scene]);
 useEffect(()=>{environmentRef.current?.setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches||!animated);},[animated]);
 const id='mountain-'+useId().replace(/[^a-zA-Z0-9]/g,'');
 const paint=(name:string)=>`url(#${id}-${name})`;
 return <div className={`mountain-landscape mountain-landscape-${scene}`} data-testid={`mountain-${scene}`} data-renderer={renderer} aria-hidden="true">
  {scene==='summit'&&<picture className="mountain-poster" data-testid="summit-poster">
   <source media="(max-width: 700px)" srcSet="/images/prologue/summit-phone.webp"/>
   <img src="/images/prologue/summit-desktop.webp" width="3000" height="1000" alt="" loading="eager" fetchPriority="high" decoding="sync" draggable={false}/>
  </picture>}
  <div ref={host} className="mountain-environment" data-testid={`mountain-environment-${scene}`}/>
  {renderer==='fallback'&&<svg viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" focusable="false" data-terrain="sculpted-vector">
   <defs>
    <linearGradient id={`${id}-sky`} x2=".2" y2="1"><stop stopColor="#78959a"/><stop offset=".65" stopColor="#b2beb0"/><stop offset="1" stopColor="#d1d0af"/></linearGradient>
    <radialGradient id={`${id}-dawn`}><stop stopColor="#f1d8a3" stopOpacity=".6"/><stop offset="1" stopColor="#e0c493" stopOpacity="0"/></radialGradient>
    <linearGradient id={`${id}-far`} x2=".4" y2="1"><stop stopColor="#8ba7a2"/><stop offset="1" stopColor="#b7c7b7"/></linearGradient>
    <linearGradient id={`${id}-face`} x2=".7" y2="1"><stop stopColor="#a6ad8e"/><stop offset=".3" stopColor="#7d957b"/><stop offset=".64" stopColor="#4b7769"/><stop offset="1" stopColor="#294f46"/></linearGradient>
    <linearGradient id={`${id}-shade`} x2="1" y2=".55"><stop stopColor="#718b7a" stopOpacity=".1"/><stop offset=".4" stopColor="#365d57" stopOpacity=".65"/><stop offset="1" stopColor="#163b3b" stopOpacity=".8"/></linearGradient>
    <linearGradient id={`${id}-channel`} x2=".3" y2="1"><stop stopColor="#293e34" stopOpacity="0"/><stop offset=".3" stopColor="#284d42" stopOpacity=".45"/><stop offset=".75" stopColor="#244e41" stopOpacity=".6"/><stop offset="1" stopColor="#244e41" stopOpacity="0"/></linearGradient>
    <linearGradient id={`${id}-ridge`} x2=".2" y2="1"><stop stopColor="#d8c59b" stopOpacity=".07"/><stop offset=".5" stopColor="#b1b18c" stopOpacity=".12"/><stop offset="1" stopColor="#d4d2a7" stopOpacity="0"/></linearGradient>
    <radialGradient id={`${id}-mist`}><stop stopColor="#c5d4c0" stopOpacity=".65"/><stop offset="1" stopColor="#b8cabb" stopOpacity="0"/></radialGradient>
    <linearGradient id={`${id}-rock`} x2=".6" y2="1"><stop stopColor="#a5a17f"/><stop offset=".35" stopColor="#6c7c60"/><stop offset="1" stopColor="#334f40"/></linearGradient>
    <linearGradient id={`${id}-forest`} x2=".25" y2="1"><stop stopColor="#527d64"/><stop offset="1" stopColor="#193f37"/></linearGradient>
    <filter id={`${id}-slope-soft`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id={`${id}-stone`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012 .026" numOctaves="3" seed="13" result="grain"/><feDiffuseLighting in="grain" surfaceScale="4.5" diffuseConstant=".7" lightingColor="#d6d5b5" result="lit"><feDistantLight azimuth="225" elevation="38"/></feDiffuseLighting><feComposite in="lit" in2="SourceGraphic" operator="in"/></filter>
    <clipPath id={`${id}-mountain-clip`}><path d={mainMountain}/></clipPath>
    <path id={`${id}-tree`} d="M0-46C-4-35-7-31-12-26L-7-27C-12-19-17-16-22-12L-12-14C-18-6-25-1-30 3Q-14 5-2 2L-3 15H4L2 2Q18 6 29 2C19-3 14-9 11-15L20-12C13-20 8-23 6-29L12-26C7-33 3-39 0-46Z"/>
   </defs>
   <path d="M0 0H1440V1000H0Z" fill={paint('sky')}/>
   <ellipse cx="240" cy="360" rx="520" ry="360" fill={paint('dawn')}/>
   <path d="M-80 660C34 608 73 524 152 552S281 456 329 409C368 362 404 434 447 437S506 397 544 423C610 468 646 549 698 562S790 518 832 465C880 412 932 357 984 344C1021 329 1048 405 1089 440S1170 447 1217 431C1300 402 1401 569 1510 634V1000H-80Z" fill={paint('far')} opacity=".7"/>
   <path d="M-100 774C25 730 112 680 182 603C230 551 263 496 300 500C331 500 351 539 379 529C420 515 454 435 491 437C526 444 571 526 605 562C671 628 737 706 813 725C937 745 1017 678 1100 645C1186 612 1230 540 1277 548C1347 565 1436 675 1510 710V1000H-100Z" fill={paint('face')} opacity=".75"/>
   <path d="M491 437C459 533 444 545 405 601C376 646 348 690 294 727C369 693 415 656 448 607C471 574 507 545 528 513Z" fill={paint('shade')} opacity=".45"/>
   <g data-testid="sculpted-mountain">
    <path d={mainMountain} fill={paint('face')}/>
    <g clipPath={paint('mountain-clip')}>
     <path d="M953 329C958 386 976 423 991 467C1020 540 1011 605 1066 657C1122 712 1117 765 1195 820C1279 877 1317 968 1482 1014H1560V288Z" fill={paint('shade')} filter={paint('slope-soft')}/>
     {gullies.map(([dark,light],i)=><g key={i}>
      <path d={dark} fill="none" stroke={paint('channel')} strokeWidth={24+i*7} strokeLinecap="round" filter={paint('slope-soft')}/>
      <path d={light} fill="none" stroke={paint('ridge')} strokeWidth={.8+i*.15} strokeLinecap="round"/>
     </g>)}
     <path d={mainMountain} fill="#cbd0ae" filter={paint('stone')} opacity=".14"/>
     <path d="M937 350C914 395 893 428 867 458S838 507 807 534C775 560 764 594 733 617C703 641 686 678 659 702" fill="none" stroke={paint('ridge')} strokeWidth="3" opacity=".7"/>
     <path d="M1018 503C1040 558 1040 608 1085 646S1127 717 1174 757" fill="none" stroke={paint('channel')} strokeWidth="4" opacity=".45"/>
    </g>
   </g>
   <ellipse cx="730" cy="730" rx="900" ry="140" fill={paint('mist')}/>
   <ellipse cx="127" cy="643" rx="350" ry="130" fill={paint('mist')} opacity=".6"/>
   {scene==='summit'?<g>
    <path d="M-60 1020C108 964 156 930 258 944C348 957 409 884 486 892C548 900 585 863 640 846C682 832 715 861 754 848C794 832 817 841 854 855C943 886 1010 926 1115 919C1250 909 1379 966 1510 1030Z" fill={paint('rock')}/>
    <path d="M486 892C548 900 585 863 640 846C682 832 715 861 754 848C794 832 817 841 854 855C810 855 789 871 751 870C701 871 683 852 648 866C595 886 551 922 486 913Z" fill="#b1ac86" opacity=".35"/>
    <path d="M716 861C750 902 712 949 787 1005M550 906C537 936 495 954 480 1000" fill="none" stroke="#2e4838" strokeWidth="3" opacity=".18"/>
   </g>:<g>
    <path d="M-80 747C196 570 352 612 574 743S1009 713 1204 612C1283 586 1394 712 1510 765V1050H-80Z" fill={paint('forest')}/>
    <path d="M-80 883C181 691 376 817 615 860S1058 793 1510 843V1050H-80Z" fill="#234b3d" opacity=".85"/>
   </g>}
   <g fill="#315c4b" opacity={scene==='summit'?.52:.75}>
    {Array.from({length:65},(_,i)=>{const x=65+(i*137)%1320,y=743+(i*47)%126+Math.sin(i*.72)*14,scale=.16+(y-725)/230+(i%3)*.025;return <use key={i} href={`#${id}-tree`} transform={`translate(${x} ${y}) scale(${scale})`}/>;})}
   </g>
  </svg>}
  <div className="mountain-distance-mist"/>
 </div>;
}

/** Use the exact feathered cloud texture from the portfolio opening, with its native alpha. */
export function MountainCloudBank({variant}:{variant:'floor'|'background'|'gate-left'|'gate-right'}){
 return <div className={`mountain-cloud-bank mountain-cloud-bank-${variant}`} data-cloud-style="portfolio-opening" data-testid={variant==='floor'?'summit-floor-clouds':variant==='background'?'summit-background-clouds':undefined} aria-hidden="true">
  {[0,1,2,3].map(i=><picture key={i}>
   <source media="(max-width: 700px)" srcSet="/textures/loading-cloud-soft-640.webp"/>
   <img className={`mountain-cloud-puff mountain-cloud-puff-${i}`} src="/textures/loading-cloud-soft-1024.webp" width="1024" height="683" alt="" decoding="async" fetchPriority={variant==='floor'&&i===0?'high':'auto'} draggable={false}/>
  </picture>)}
 </div>;
}

const birds=[{size:64,altitude:24,flight:37,delay:-9,flap:1.45},{size:39,altitude:38,flight:46,delay:-29,flap:1.18},{size:28,altitude:18,flight:52,delay:-38,flap:1.08},{size:48,altitude:47,flight:41,delay:-20,flap:1.34},{size:25,altitude:30,flight:58,delay:-3,flap:1.12}];
export function SummitBirds(){
 const id='summit-bird-'+useId().replace(/[^a-zA-Z0-9]/g,'');
 return <div className="summit-birds" data-testid="summit-birds" aria-hidden="true">
  <svg width="0" height="0" className="mountain-definitions" focusable="false"><defs>
   <linearGradient id={`${id}-wing`} x2=".5" y2="1"><stop stopColor="#627a78"/><stop offset=".35" stopColor="#314d50"/><stop offset="1" stopColor="#192f37"/></linearGradient>
   <linearGradient id={`${id}-body`} x2="0" y2="1"><stop stopColor="#c6c9ae"/><stop offset=".35" stopColor="#6b827c"/><stop offset="1" stopColor="#243f44"/></linearGradient>
   <symbol id={`${id}-feathers`} viewBox="0 0 100 70">
    <path d="M55 67C40 49 24 41 10 32L2 5L13 16L12 0L23 16L27 1L34 20L42 9L47 30C60 38 68 51 76 65Z" fill={`url(#${id}-wing)`}/>
    <path d="M55 61L20 23M53 52L31 19M58 53L43 26" fill="none" stroke="#b3bca4" strokeWidth="1.2" opacity=".28" strokeLinecap="round"/>
   </symbol>
  </defs></svg>
  {birds.map((bird,i)=><div key={i} className="summit-bird-flight" style={{'--bird-size':`${bird.size}px`,'--bird-altitude':`${bird.altitude}%`,'--bird-flight':`${bird.flight}s`,'--bird-delay':`${bird.delay}s`,'--bird-flap':`${bird.flap}s`,'--flap-delay':`${-i*.29}s`} as CSSProperties}>
   <div className="summit-bird-rig">
    <svg className="summit-wing summit-wing-far" viewBox="0 0 100 70" focusable="false"><use href={`#${id}-feathers`}/></svg>
    <svg className="summit-bird-body" viewBox="0 0 100 30" focusable="false"><path d="M15 13L0 5L6 17L0 26L23 20C41 28 63 21 75 17C82 15 87 17 91 13L99 12L91 8C85 2 80 4 74 9C55 4 33 6 15 13Z" fill={`url(#${id}-body)`}/><path d="M91 8L99 12L91 13Z" fill="#ccb88c"/><path d="M27 11Q52 6 70 11" fill="none" stroke="#c2c4ac" strokeWidth="1.4" opacity=".45"/></svg>
    <svg className="summit-wing summit-wing-near" viewBox="0 0 100 70" focusable="false"><g transform="translate(0 70) scale(1 -1)"><use href={`#${id}-feathers`}/></g></svg>
   </div>
  </div>)}
 </div>;
}

export function MountainTrees({variant='forest'}:{variant?:'forest'|'summit'}={}){
 const id='summit-tree-'+useId().replace(/[^a-zA-Z0-9]/g,'');
 const pine=<>
    <path d="M145 632L148 67L155 67L161 632Z" fill={`url(#${id}-trunk)`}/>
    {[[40,.38],[82,.55],[135,.74],[198,.9],[270,1.05],[350,1.18],[433,1.25]].map(([y,scale],i)=><g key={i} transform={`translate(150 ${y}) scale(${scale})`}>
     {[-1,1].map(direction=><g key={direction} transform={`scale(${direction} 1)`}><g className={`pine-branch pine-branch-${direction===1?'left':'right'}`} style={{'--branch-delay':`${-i*.65}s`} as CSSProperties}>
      <path d="M0 0C-5 15-19 32-28 43Q-24 43-18 40C-31 58-42 73-58 86Q-48 83-42 80C-57 101-77 120-96 134Q-78 131-66 124C-83 145-100 157-119 165C-84 170-39 153 4 126C1 82 2 39 0 0Z" fill={`url(#${id}-needles)`}/>
      <path d="M-8 48L-27 65M-20 79L-58 107M-25 113L-76 142" fill="none" stroke="#94a783" strokeWidth="2" opacity=".2" strokeLinecap="round"/>
     </g></g>)}
    </g>)}
 </>;
 return <div className={`mountain-trees mountain-trees-${variant}`} data-testid={`mountain-trees-${variant}`} aria-hidden="true">
  <svg width="0" height="0" className="mountain-definitions" focusable="false"><defs>
   <linearGradient id={`${id}-needles`} x2=".8" y2="1"><stop stopColor="#557c65"/><stop offset=".4" stopColor="#294e41"/><stop offset="1" stopColor="#14382f"/></linearGradient>
   <linearGradient id={`${id}-trunk`}><stop stopColor="#8a9272"/><stop offset="1" stopColor="#314c3b"/></linearGradient>
  </defs></svg>
  {['left','right','distant'].map(side=><svg key={side} className={`mountain-tree mountain-tree-${side}`} viewBox="0 0 300 650" focusable="false">{pine}</svg>)}
 </div>;
}
