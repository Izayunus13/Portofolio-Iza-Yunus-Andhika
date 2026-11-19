"""Prepare source-accurate one-minute excerpts for the Bangkit camera portfolio."""
import argparse,json,pathlib,subprocess,sys,urllib.request
parser=argparse.ArgumentParser()
parser.add_argument('--source',default='outputs/film-source/original.mp4')
parser.add_argument('--ffmpeg')
args=parser.parse_args()
sys.path.insert(0,str(pathlib.Path('outputs/media-tools').resolve()))
if args.ffmpeg:
    ffmpeg=args.ffmpeg
else:
    import imageio_ffmpeg
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
source=pathlib.Path(args.source)
if not source.is_file(): raise SystemExit('Download the authorized source video before preparing excerpts.')
out=pathlib.Path('public/portfolio/bangkit');out.mkdir(parents=True,exist_ok=True)
work=pathlib.Path('outputs/film-review');work.mkdir(parents=True,exist_ok=True)
clips=[
    {'id':'01-establishing-space','start':15,'end':75,'posterAt':30},
    {'id':'02-dialogue-coverage','start':180,'end':240,'posterAt':195},
    {'id':'03-character-and-details','start':250,'end':310,'posterAt':255},
    {'id':'04-night-coverage','start':395,'end':455,'posterAt':420},
]
def run(*options):
    subprocess.run([ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
thumbnail_url='https://i.ytimg.com/vi/KTGtOQgDrOo/maxresdefault.jpg'
try:
    urllib.request.urlretrieve(thumbnail_url,work/'official-thumbnail.jpg')
except Exception:
    thumbnail_url='https://i.ytimg.com/vi/KTGtOQgDrOo/hqdefault.jpg'
    urllib.request.urlretrieve(thumbnail_url,work/'official-thumbnail.jpg')
run('-i',work/'official-thumbnail.jpg','-frames:v',1,'-c:v','libwebp','-lossless',1,'-y',out/'cover.webp')
for clip in clips:
    duration=clip['end']-clip['start']
    if duration!=60: raise ValueError('Each requested excerpt must be exactly one minute.')
    video=out/(clip['id']+'.mp4')
    run('-ss',clip['start'],'-i',source,'-t',duration,
        '-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','fast','-crf',23,
        '-pix_fmt','yuv420p','-threads',4,'-c:a','aac','-b:a','128k',
        '-af','afade=t=in:st=0:d=0.08,afade=t=out:st=59.85:d=0.15',
        '-movflags','+faststart','-map_metadata','-1','-y',video)
    poster=out/(clip['id']+'.webp')
    run('-ss',clip['posterAt'],'-i',source,'-frames:v',1,'-c:v','libwebp','-lossless',1,'-y',poster)
    clip['duration']=duration
    clip['media']='/portfolio/bangkit/'+video.name
    clip['poster']='/portfolio/bangkit/'+poster.name
    clip['bytes']=video.stat().st_size
    print('Prepared '+clip['id']+' / 60 seconds / '+str(clip['bytes'])+' bytes',flush=True)
manifest={
    'project':'Bangkit',
    'sourceTitle':'Jawa Pos SMA Awards 2021 - Cinematography - SMA Negeri 1 Madiun',
    'sourceUrl':'https://www.youtube.com/watch?v=KTGtOQgDrOo',
    'publisher':'SMAN 1 MADIUN',
    'sourceDuration':573,
    'creditedRole':{'name':'Iza Yunus Andhika','role':'Cameraman','source':'Publisher video description'},
    'thumbnailUrl':thumbnail_url,
    'cover':'/portfolio/bangkit/cover.webp',
    'encoding':'1280x720 H.264, yuv420p, AAC, faststart; original camera framing retained; brief audio boundary fades only.',
    'clips':clips,
}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'clips':len(clips),'eachSeconds':60,'totalSeconds':240,'manifest':str(out/'manifest.json')},indent=2))

