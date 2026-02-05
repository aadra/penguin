/**********************************
 * 1️⃣ DOM REFERENCES
 **********************************/
 const penguinContainer = document.getElementById("penguin");
 const speakBtn = document.getElementById("speakBtn");
 const statusText = document.getElementById("status");
 
 /**********************************
  * 2️⃣ STATE
  **********************************/
 let mouthOpenWrapper;
 let mouthClosedWrapper;
 let lipSyncInterval = null;
 let isSpeaking = false;
 let recognition;
 
 /**********************************
  * 3️⃣ LOAD SVGs
  **********************************/
 Promise.all([
   fetch("penguin-closed.svg").then(res => res.text()),
   fetch("penguin-open.svg").then(res => res.text())
 ]).then(([closedSVG, openSVG]) => {
   penguinContainer.innerHTML = `
     <div id="closed">${closedSVG}</div>
     <div id="open" style="display:none">${openSVG}</div>
   `;
 
   mouthClosedWrapper = document.getElementById("closed");
   mouthOpenWrapper = document.getElementById("open");
 
   closeMouth();
 });
 
 /**********************************
  * 4️⃣ MOUTH CONTROL (2 STATES ONLY)
  **********************************/
 function openMouth() {
   mouthClosedWrapper.style.display = "none";
   mouthOpenWrapper.style.display = "block";
 }
 
 function closeMouth() {
   mouthOpenWrapper.style.display = "none";
   mouthClosedWrapper.style.display = "block";
 }
 
 function startLipSync() {
   if (isSpeaking) return;
   isSpeaking = true;
 
   openMouth();
 
   lipSyncInterval = setInterval(() => {
     closeMouth();
     setTimeout(openMouth, 200); // brief close every 0.5s
   }, 500);
 }
 
 function stopLipSync() {
   isSpeaking = false;
   clearInterval(lipSyncInterval);
   lipSyncInterval = null;
   closeMouth();
 }
 
 /**********************************
  * 5️⃣ SPEECH RECOGNITION
  **********************************/
 function startListening() {
   if (!("webkitSpeechRecognition" in window)) {
     alert("Speech recognition not supported");
     return;
   }
 
   recognition = new webkitSpeechRecognition();
   recognition.lang = "en-US";
   recognition.continuous = false;
   recognition.interimResults = false;
 
   statusText.textContent = "🎧 Listening...";
 
   recognition.onresult = async (event) => {
     const transcript = event.results[0][0].transcript;
     statusText.textContent = `🗣️ You: "${transcript}"`;
     await talkToPenguin(transcript);
   };
 
   recognition.onerror = () => {
     statusText.textContent = "❌ Mic error";
   };
 
   recognition.start();
 }
 
 /**********************************
  * 6️⃣ CHAT → OPENAI
  **********************************/
 async function talkToPenguin(userText) {
   try {
     const chatRes = await fetch("/.netlify/functions/chat", {
       method: "POST",
       body: JSON.stringify({ text: userText })
     });
 
     if (!chatRes.ok) throw new Error("Chat failed");
 
     const { reply } = await chatRes.json();
     statusText.textContent = `🐧 Penguin: "${reply}"`;
 
     await speakWithPenguin(reply);
   } catch (err) {
     console.error(err);
     statusText.textContent = "❌ Chat error";
   }
 }
 
 /**********************************
  * 7️⃣ TTS → ELEVEN LABS
  **********************************/
 async function speakWithPenguin(text) {
   try {
     startLipSync(); // 👈 start animation BEFORE audio
 
     const ttsRes = await fetch("/.netlify/functions/tts", {
       method: "POST",
       body: JSON.stringify({ text })
     });
 
     if (!ttsRes.ok) throw new Error("TTS failed");
 
     const audioBase64 = await ttsRes.text();
     const audio = new Audio("data:audio/mpeg;base64," + audioBase64);
 
     audio.onended = stopLipSync;
     audio.onerror = stopLipSync;
 
     await audio.play();
   } catch (err) {
     console.error(err);
     stopLipSync();
     statusText.textContent = "❌ Voice error";
   }
 }
 
 /**********************************
  * 8️⃣ UI EVENTS
  **********************************/
 speakBtn.addEventListener("click", startListening);
 