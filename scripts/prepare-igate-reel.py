"""Prepare the owner's complete I-GATE 2025 reel for Framewake Bay / Portfolio E."""
import argparse,json,pathlib,subprocess
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',default='outputs/reel-e-source/original.mp4')
parser.add_argument('--ffmpeg',default='outputs/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe')
args=parser.parse_args()
source=pathlib.Path(args.source)
if not source.is_file():raise FileNotFoundError(source)
out=pathlib.Path('public/portfolio/igate-2025');out.mkdir(parents=True,exist_ok=True)
def run(*options):subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
run('-i',source,'-map','0:v:0','-map','0:a:0?','-vf','scale=1280:792,setsar=1,fps=30','-c:v','libx264','-preset','medium','-crf',22,'-pix_fmt','yuv420p','-threads',4,'-c:a','aac','-b:a','96k','-movflags','+faststart','-map_metadata','-1','-y',out/'igate-2025-reel.mp4')
run('-ss',49,'-i',source,'-frames:v',1,'-vf','scale=1280:792,setsar=1','-c:v','libwebp','-quality',94,'-y',out/'cover.webp')
manifest={'project':'I-GATE 2025','concept':'Sore meets the Enchanted Garden','sourceUrl':'https://www.instagram.com/reel/DRChiwBjLnm/','publisherAtCapture':'igate.2026','originalCaptionEventYear':2025,'publicationDate':'2025-11-14','roles':['Director','Cameraman','Editor'],'roleSource':'Confirmed by the portfolio owner','media':'/portfolio/igate-2025/igate-2025-reel.mp4','poster':'/portfolio/igate-2025/cover.webp','duration':53.25,'width':1280,'height':792,'hasAudio':True,'posterTime':49,'bytes':(out/'igate-2025-reel.mp4').stat().st_size,'framing':'Full source image; no black padding detected and no crop applied.'}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('Complete I-GATE reel prepared: '+str(manifest['bytes'])+' bytes.',flush=True)
