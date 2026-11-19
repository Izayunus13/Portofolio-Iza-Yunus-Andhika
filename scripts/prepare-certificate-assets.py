"""Copy the owner-supplied certificates and render lightweight first-page previews."""
import argparse,hashlib,json,pathlib,shutil,subprocess,sys
sys.path.insert(0,str(pathlib.Path('outputs/pdf-tools').resolve()))
import pymupdf

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-root',required=True)
parser.add_argument('--ffmpeg',default='outputs/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe')
args=parser.parse_args()
root=pathlib.Path(args.source_root)
files=[('Python_Essentials_2_certificate_izayunusandhika-gmail-com_7aa4eb5c-b8e6-402c-b85b-d87853207cb4.pdf','python-essentials-2'),('Sertifikat CS107 C++ Programming.pdf','cs107-cpp-programming')]
missing=[source for source,_ in files if not (root/source).is_file()]
if missing:raise FileNotFoundError('Missing sources: '+', '.join(missing))
out=pathlib.Path('public/certificates/programming');out.mkdir(parents=True,exist_ok=True)
review=pathlib.Path('outputs/certificates/source-review');review.mkdir(parents=True,exist_ok=True)
manifest=[]
for source,stem in files:
 path=root/source;doc=pymupdf.open(path)
 shutil.copyfile(path,out/(stem+'.pdf'))
 pages=[]
 for index,page in enumerate(doc):
  pix=page.get_pixmap(matrix=pymupdf.Matrix(1800/page.rect.width,1800/page.rect.width),alpha=False)
  png=review/(stem+'-page-'+str(index+1)+'.png');pix.save(png)
  pages.append({'page':index+1,'text':page.get_text(),'links':[link['uri'] for link in page.get_links() if link.get('uri')]})
  if index==0:
   subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error','-i',str(png),'-frames:v','1','-c:v','libwebp','-quality','94','-compression_level','6','-y',str(out/(stem+'.webp'))],check=True)
 manifest.append({'source':source,'document':'/certificates/programming/'+stem+'.pdf','image':'/certificates/programming/'+stem+'.webp','pages':pages,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
 print(stem+': '+str(len(doc))+' page(s), original PDF preserved, '+str((out/(stem+'.webp')).stat().st_size)+'-byte preview',flush=True)
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=True,indent=2)+'\n',encoding='utf-8')
