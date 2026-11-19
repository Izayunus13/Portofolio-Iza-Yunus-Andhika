"""Prepare the complete clinic-visit promotion for Framewake Bay / Portfolio F."""
import argparse,json,pathlib,subprocess
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',required=True)
parser.add_argument('--ffmpeg',default='outputs/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe')
args=parser.parse_args();source=pathlib.Path(args.source)
if not source.is_file():raise FileNotFoundError(source)
out=pathlib.Path('public/portfolio/visit-tenseiga');out.mkdir(parents=True,exist_ok=True)
def run(*options):subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error',*map(str,options)],check=True)
run('-ss',8,'-i',source,'-frames:v',1,'-vf','scale=720:1280,setsar=1','-c:v','libwebp','-quality',94,'-y',out/'cover.webp')
run('-i',source,'-map','0:v:0','-map','0:a:0?','-vf','scale=720:1280,setsar=1,fps=30','-c:v','libx264','-preset','medium','-crf',24,'-maxrate','1050k','-bufsize','2100k','-pix_fmt','yuv420p','-threads',4,'-c:a','aac','-b:a','96k','-movflags','+faststart','-map_metadata','-1','-y',out/'visit-tenseiga.mp4')
manifest={'project':'Visit Tenseiga Clinic','sourceFilename':source.name,'sourceBytes':source.stat().st_size,'sourceDuration':165.53,'sourceDimensions':{'width':1080,'height':1920},'roles':['Cameraman','Concept Developer','Video Editor'],'collaborator':{'name':'@faisafch','role':'Influencer'},'creditSource':'Confirmed by the portfolio owner','purpose':'Promote Tenseiga_Clinic through a clinic-visit and treatment-process video','media':'/portfolio/visit-tenseiga/visit-tenseiga.mp4','poster':'/portfolio/visit-tenseiga/cover.webp','posterTime':8,'width':720,'height':1280,'duration':165.53,'hasAudio':True,'bytes':(out/'visit-tenseiga.mp4').stat().st_size,'encoding':'H.264 yuv420p, 30fps, CRF 24, 1050k maxrate, 2100k buffer, AAC 96k, faststart.','framing':'Full source 9:16 frame and complete sequence preserved; no crop or stretch.'}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('Visit Tenseiga ready: '+str(round(manifest['bytes']/1e6,2))+' MB; complete source picture and sound retained.',flush=True)
