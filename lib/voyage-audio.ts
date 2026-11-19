export type SoundSnapshot={initialized:boolean;enabled:boolean;unlocked:boolean;available:boolean;musicPlaying:boolean;waterPlaying:boolean};
const initialSnapshot:SoundSnapshot={initialized:false,enabled:true,unlocked:false,available:true,musicPlaying:false,waterPlaying:false};
const preferenceKey='iza-voyage-sound';
type Voice={sources:AudioScheduledSourceNode[];nodes:AudioNode[];gain:GainNode};

/** One shared mixer. Music streams from the supplied MP3; effects are synthesized locally. */
class VoyageAudio {
  private snapshot=initialSnapshot;
  private listeners=new Set<()=>void>();
  private context:AudioContext|null=null;
  private master:GainNode|null=null;
  private noise:AudioBuffer|null=null;
  private music:HTMLAudioElement|null=null;
  private musicAttempt:Promise<void>|null=null;
  private voices=new Set<Voice>();
  private water:Voice|null=null;
  private sailing=false;
  private hidden=false;
  private mediaPlaying=false;
  private cloudStarted=0;
  private cloudDuration=0;
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
  getSnapshot=()=>this.snapshot;
  getServerSnapshot=()=>initialSnapshot;
  private update(patch:Partial<SoundSnapshot>){
    const next={...this.snapshot,...patch};
    if(Object.keys(next).every(key=>next[key as keyof SoundSnapshot]===this.snapshot[key as keyof SoundSnapshot]))return;
    this.snapshot=next;this.listeners.forEach(listener=>listener());
  }
  attach(music:HTMLAudioElement){
    this.music=music;music.loop=true;music.volume=.22;music.preload='none';this.hidden=document.hidden;
    try{this.update({enabled:localStorage.getItem(preferenceKey)!=='off'});}catch{/* Storage can be unavailable in private embeds. */}
    music.preload=this.snapshot.enabled?'auto':'none';
    const playing=()=>{if(!this.snapshot.enabled){music.pause();return;}this.update({musicPlaying:!music.paused&&!music.ended,unlocked:true});};
    const ended=()=>this.update({musicPlaying:false});
    music.addEventListener('playing',playing);music.addEventListener('pause',ended);music.addEventListener('error',ended);
    this.update({initialized:true});
    // Attempt audible playback immediately; a blocked attempt is retried by a real gesture.
    this.startMusic(true);
    return()=>{
      music.removeEventListener('playing',playing);music.removeEventListener('pause',ended);music.removeEventListener('error',ended);
      if(this.music!==music)return;
      music.pause();this.music=null;this.musicAttempt=null;
      this.stopVoices();const context=this.context;this.context=null;this.master=null;this.noise=null;this.sailing=false;this.mediaPlaying=false;
      if(context&&context.state!=='closed')void context.close().catch(()=>{});
      this.update({initialized:false,unlocked:false,musicPlaying:false,waterPlaying:false});
    };
  }
  private setup(){
    if(this.context)return true;
    try{
      const AudioContextClass=window.AudioContext??(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
      if(!AudioContextClass){this.update({available:false});return false;}
      const context=new AudioContextClass(),master=context.createGain(),compressor=context.createDynamicsCompressor();
      master.gain.value=0;compressor.threshold.value=-14;compressor.ratio.value=3;compressor.attack.value=.008;compressor.release.value=.2;
      master.connect(compressor);compressor.connect(context.destination);this.context=context;this.master=master;
      return true;
    }catch{this.update({available:false});return false;}
  }
  /** Call directly inside a trusted pointer/keyboard event, before any await. */
  activate(){
    if(!this.snapshot.enabled||this.hidden||this.mediaPlaying||!this.setup())return;
    const context=this.context!;
    this.update({unlocked:true});
    this.master!.gain.cancelScheduledValues(context.currentTime);
    this.master!.gain.setTargetAtTime(1,context.currentTime,.025);
    if(context.state==='suspended')void context.resume().catch(()=>{if(this.context===context)this.update({unlocked:false});});
    this.startMusic();this.syncWater();
    if(this.cloudStarted){
      const remaining=this.cloudDuration-(performance.now()-this.cloudStarted)/1000;
      this.cloudStarted=0;
      if(remaining>.12)this.whoosh(Math.min(remaining,2.4));
    }
  }
  toggle(){
    if(this.snapshot.enabled){
      this.click();this.setEnabled(false);
    }else{
      this.setEnabled(true);this.activate();this.click();
    }
  }
  private setEnabled(enabled:boolean){
    this.update({enabled});
    if(this.music)this.music.preload=enabled?'auto':'none';
    try{localStorage.setItem(preferenceKey,enabled?'on':'off');}catch{/* Playback still works without persistence. */}
    if(!enabled){
      this.music?.pause();this.stopVoices();
      if(this.context&&this.master){this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setTargetAtTime(0,this.context.currentTime,.012);}
    }
  }
  private startMusic(autoplay=false){
    const music=this.music;
    if(!music||!this.snapshot.enabled||(!this.snapshot.unlocked&&!autoplay)||this.hidden||this.mediaPlaying||!music.paused||this.musicAttempt)return;
    // A denied autoplay attempt stays quiet and is retried on the next real gesture.
    const attempt=music.play();
    this.musicAttempt=attempt;
    void attempt.catch(()=>{if(this.music===music)this.update({musicPlaying:false});}).finally(()=>{if(this.musicAttempt===attempt)this.musicAttempt=null;});
  }
  visibility(hidden:boolean){
    this.hidden=hidden;
    if(hidden){
      this.music?.pause();this.stopVoices();
      if(this.context&&this.master){this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setValueAtTime(0,this.context.currentTime);}
    }else if(this.snapshot.enabled){if(this.context&&this.snapshot.unlocked)this.activate();else this.startMusic(true);}
  }
  /** Temporarily leave the soundtrack clear for a portfolio video; keep the saved sound preference. */
  setMediaPlaying(playing:boolean){
    if(this.mediaPlaying===playing)return;
    this.mediaPlaying=playing;
    if(playing){
      this.music?.pause();this.stopVoices();
      if(this.context&&this.master){this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setTargetAtTime(0,this.context.currentTime,.012);}
    }else if(this.snapshot.enabled&&this.snapshot.unlocked&&!this.hidden)this.activate();
  }
  setSailing(sailing:boolean){this.sailing=sailing;this.syncWater();}
  private ready(){return this.snapshot.enabled&&this.snapshot.unlocked&&!this.hidden&&!this.mediaPlaying&&!!this.context&&this.context.state!=='closed';}
  private noiseBuffer(){
    if(this.noise)return this.noise;
    const context=this.context!,buffer=context.createBuffer(1,context.sampleRate*8,context.sampleRate),data=buffer.getChannelData(0);
    let random=923521;
    for(let i=0;i<data.length;i++){random=(random*16807)%2147483647;data[i]=random/1073741823.5-1;}
    // Smooth the loop seam; modulation supplies longer, overlapping wave swells.
    const fade=Math.min(512,data.length/2);
    for(let i=0;i<fade;i++){const mix=i/fade;data[i]=data[i]*mix+data[data.length-fade+i]*(1-mix);}
    this.noise=buffer;return buffer;
  }
  private voice(duration:number,peak:number,frequency:number,kind:BiquadFilterType='bandpass',pan=0){
    if(!this.ready())return null;
    const context=this.context!,source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),panner=context.createStereoPanner();
    source.buffer=this.noiseBuffer();filter.type=kind;filter.frequency.value=frequency;filter.Q.value=.55;panner.pan.value=pan;
    source.connect(filter);filter.connect(gain);gain.connect(panner);panner.connect(this.master!);
    const now=context.currentTime;
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(peak,now+Math.min(.025,duration/4));
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    const voice:Voice={sources:[source],nodes:[source,filter,gain,panner],gain};
    this.voices.add(voice);
    source.onended=()=>{voice.nodes.forEach(node=>node.disconnect());this.voices.delete(voice);};
    source.start(now,Math.random()*2);source.stop(now+duration+.015);
    return {voice,filter,panner,now};
  }
  click(){
    const sound=this.voice(.055,.34,1900,'highpass');
    if(!sound)return;
    const {voice,now}=sound,context=this.context!,tone=context.createOscillator(),gain=context.createGain();
    tone.type='triangle';tone.frequency.setValueAtTime(950,now);tone.frequency.exponentialRampToValueAtTime(230,now+.032);
    gain.gain.setValueAtTime(.12,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.035);
    tone.connect(gain);gain.connect(this.master!);voice.sources.push(tone);voice.nodes.push(tone,gain);
    tone.start(now);tone.stop(now+.04);
  }
  cloudOpening(duration=2.4){
    this.cloudStarted=performance.now();this.cloudDuration=duration;
    if(this.ready()){this.cloudStarted=0;this.whoosh(duration);}
  }
  private whoosh(duration:number){
    const sound=this.voice(duration,.32,180,'bandpass',-.75);if(!sound)return;
    const {voice,filter,panner,now}=sound,gain=voice.gain.gain;
    filter.frequency.setValueAtTime(160,now);filter.frequency.exponentialRampToValueAtTime(2300,now+duration*.48);filter.frequency.exponentialRampToValueAtTime(320,now+duration);
    gain.cancelScheduledValues(now);gain.setValueAtTime(.0001,now);gain.exponentialRampToValueAtTime(.32,now+duration*.35);gain.exponentialRampToValueAtTime(.14,now+duration*.7);gain.exponentialRampToValueAtTime(.0001,now+duration);
    panner.pan.linearRampToValueAtTime(.75,now+duration);
  }
  paper(duration=1.2,closing=false){
    duration=Math.max(.3,Math.min(duration,2.1));
    const sound=this.voice(duration,.25,1700,'bandpass');if(!sound)return;
    const {voice,filter,now}=sound,gain=voice.gain.gain;
    gain.cancelScheduledValues(now);gain.setValueAtTime(.0001,now);
    // Uneven bursts make a dry paper rustle rather than a sustained hiss.
    for(let i=1;i<=18;i++){
      const t=i/19,volume=(.065+.15*Math.abs(Math.sin(i*2.37)))*Math.sin(Math.PI*t)*(closing?.72:1);
      gain.linearRampToValueAtTime(Math.max(.0001,volume),now+duration*t);
    }
    gain.exponentialRampToValueAtTime(.0001,now+duration);
    filter.frequency.setValueAtTime(closing?2200:950,now);filter.frequency.exponentialRampToValueAtTime(closing?950:2600,now+duration);
  }
  private syncWater(){
    const shouldPlay=this.sailing&&this.ready();
    if(shouldPlay&&this.water||!shouldPlay&&!this.water)return;
    if(!shouldPlay){this.stopWater();return;}
    const context=this.context!,now=context.currentTime,gain=context.createGain();
    gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.38,now+.7);gain.connect(this.master!);
    const voice:Voice={sources:[],nodes:[gain],gain};
    for(const [i,pan]of [-.6,.6].entries()){
      const source=context.createBufferSource(),low=context.createBiquadFilter(),high=context.createBiquadFilter(),swell=context.createOscillator(),swellGain=context.createGain(),level=context.createGain(),panner=context.createStereoPanner();
      source.buffer=this.noiseBuffer();source.loop=true;
      low.type='lowpass';low.frequency.value=i?1100:800;high.type='highpass';high.frequency.value=120;
      swell.frequency.value=i?.31:.23;swellGain.gain.value=.16;level.gain.value=.42;panner.pan.value=pan;
      source.connect(low);low.connect(high);high.connect(level);level.connect(panner);panner.connect(gain);swell.connect(swellGain);swellGain.connect(level.gain);
      voice.sources.push(source,swell);voice.nodes.push(source,low,high,swell,swellGain,level,panner);
      source.start(now,i*3.1);swell.start(now);
    }
    this.water=voice;this.voices.add(voice);this.update({waterPlaying:true});
  }
  private stopWater(){
    const voice=this.water;if(!voice)return;
    this.water=null;this.update({waterPlaying:false});
    const now=this.context?.currentTime??0;
    voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setTargetAtTime(0,now,.1);
    voice.sources.forEach(source=>{try{source.stop(now+.45);}catch{/* Already ended. */}});
    voice.sources[0].onended=()=>{voice.nodes.forEach(node=>node.disconnect());this.voices.delete(voice);};
  }
  private stopVoices(){
    this.water=null;this.update({waterPlaying:false});
    for(const voice of this.voices){
      voice.sources.forEach(source=>{try{source.stop();}catch{/* Already ended. */}});
      voice.nodes.forEach(node=>node.disconnect());
    }
    this.voices.clear();
  }
}
export const voyageAudio=new VoyageAudio();
