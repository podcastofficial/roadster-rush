/* Shared FX: synth sounds, music loop, haptics (via Telegram hub or navigator.vibrate). No audio files needed. */
window.FX=(()=>{
 let ac,mg,mute=false,mt=null,step=0;
 try{mute=localStorage.getItem('fx-mute')==='1'}catch{}
 function init(){
  if(ac){if(ac.state==='suspended')ac.resume();return}
  try{ac=new(window.AudioContext||window.webkitAudioContext)();mg=ac.createGain();mg.gain.value=.5;mg.connect(ac.destination)}catch{ac=null}
 }
 addEventListener('pointerdown',init);addEventListener('keydown',init);
 function tone(f,d,type='square',v=.07,slide=0,when=0){
  if(!ac||mute)return;
  const t=ac.currentTime+when,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g);g.connect(mg);o.start(t);o.stop(t+d);
 }
 const S={
  jump:()=>tone(300,.18,'square',.06,500),
  coin:()=>{tone(988,.07,'square',.06);tone(1319,.14,'square',.06,0,.07)},
  stomp:()=>tone(220,.16,'sawtooth',.08,-130),
  hurt:()=>tone(240,.4,'sawtooth',.09,-190),
  shoot:()=>tone(900,.08,'square',.04,-600),
  boom:()=>tone(120,.35,'sawtooth',.1,-80),
  click:()=>tone(600,.05,'square',.04),
  win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.16,'square',.06,0,i*.12)),
  lose:()=>[392,330,262,196].forEach((f,i)=>tone(f,.22,'triangle',.08,0,i*.18))
 };
 const BASS=[110,0,110,0,131,0,98,0],LEAD=[440,0,523,0,659,523,0,392];
 return{
  sfx(n){try{S[n]&&S[n]()}catch{}},
  buzz(k='light'){
   try{
    if(parent!==window)parent.postMessage({type:'haptic',kind:k},'*');
    else if(navigator.vibrate)navigator.vibrate(k==='heavy'||k==='error'?90:30);
   }catch{}
  },
  music(on){
   clearInterval(mt);mt=null;
   if(!on)return;
   mt=setInterval(()=>{
    const i=step++%8;
    if(BASS[i])tone(BASS[i],.22,'triangle',.05);
    if(LEAD[i])tone(LEAD[i],.12,'square',.022);
   },230);
  },
  toggle(){mute=!mute;try{localStorage.setItem('fx-mute',mute?'1':'0')}catch{}return mute},
  muted:()=>mute
 };
})();