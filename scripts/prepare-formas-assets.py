"""Prepare the owner's five FORMAS designs for Pigment Atoll / Portfolio B."""
import argparse,json,pathlib,subprocess,re
parser=argparse.ArgumentParser()
parser.add_argument('--source-root',required=True)
parser.add_argument('--ffmpeg',default='outputs/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe')
args=parser.parse_args()
root=pathlib.Path(args.source_root)
out=pathlib.Path('public/portfolio/formas');out.mkdir(parents=True,exist_ok=True)
work=pathlib.Path('outputs/formas-review');work.mkdir(parents=True,exist_ok=True)
ffmpeg=args.ffmpeg

def run(*options):subprocess.run([ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
images=[('POSTER SOSKAM fix.png','01-goes-to-school-poster.webp'),('STICKER/BUNDLING STICKER 1.png','02-sticker-bundle.webp'),('2025/FEEDS/SNBP/FEEDS SNBP.png','03-snbp-welcome-poster.webp')]
for source,name in images:
 run('-i',root/source,'-frames:v',1,'-c:v','libwebp','-quality',94,'-compression_level',6,'-y',out/name)
 print(name+' '+str((out/name).stat().st_size)+' bytes',flush=True)
videos=[('logooo.mp4','04-logo-visual',1.5,2),('Visual Gabungan.mp4','05-welcoming-party-visual',6,6)]
manifest={'project':'FORMAS Semarang','softwareCredit':'Adobe Photoshop','creditSource':'Confirmed by the portfolio owner','slideOrder':['Poster','Sticker','Poster Welcome','Visual logo','Visual welcoming party'],'images':[],'videos':[]}
for source,name in images:manifest['images'].append({'source':source,'media':'/portfolio/formas/'+name,'bytes':(out/name).stat().st_size})
for source,name,poster_at,interval in videos:
 info=subprocess.run([ffmpeg,'-hide_banner','-i',str(root/source)],capture_output=True,text=True,errors='replace').stderr
 duration=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',info)
 seconds=sum(float(value)*factor for value,factor in zip(duration.groups(),[3600,60,1]))
 has_audio='Audio:' in info
 run('-i',root/source,'-vf',f'fps=1/{interval},scale=480:-2,tile=4x1','-frames:v',1,'-y',work/(name+'-review.png'))
 run('-i',root/source,'-map','0:v:0','-map','0:a:0?','-vf','scale=1280:720,setsar=1','-c:v','libx264','-preset','medium','-crf',22,'-pix_fmt','yuv420p','-threads',4,'-c:a','aac','-b:a','160k','-movflags','+faststart','-map_metadata','-1','-y',out/(name+'.mp4'))
 run('-ss',poster_at,'-i',root/source,'-frames:v',1,'-vf','scale=1280:720,setsar=1','-c:v','libwebp','-quality',94,'-y',out/(name+'.webp'))
 manifest['videos'].append({'source':source,'media':'/portfolio/formas/'+name+'.mp4','poster':'/portfolio/formas/'+name+'.webp','duration':seconds,'hasAudio':has_audio,'width':1280,'height':720,'bytes':(out/(name+'.mp4')).stat().st_size})
 print(name+' '+str(seconds)+' s / '+str((out/(name+'.mp4')).stat().st_size)+' bytes / audio '+str(has_audio),flush=True)
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Prepared all five original works without cropping the artwork or shortening the videos.',flush=True)
