"""Prepare two Tenseiga_Clinic internship motion visuals for Pigment Atoll / Portfolio C."""
import argparse,json,pathlib,re,subprocess
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-root',required=True)
parser.add_argument('--review-only',action='store_true')
parser.add_argument('--ffmpeg',default='outputs/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe')
args=parser.parse_args()
root=pathlib.Path(args.source_root)
works=[('SERUM GOLD ANTI AGING.mp4','01-serum-gold',4),('Visual Tenseiga.mp4','02-clinic-visual',4)]
for source,_,_ in works:
 if not (root/source).is_file():raise FileNotFoundError(root/source)
out=pathlib.Path('public/portfolio/tenseiga-clinic')
review=pathlib.Path('outputs/tenseiga-review');review.mkdir(parents=True,exist_ok=True)
if not args.review_only:out.mkdir(parents=True,exist_ok=True)
def run(*options):subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
manifest={'project':'Tenseiga_Clinic','context':'Internship','works':[]}
for source,stem,poster_at in works:
 path=root/source
 info=subprocess.run([args.ffmpeg,'-hide_banner','-i',str(path)],capture_output=True,text=True,errors='replace').stderr
 duration=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',info)
 seconds=sum(float(v)*factor for v,factor in zip(duration.groups(),[3600,60,1]))
 if args.review_only:
  run('-i',path,'-vf',f'fps=1/{seconds/4},scale=240:-2,tile=4x1','-frames:v',1,'-y',review/(stem+'.jpg'))
 else:
  run('-i',path,'-map','0:v:0','-map','0:a:0?','-vf','scale=720:1280,setsar=1,fps=30','-c:v','libx264','-preset','medium','-crf',22,'-pix_fmt','yuv420p','-threads',4,'-c:a','aac','-b:a','128k','-movflags','+faststart','-map_metadata','-1','-y',out/(stem+'.mp4'))
  run('-ss',poster_at,'-i',path,'-frames:v','1','-vf','scale=720:1280,setsar=1','-c:v','libwebp','-quality',94,'-y',out/(stem+'.webp'))
  manifest['works'].append({'source':source,'sourceBytes':path.stat().st_size,'media':'/portfolio/tenseiga-clinic/'+stem+'.mp4','poster':'/portfolio/tenseiga-clinic/'+stem+'.webp','duration':seconds,'width':720,'height':1280,'fps':30,'hasAudio':'Audio:' in info,'posterTime':poster_at,'bytes':(out/(stem+'.mp4')).stat().st_size})
 print(stem+(' reviewed' if args.review_only else ' prepared'),flush=True)
if not args.review_only:
 (out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
 print('Full durations, native 9:16 framing and available source sound preserved.',flush=True)
