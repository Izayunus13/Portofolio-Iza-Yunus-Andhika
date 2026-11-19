"""Prepare the owner's school posters for Pigment Atoll / Portfolio A."""
import argparse,json,pathlib,re,subprocess

BASE='SMAN 1 MADIUN/No Export/POSTER GERAK/HASIL/pr/'
WORKS=[
 ('SMAN 1 MADIUN/Poster Gerak/POSTER LUMI.mp4','01-lumi',6),
 ('Poster HIVI.mp4','15-hivi',7),
 ('Vierratale.mp4','16-vierratale',6),
 (BASE+'Happy New Year 2022-.mp4','03-new-year-2022',3),
 (BASE+'KANDIDAT 01 --.mp4','04-candidate-01',3),
 (BASE+'KETUA MPK BARU --.mp4','05-mpk-chairperson',3),
 (BASE+'Poster 17 AGUSTUS 2022.mp4','06-independence-day-2022',3),
 (BASE+'Poster Classmeet Universal.mp4','07-universal-classmeet',3),
 (BASE+'Poster Tahun Baru Imlek 2022.mp4','08-lunar-new-year-2022',3),
 (BASE+'RUNDOWN MAGNIFICENT (NO SOUND).mp4','09-magnificent-rundown',3),
 (BASE+'Waisak 2022.mp4','10-waisak-2022',3),
 ('SMAN 1 MADIUN/No Export/POSTER GERAK/Classmeet/poster gerak/Rethera 2.0 Poster Global ----.mp4','11-rethera-2',3),
 (BASE+'HARI PAHLAWAN.mp4','12-heroes-day',4),
 (BASE+'MAULID NABI.mp4','13-maulid-nabi',3),
 ('SMAN 2 MADIUN/Hari Bumi Internasional.jpg','14-earth-day',0),
 ('SMAN 5 MADIUN/TWIBBON SMALA SOUND.mp4','02-smala-twibbon',8),
]

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--source-root',required=True)
 parser.add_argument('--downloads-root',default=str(pathlib.Path.home()/'Downloads'))
 parser.add_argument('--only',nargs='+',choices=[stem for _,stem,_ in WORKS],help='Prepare selected assets and retain existing manifest entries for the others.')
 parser.add_argument('--ffmpeg',default='outputs/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe')
 parser.add_argument('--review-only',action='store_true')
 args=parser.parse_args()
 root=pathlib.Path(args.source_root)
 downloads=pathlib.Path(args.downloads_root)
 selected=set(args.only or [stem for _,stem,_ in WORKS])
 def source_path(source,stem):return (downloads if stem in {'15-hivi','16-vierratale'} else root)/source
 missing=[source for source,stem,_ in WORKS if stem in selected and not source_path(source,stem).is_file()]
 if missing: raise FileNotFoundError('\n'.join(missing))
 out=pathlib.Path('public/portfolio/school-posters')
 review=pathlib.Path('outputs/school-posters-review');review.mkdir(parents=True,exist_ok=True)
 if not args.review_only:out.mkdir(parents=True,exist_ok=True)
 def run(*options):
  subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
 previous=json.loads((out/'manifest.json').read_text(encoding='utf-8')) if (out/'manifest.json').is_file() else {'works':[]}
 retained={pathlib.Path(entry['media']).stem:entry for entry in previous['works']}
 manifest={'project':'School graphic design & poster visualization','role':'Graphic Designer & Poster Visualization','software':['Adobe Photoshop','Adobe Premiere Pro','Adobe After Effects'],'creditSource':'Confirmed by the portfolio owner','works':[]}
 for source,stem,poster_at in WORKS:
  if stem not in selected:
   if not args.review_only:manifest['works'].append(retained[stem])
   continue
  path=source_path(source,stem)
  info=subprocess.run([args.ffmpeg,'-hide_banner','-i',str(path)],capture_output=True,text=True,errors='replace').stderr
  video_line=next(line for line in info.splitlines() if 'Video:' in line)
  width,height=map(int,re.search(r'\b(\d{3,5})x(\d{3,5})\b',video_line).groups())
  video=path.suffix.lower()=='.mp4'
  entry={'source':source,'sourceRoot':'downloads' if stem in {'15-hivi','16-vierratale'} else 'portfolio','sourceBytes':path.stat().st_size,'mediaType':'video' if video else 'image'}
  if video:
   duration=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',info)
   seconds=sum(float(v)*factor for v,factor in zip(duration.groups(),[3600,60,1]))
   fps=min(30,float(re.search(r'([\d.]+) fps',video_line).group(1)))
   target_width=min(720,width)//2*2;target_height=round(height/width*target_width/2)*2
   if args.review_only:
    interval=seconds/4
    run('-ss',min(1,seconds/10),'-i',path,'-vf',f'fps=1/{interval},scale=240:-2,tile=4x1','-frames:v',1,'-y',review/(stem+'.jpg'))
   else:
    filters=f'scale={target_width}:{target_height},setsar=1,fps={fps}'
    run('-i',path,'-map','0:v:0','-map','0:a:0?','-vf',filters,'-c:v','libx264','-preset','medium','-crf',22,'-pix_fmt','yuv420p','-threads',4,'-c:a','aac','-b:a','128k','-movflags','+faststart','-map_metadata','-1','-y',out/(stem+'.mp4'))
    run('-ss',poster_at,'-i',path,'-frames:v',1,'-vf',f'scale={target_width}:{target_height},setsar=1','-c:v','libwebp','-quality',94,'-y',out/(stem+'.webp'))
    entry.update(media='/portfolio/school-posters/'+stem+'.mp4',poster='/portfolio/school-posters/'+stem+'.webp',width=target_width,height=target_height,duration=seconds,fps=fps,hasAudio='Audio:' in info,posterTime=poster_at,bytes=(out/(stem+'.mp4')).stat().st_size)
  elif not args.review_only:
   run('-i',path,'-frames:v',1,'-c:v','libwebp','-quality',94,'-compression_level',6,'-y',out/(stem+'.webp'))
   entry.update(media='/portfolio/school-posters/'+stem+'.webp',width=width,height=height,bytes=(out/(stem+'.webp')).stat().st_size)
  manifest['works'].append(entry)
  print(stem+(' reviewed' if args.review_only else ' prepared: '+str(entry['bytes'])+' bytes'),flush=True)
 if not args.review_only:
  (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  before=sum(x['sourceBytes'] for x in manifest['works']);after=sum(x['bytes'] for x in manifest['works'])
  print(f'All {len(WORKS)} works prepared, {before/1e6:.1f} MB -> {after/1e6:.1f} MB. Full video durations, original aspect ratios and available sound preserved.',flush=True)

if __name__=='__main__':main()
