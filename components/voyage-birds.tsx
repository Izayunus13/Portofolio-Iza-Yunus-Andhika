/** Share the exact 32 shaded seagull poses and wing timing with the portfolio opening. */
export function VoyageBirds({variant='opening'}:{variant?:'opening'|'harbor'}){
 return <div className={`cloud-birds ${variant==='harbor'?'harbor-birds':''}`} data-testid={variant==='harbor'?'summit-birds':'intro-birds'} data-renderer="atlas" data-birds="3" aria-hidden="true">
  {[0,1,2].map(index=><span key={index} className={'cloud-bird-flight cloud-bird-'+index}><span className="cloud-bird-sprite"><img src="/textures/intro-seagull-atlas.webp" width="4096" height="128" alt="" decoding="async" draggable={false}/></span></span>)}
 </div>;
}
