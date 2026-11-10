import type { CSSProperties } from 'react';

export function Ship({ className = '', pirate = true }: { className?: string; pirate?: boolean }) {
  return <svg className={className} viewBox="0 0 420 360" fill="none" aria-hidden="true">
    <g className="ship-rock">
      <path d="M71 257Q191 285 350 245L319 292Q212 329 108 291Z" fill="#B97751" stroke="#315E58" strokeWidth="3" />
      <path d="M88 275Q214 308 338 263L329 279Q213 319 99 288Z" fill="#416F64" />
      <path d="M87 256Q217 278 352 245" stroke="#E8B578" strokeWidth="9" strokeLinecap="round" />
      <path d="M173 266V72M271 261V128" stroke="#5E705B" strokeWidth="7" strokeLinecap="round" />
      <path d="M175 91Q142 147 105 185Q143 176 175 188Z" fill="#EEE2BF" stroke="#708C71" strokeWidth="2" />
      <path d="M185 96Q242 140 235 218Q214 206 184 220Q202 156 185 96Z" fill="#FFFAE9" stroke="#A6AD8C" strokeWidth="2" />
      <path d="M266 147Q298 170 320 221Q293 212 274 227Z" fill="#E9D5AF" stroke="#8B9A79" strokeWidth="2" />
      <path d="M175 79Q217 58 249 83L242 112Q210 89 175 105Z" fill="#244D49" />
      <g fill="#FFF7DD"><path d="M211 84a8 8 0 1 1 16 0c0 5-3 6-4 8h-8c-1-2-4-3-4-8Z" /><path d="m209 96 22 8m0-8-22 8" stroke="#FFF7DD" strokeWidth="3" strokeLinecap="round" /></g>
      <circle cx="216" cy="83" r="1.7" fill="#244D49" /><circle cx="223" cy="83" r="1.7" fill="#244D49" />
      <path d="M174 123 80 255M272 154 351 245M175 72 272 128" stroke="#607E67" strokeWidth="1.5" />
      {[135, 183, 232, 282].map((x) => <g key={x}><circle cx={x} cy="284" r="8" fill="#EAC38B" /><circle cx={x} cy="284" r="4" fill="#315E58" /></g>)}
      <path d="M87 249v-20h26v25M308 249v-19h26v15" fill="#CF9565" stroke="#466F5D" strokeWidth="2" />
      {pirate && <g className="captain-wave">
        <path d="m117 248 3-29 22-2 10 33" fill="#E48F78" stroke="#315E58" strokeWidth="2" />
        <path d="m119 232 24 1m-23 7 27 2" stroke="#FFF5D9" strokeWidth="4" />
        <circle cx="131" cy="210" r="14" fill="#EDBB8D" stroke="#315E58" strokeWidth="2" />
        <path d="M113 207q-3-12 7-11l11-12 12 12q12-2 9 11Z" fill="#315E58" /><path d="m114 204 35-1" stroke="#EBC581" strokeWidth="3" />
        <path d="m122 209 17 0" stroke="#315E58" strokeWidth="2" /><circle cx="126" cy="210" r="4" fill="#315E58" /><circle cx="137" cy="211" r="1.5" fill="#315E58" />
        <path d="M129 219q5 3 8-1" stroke="#8B6049" strokeWidth="1.5" strokeLinecap="round" />
        <path className="waving-arm" d="m145 227 11-12 2-13" stroke="#EDBB8D" strokeWidth="7" strokeLinecap="round" />
      </g>}
    </g>
    <path d="M70 306q17 10 33 0m32 16q23 10 45 0m73-5q24 10 49 0m32-13q15 6 29-3" stroke="#6EA99B" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}

export function Fish({ className = '', color = '#EBA38A', style }: { className?: string; color?: string; style?: CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 100 60" fill="none" aria-hidden="true"><path d="M23 30 5 12v36Zm0 0q27-35 65 0Q50 65 23 30Z" fill={color} /><path d="m52 14-8-9 22 4M53 46l-6 9 20-7" fill={color} /><circle cx="75" cy="27" r="3" fill="#244D49" /><path d="M65 19q-7 11 0 22" stroke="#244D49" strokeOpacity=".25" strokeWidth="2" /></svg>;
}

export function Compass({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true"><circle cx="60" cy="60" r="42" stroke="currentColor" strokeWidth="1" /><circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth=".6" strokeDasharray="2 5" /><path d="m60 19 9 32 32 9-32 9-9 32-9-32-32-9 32-9Z" fill="currentColor" opacity=".15" /><path d="m60 26 8 34-8 34-8-34Z" fill="currentColor" /><path d="m26 60 34-8 34 8-34 8Z" stroke="currentColor" /><circle cx="60" cy="60" r="4" fill="#FCF8ED" /><text x="60" y="12" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="sans-serif">N</text><text x="60" y="117" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="sans-serif">S</text><text x="8" y="64" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="sans-serif">W</text><text x="113" y="64" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="sans-serif">E</text></svg>;
}

export function OceanScene({ onSail }: { onSail: () => void }) {
  return <div className="ocean-scene" aria-label="An illustrated pirate ship sailing past a tropical island">
    <svg className="scene-backdrop" viewBox="0 0 700 610" fill="none" aria-hidden="true">
      <defs><clipPath id="sea-clip"><path d="M36 361Q-1 256 69 169Q131 78 269 93Q411-1 552 106Q670 181 650 312Q714 450 602 515Q450 587 297 550Q98 580 36 461Z" /></clipPath></defs>
      <path d="M36 361Q-1 256 69 169Q131 78 269 93Q411-1 552 106Q670 181 650 312Q714 450 602 515Q450 587 297 550Q98 580 36 461Z" fill="#E6ECDD" />
      <g clipPath="url(#sea-clip)">
        <circle cx="510" cy="161" r="54" fill="#E9B191" /><circle cx="510" cy="161" r="68" stroke="#E9B191" strokeOpacity=".35" strokeWidth="1" />
        <path d="M-7 339q129-53 271-10t300-13 145 16v300H0Z" fill="#BAD7C8" />
        <path d="M-7 391q117-43 275-10t288-1 156 19v220H0Z" fill="#8EBEAF" />
        <path d="M-7 469q120-43 280-4t285-14 154 20v170H0Z" fill="#72A99C" />
        <path d="M-7 525q120-29 280 4t285-7 154 15v80H0Z" fill="#578F83" />
        <path d="M483 334q30-40 85-34t89 37Z" fill="#EBDBAA" />
        <path d="M560 310q19-69-3-102" stroke="#9A8660" strokeWidth="9" strokeLinecap="round" />
        <path d="M558 212q-45-40-70 5 37-14 69 1m1-6q-14-56 28-54-20 24-25 53m-3 2q36-41 62-3-33-7-58 8m-4-6q-39-18-49-2 24 0 44 10m6-5q19 2 28 28-23-9-29-28" fill="#65977A" />
        <g stroke="#E3EFE0" strokeWidth="2" strokeLinecap="round" opacity=".7"><path d="M73 373h53m304-19h45m111 13h36M57 451h36m404-37h35M152 491h51m232 15h53M288 546h38m231-62h29" /></g>
      </g>
      <g fill="#FCF8ED" className="clouds"><path d="M91 178q-9-16 9-21 3-23 26-17 21-13 32 6 29-1 26 22 17 15-5 17H97Z" /><path d="M350 125q-9-13 8-20 3-21 23-15 17-12 27 5 23-1 22 18 14 13-4 15H355Z" /></g>
      <path d="M277 160q9-10 19 0 8-10 17 0M423 240q7-8 15 0 8-8 15 0M199 101q6-7 12 0 6-7 12 0" stroke="#6C8F7D" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M150 332C51 350 55 445 187 446S558 378 578 445 433 546 345 512" stroke="#F9F4DD" strokeWidth="2" strokeDasharray="5 9" strokeLinecap="round" />
      <circle cx="150" cy="332" r="6" fill="#FAF3DD" /><path d="m337 506 14 14m0-14-14 14" stroke="#F9F4DD" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(518 458) rotate(-12)"><path d="M0 0h42v26H0Z" fill="#A37851" stroke="#315E58" strokeWidth="2" /><path d="M0 0q21-24 42 0" fill="#C39968" stroke="#315E58" strokeWidth="2" /><path d="M7-7v33m28-33v33" stroke="#E4C17F" strokeWidth="4" /><rect x="17" y="7" width="9" height="9" rx="1" fill="#E4C17F" /></g>
      <g transform="translate(103 511)"><path d="m0-17 5 12 13-2-9 10 5 13-13-6-11 9 1-14-12-6 14-3Z" fill="#E8AA8C" /></g>
    </svg>
    <button className="hero-ship-control" onClick={onSail} aria-label="Set sail to Code Cove"><Ship className="hero-ship" /></button>
    <Fish className="scene-fish fish-one" /><Fish className="scene-fish fish-two" color="#E9D5A4" />
    <div className="scene-note note-code"><span>&lt;/&gt;</span> A mind for code</div>
    <div className="scene-note note-design"><span>✧</span> An eye for design</div>
    <div className="scene-note note-film"><span>▷</span> A heart for stories</div>
    <span className="scene-coordinate">06° S &nbsp; 106° E · IMAGINATION SEA</span>
  </div>;
}

export function Seaweed({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 120 180" fill="none" aria-hidden="true"><path d="M60 180q-30-39-10-79t-3-73m14 152q30-55 14-92T88 9M60 180q-3-45-31-61T10 68m51 112q24-30 36-56t15-27" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /><path d="M45 104Q13 90 27 63q24 13 18 41m29-9q30-12 23-39-23 8-23 39M53 52Q25 45 32 22q24 6 21 30" fill="currentColor" /></svg>;
}

