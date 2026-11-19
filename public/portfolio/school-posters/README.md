# School posters - Pigment Atoll / Portfolio A

Sixteen original works supplied by the portfolio owner: fifteen motion posters and one static Earth Day poster. Credit: Graphic Designer & Poster Visualization. Software: Adobe Photoshop, Adobe Premiere Pro, and Adobe After Effects; the static Earth Day artwork is described as a Photoshop design.

Gallery order: Luminous, HIVI!, Vierratale, New Year 2022, Candidate 01, MPK chairperson, Independence Day, Rethera Classmeeting, Lunar New Year, Magnificent rundown, Waisak, Rethera 2.0, Heroes' Day, Maulid Nabi, Earth Day, SMALA MPLS. HIVI! and Vierratale were created for the peak celebrations of HUT SMAN 1 Madiun, as confirmed by the owner. Asset filenames remain stable independently of slide positions.

The original school collection is under `E:/Portofolio` (SMAN 1, SMAN 5, and SMAN 2 Madiun); HIVI! and Vierratale were supplied from the owner's Downloads folder. `manifest.json` records relative source filenames, source roots, dimensions, full durations, audio-stream presence, and output sizes. Available source sound is retained; an audio stream does not imply audible content.

Web videos use H.264, yuv420p, AAC where available, faststart, a maximum 720px width without upscaling, and a maximum 30fps. Native aspect ratios and full video sequences are preserved. The square SMALA twibbon retains its intentional green portrait-replacement area. Poster images are selected from each source; the Earth Day image remains 1080x1920 in WebP.

Regenerate from the repository root:

```powershell
python scripts/prepare-school-posters.py --source-root "E:/Portofolio" --downloads-root "C:/Users/Legion/Downloads"
```

Add `--review-only` to extract contact sheets without encoding public assets. Use `--only 15-hivi 16-vierratale` to prepare the additions and retain existing media metadata in the updated gallery order. Source files are never modified.
