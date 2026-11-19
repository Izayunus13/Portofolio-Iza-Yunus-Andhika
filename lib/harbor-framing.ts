// Match a cover-cropped poster with the live perspective camera at every screen ratio.
export const harborBaseFov=48;
export function harborReferenceViewport(width:number){
 return width<=700?{width:390,height:844}:{width:1440,height:1000};
}
export function harborVerticalFov(width:number,height:number){
 const reference=harborReferenceViewport(width),aspect=width/Math.max(1,height);
 const cover=Math.min(1,(reference.width/reference.height)/aspect);
 return Math.atan(Math.tan(harborBaseFov*Math.PI/360)*cover)*360/Math.PI;
}
