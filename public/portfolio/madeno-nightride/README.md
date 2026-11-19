# Nightride with MADENO STUDIOS

Source: https://www.instagram.com/reel/CpfJr5cjiRC/

Role: Cameraman (confirmed by the portfolio owner). The original Instagram caption credits MADENO STUDIOS for video and colour grading.

Framewake Bay Portfolio C includes an opening still and four scene-led excerpts:

1. Motorcycle details: 00:06-00:26.
2. Rider preparation: 00:30-00:50.
3. Night rolling shots: 01:02-01:22.
4. City lights: 01:34-01:54.

Every excerpt lasts 20 seconds. The 720x720 Instagram upload contains a centered wide picture; the selected scenes consistently have black padding above and below it. Export removes padding only with `crop=720:320:0:200`, retaining a small margin around the image. The original opening still is preserved at 720x720. No image stretching, AI-generated imagery, or invented footage is used. The source soundtrack is retained with brief audio fades at excerpt boundaries.

Exports use H.264, yuv420p, AAC and faststart with local WebP posters. Native playback controls remain available; the website ambience pauses during playback. The source video is retained in the ignored local outputs directory, outside the public assets.

See `manifest.json` for the source, role, dimensions, poster frames, and exact time ranges. Regenerate with `python scripts/prepare-nightride-clips.py --source path/to/original.mp4 --ffmpeg path/to/ffmpeg`.
