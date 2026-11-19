"""Prepare four scene-led excerpts from the owner's MADENO Nightride reel."""
import argparse,json,pathlib,subprocess,sys
parser=argparse.ArgumentParser()
parser.add_argument('--source',default='outputs/reel-c-source/original.mp4')
parser.add_argument('--ffmpeg')
args=parser.parse_args()
sys.path.insert(0,str(pathlib.Path('outputs/media-tools').resolve()))
if args.ffmpeg:ffmpeg=args.ffmpeg
else:
 import imageio_ffmpeg
 ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
source=pathlib.Path(args.source)
if not source.is_file():raise SystemExit('The source reel is required.')
out=pathlib.Path('public/portfolio/madeno-nightride');out.mkdir(parents=True,exist_ok=True)
clips=[
 {'id':'01-motorcycle-details','start':6,'end':26,'posterAt':24},
 {'id':'02-rider-preparation','start':30,'end':50,'posterAt':48},
 {'id':'03-night-rolling-shots','start':62,'end':82,'posterAt':72},
 {'id':'04-city-lights','start':94,'end':114,'posterAt':104},
]
def run(*options):subprocess.run([ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
# Retain the original opening frame for the project introduction.
run('-ss',0,'-i',source,'-frames:v',1,'-c:v','libwebp','-quality',94,'-y',out/'cover.webp')
for clip in clips:
 duration=clip['end']-clip['start'];video=out/(clip['id']+'.mp4');poster=out/(clip['id']+'.webp')
 # The 720-square Instagram file contains a wide picture, consistently centered at y=204.
 # This removes only the baked black padding, with four pixels of margin around the picture.
 run('-ss',clip['start'],'-i',source,'-t',duration,'-map','0:v:0','-map','0:a:0?',
 '-vf','crop=720:320:0:200,setsar=1','-c:v','libx264','-preset','fast','-crf',22,'-pix_fmt','yuv420p','-threads',4,
 '-c:a','aac','-b:a','128k','-af',f'afade=t=in:st=0:d=0.06,afade=t=out:st={duration-.12}:d=0.12',
 '-movflags','+faststart','-map_metadata','-1','-y',video)
 run('-ss',clip['posterAt'],'-i',source,'-frames:v',1,'-vf','crop=720:320:0:200','-c:v','libwebp','-quality',94,'-y',poster)
 clip.update(duration=duration,media='/portfolio/madeno-nightride/'+video.name,poster='/portfolio/madeno-nightride/'+poster.name,bytes=video.stat().st_size)
 print('Prepared '+clip['id']+' / '+str(duration)+' seconds / '+str(clip['bytes'])+' bytes',flush=True)
manifest={
 'project':'Nightride with MADENO STUDIOS','sourceUrl':'https://www.instagram.com/reel/CpfJr5cjiRC/',
 'publisher':'MADENO / madenostudios','publicationYear':2023,'sourceDuration':127.967,
 'sourceDimensions':{'width':720,'height':720},'videoDimensions':{'width':720,'height':320},
 'creditedRole':{'name':'Iza Yunus Andhika','role':'Cameraman','source':'Portfolio owner confirmation'},
 'studioCredits':{'video':'MADENO STUDIOS','colourGrading':'MADENO STUDIOS','source':'Original Instagram caption'},
 'cover':'/portfolio/madeno-nightride/cover.webp','coverSourceTime':0,
 'encoding':'H.264 yuv420p, AAC, faststart; source picture and soundtrack retained, with brief boundary fades.',
 'framing':'Original Instagram upload is 720x720; clips remove black padding only using crop=720:320:0:200. No picture stretching or motion reframing.',
 'clips':clips,
}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('Ready: four excerpts, four posters, opening still, and source manifest.',flush=True)
