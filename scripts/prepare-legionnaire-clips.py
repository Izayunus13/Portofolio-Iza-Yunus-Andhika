"""Export five original film excerpts and the Co-Producer credit for Portfolio B."""
import argparse,json,pathlib,subprocess,sys,urllib.request,ssl
parser=argparse.ArgumentParser()
parser.add_argument('--source',default='outputs/film-b-source/original.mp4')
parser.add_argument('--ffmpeg')
args=parser.parse_args()
sys.path.insert(0,str(pathlib.Path('outputs/media-tools').resolve()))
if args.ffmpeg:
 ffmpeg=args.ffmpeg
else:
 import imageio_ffmpeg
 ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
source=pathlib.Path(args.source)
if not source.is_file():raise SystemExit('The source video is required before excerpts can be prepared.')
out=pathlib.Path('public/portfolio/legionnaire');out.mkdir(parents=True,exist_ok=True)
work=pathlib.Path('outputs/film-b-review');work.mkdir(parents=True,exist_ok=True)
clips=[
 {'id':'01-opening-story','start':120,'end':180,'posterAt':150},
 {'id':'02-classroom-life','start':480,'end':540,'posterAt':500},
 {'id':'03-teacher-and-student-memories','start':1095,'end':1155,'posterAt':1120},
 {'id':'04-cohort-togetherness','start':2280,'end':2340,'posterAt':2305},
 {'id':'05-closing-reflection','start':2520,'end':2580,'posterAt':2560},
]
def run(*options):
 subprocess.run([ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
thumbnail_url='https://i.ytimg.com/vi/EoJ8pQyXcTA/maxresdefault.jpg'
roots=pathlib.Path('outputs/media-tools/windows-roots.pem')
context=ssl.create_default_context(cafile=str(roots)) if roots.is_file() else ssl.create_default_context()
try:
 with urllib.request.urlopen(thumbnail_url,context=context,timeout=30) as response:(work/'official-thumbnail.jpg').write_bytes(response.read())
except Exception:
 thumbnail_url='https://i.ytimg.com/vi/EoJ8pQyXcTA/hqdefault.jpg'
 with urllib.request.urlopen(thumbnail_url,context=context,timeout=30) as response:(work/'official-thumbnail.jpg').write_bytes(response.read())
run('-i',work/'official-thumbnail.jpg','-frames:v',1,'-c:v','libwebp','-quality',94,'-y',out/'cover.webp')
for clip in clips:
 duration=clip['end']-clip['start']
 video=out/(clip['id']+'.mp4')
 run('-ss',clip['start'],'-i',source,'-t',duration,'-map','0:v:0','-map','0:a:0?',
 '-c:v','libx264','-preset','fast','-crf',24,'-pix_fmt','yuv420p','-threads',4,
 '-c:a','aac','-b:a','128k','-af','afade=t=in:st=0:d=0.08,afade=t=out:st=59.85:d=0.15',
 '-movflags','+faststart','-map_metadata','-1','-y',video)
 poster=out/(clip['id']+'.webp')
 run('-ss',clip['posterAt'],'-i',source,'-frames:v',1,'-c:v','libwebp','-quality',94,'-y',poster)
 clip.update(duration=duration,media='/portfolio/legionnaire/'+video.name,poster='/portfolio/legionnaire/'+poster.name,bytes=video.stat().st_size)
 print('Prepared '+clip['id']+' / '+str(duration)+' seconds / '+str(clip['bytes'])+' bytes',flush=True)
run('-ss',2635,'-i',source,'-frames:v',1,'-c:v','libwebp','-lossless',1,'-y',out/'06-co-producer-credit.webp')
manifest={
 'project':'Légionnaire',
 'sourceTitle':'Légionnaire | Catatan Akhir Sekolah 75 - SMAN 1 MADIUN 2024',
 'sourceUrl':'https://www.youtube.com/watch?v=EoJ8pQyXcTA',
 'publisher':'SMAN 1 MADIUN','sourceDuration':2728,'publishedDate':'2024-04-22',
 'creditedRole':{'name':'Iza Yunus Andhika','role':'Co-Producer','source':'Production Department end credits at 43:55; contributions confirmed by the portfolio owner','contributions':['Assisting direction','Equipment preparation and support','Practical production support']},
 'thumbnailUrl':thumbnail_url,'cover':'/portfolio/legionnaire/cover.webp',
 'creditStill':{'media':'/portfolio/legionnaire/06-co-producer-credit.webp','sourceTime':2635},
 'encoding':'Original 1280x720 framing; H.264 yuv420p, AAC, faststart; brief audio boundary fades only.','clips':clips,
}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Ready: five excerpts, five posters, official thumbnail, and production credit.',flush=True)
