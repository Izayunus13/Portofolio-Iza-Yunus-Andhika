import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const input=process.argv[2];
if(!input)throw new Error('Pass the path to Anthrope Personal Use Only.ttf.');
const temp=path.resolve('work/font-tools');await mkdir(temp,{recursive:true});
const parser=path.join(temp,'opentype.module.mjs');
try{await access(parser);}catch{
 const response=await fetch('https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.module.js');
 if(!response.ok)throw new Error('Font parser download failed: '+response.status);
 await writeFile(parser,await response.text());
}
const source=await readFile(new URL('../node_modules/three/examples/jsm/loaders/TTFLoader.js',import.meta.url),'utf8');
const loaderPath=path.join(temp,'TTFLoader.mjs');
await writeFile(loaderPath,source.replace("'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/+esm'","'./opentype.module.mjs'"));
const {TTFLoader}=await import(pathToFileURL(loaderPath).href);
const bytes=await readFile(input);
const data=new TTFLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
const characters=new Set(' ?BytehavenPigment AtollFramewake BayBYTEHAVENPIGMENT ATOLLFRAMEWAKE BAY');
for(const character of characters)if(!data.glyphs[character])throw new Error('Missing font character: '+character);
data.glyphs=Object.fromEntries([...characters].map(c=>[c,data.glyphs[c]]));
// Whitespace has no outline; opentype reports its bounds as NaN.
for(const glyph of Object.values(data.glyphs)){
 if(!Number.isFinite(glyph.x_min))glyph.x_min=0;
 if(!Number.isFinite(glyph.x_max))glyph.x_max=0;
}
data.original_font_information=Object.fromEntries(Object.entries(data.original_font_information).map(([key,value])=>[key,typeof value==='string'?value:(value.en??Object.values(value)[0]??'')]));
await writeFile('lib/fonts/anthrope.typeface.json',JSON.stringify(data)+'\n');
console.log(JSON.stringify({family:data.familyName,glyphs:Object.keys(data.glyphs).length,output:'lib/fonts/anthrope.typeface.json'}));
