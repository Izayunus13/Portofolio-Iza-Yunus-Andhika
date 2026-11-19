"""Prepare five consecutive chapters from the owner's local Jingle UNS edit."""
import argparse,json,pathlib,subprocess
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',required=True)
parser.add_argument('--ffmpeg',default='outputs/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe')
args=parser.parse_args();source=pathlib.Path(args.source)
if not source.is_file():raise FileNotFoundError(source)
out=pathlib.Path('public/portfolio/jingle-pkkmb-fh-uns');out.mkdir(parents=True,exist_ok=True)
clips=[
 {'id':'01-opening-campus','start':0,'end':50,'posterTime':33},
 {'id':'02-small-group-performance','start':50,'end':105,'posterTime':77},
 {'id':'03-cohort-transition','start':105,'end':160,'posterTime':121},
 {'id':'04-ensemble-performance','start':160,'end':215,'posterTime':187},
 {'id':'05-finale-credits','start':215,'end':264,'posterTime':231},
]
def run(*options):subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
run('-ss',187,'-i',source,'-frames:v',1,'-vf','scale=1280:720,setsar=1','-c:v','libwebp','-quality',94,'-y',out/'cover.webp')
for clip in clips:
 duration=clip['end']-clip['start']
 run('-ss',clip['start'],'-i',source,'-t',duration,'-map','0:v:0','-map','0:a:0?','-vf','fps=30,scale=1280:720,setsar=1','-c:v','libx264','-preset','fast','-crf',24,'-maxrate','2200k','-bufsize','4400k','-pix_fmt','yuv420p','-threads',4,'-c:a','aac','-b:a','128k','-movflags','+faststart','-map_metadata','-1','-y',out/(clip['id']+'.mp4'))
 run('-ss',clip['posterTime'],'-i',source,'-frames:v',1,'-vf','scale=1280:720,setsar=1','-c:v','libwebp','-quality',94,'-y',out/(clip['id']+'.webp'))
 clip.update(duration=duration,media='/portfolio/jingle-pkkmb-fh-uns/'+clip['id']+'.mp4',poster='/portfolio/jingle-pkkmb-fh-uns/'+clip['id']+'.webp',width=1280,height=720,bytes=(out/(clip['id']+'.mp4')).stat().st_size)
 print('Prepared '+clip['id']+' / '+str(duration)+' seconds',flush=True)
manifest={'project':'Jingle PKKMB FH UNS','sourceFilename':source.name,'sourceBytes':source.stat().st_size,'sourceDuration':264.47,'sourceDimensions':{'width':3840,'height':2160},'role':'Full Editor','roleSource':'Confirmed by the portfolio owner','responsibilities':['Raw-footage selection and assembly','Footage sequencing','Color grading','Sound editing'],'cover':'/portfolio/jingle-pkkmb-fh-uns/cover.webp','coverSourceTime':187,'framing':'Full native 16:9 frame, scaled to 1280x720 with no crop or stretch.','encoding':'H.264, yuv420p, 30fps, CRF 24 with 2200k maxrate / 4400k buffer, AAC 128k, faststart. Source soundtrack preserved.','clips':clips}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('Five consecutive chapters ready; 264 seconds from the 264.47-second supplied source.',flush=True)
