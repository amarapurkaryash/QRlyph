
import React, { useState, useRef, useCallback, useEffect } from 'react';
import jsQR from 'jsqr';
import Button from './Button';
import { IconCamera, IconUpload, IconCheck, IconError, IconCopy, IconScanner } from './icons';
import type { Theme } from '../types';

interface ScanResult {
  ssid?: string;
  encryption?: string;
  password?: string;
  hidden?: boolean;
}

interface QrScannerProps {
  theme: Theme;
}

const QrScanner: React.FC<QrScannerProps> = ({ theme }) => {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseWifiString = (data: string) => {
    if (!data.startsWith('WIFI:')) {
      setError('Not a valid Wi-Fi QR code.');
      setResult(null);
      return;
    }
    // Correctly split fields without trimming the last character, which could corrupt the data.
    const fields = data.substring(5).split(';');
    const wifiData: any = {};
    fields.forEach(field => {
      if(field) {
        // Split on the first colon that isn't escaped.
        const parts = field.split(/(?<!\\):/);
        const key = parts[0];
        // Join the rest back in case the value had colons. Unescape special chars.
        const value = parts.slice(1).join(':').replace(/\\([\\;,"'])/g, '$1');
        wifiData[key] = value;
      }
    });

    if (!wifiData.S) {
        setError('Not a valid Wi-Fi QR code. SSID (S:) is missing.');
        setResult(null);
        return;
    }

    setResult({
      ssid: wifiData.S,
      encryption: wifiData.T,
      password: wifiData.P,
      hidden: wifiData.H === 'true',
    });
    setError(null);
  };
  
  const scanImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          parseWifiString(code.data);
        } else {
          setError('No QR code found in the image.');
          setResult(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      scanImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      scanImage(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const tick = useCallback(() => {
    if (isScanning && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          parseWifiString(code.data);
          setIsScanning(false);
        }
      }
    }
    if (isScanning) {
        requestAnimationFrame(tick);
    }
  }, [isScanning]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScanning) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => {
                requestAnimationFrame(tick);
            });
          }
        })
        .catch(err => {
          setError('Could not access camera. Please grant permission.');
          setIsScanning(false);
        });
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const currentStream = videoRef.current.srcObject as MediaStream;
            currentStream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    return () => {
        if(stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isScanning, tick]);

  const handleCopyCredentials = () => {
    if (!result) return;
    const creds = `SSID: ${result.ssid || ''}\nPassword: ${result.password || 'None'}`;
    navigator.clipboard.writeText(creds).then(() => {
      alert('Wi-Fi credentials copied!');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
      <div className="flex flex-col gap-6">
        <div 
          onDragEnter={() => setIsDragging(true)} 
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-10 bg-surface rounded-xl cursor-pointer transition-all duration-300 border-2 border-dashed ${isDragging ? 'scale-105 border-accent bg-accent/10' : 'border-border hover:border-accent/70'}`}
        >
          <IconUpload className="w-12 h-12 text-text-subtle mb-4" />
          <p className="font-semibold text-center text-text-main">
            Drag & drop an image or click to upload
          </p>
          <p className="text-sm text-text-subtle mt-1">Supports PNG, JPG, etc.</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div className="relative flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-sm text-text-subtle">OR</span>
            <div className="flex-grow border-t border-border"></div>
        </div>

        <Button onClick={() => setIsScanning(!isScanning)} icon={isScanning ? <IconScanner className="animate-pulse" /> : <IconCamera />}>
          {isScanning ? 'Stopping Scan...' : 'Start Live Scan'}
        </Button>

        {isScanning && (
          <div className="relative w-full max-w-md mx-auto aspect-square bg-black rounded-lg overflow-hidden shadow-lg border border-border animate-fade-in">
             <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
             <div className="absolute inset-0 border-4 border-white/20 rounded-lg pointer-events-none"></div>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2/3 aspect-square border-2 border-white/70 rounded-md animate-pulse"></div>
             </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="bg-surface border border-border p-6 rounded-xl h-full min-h-[400px] flex flex-col justify-center">
        <h3 className="text-lg font-bold uppercase tracking-wider text-center text-inherit mb-6">Scan Results</h3>
        {error && (
          <div className="animate-fade-in flex items-center gap-4 p-4 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-500/20">
            <IconError className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-semibold">Scan Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        {result && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 text-green-800 dark:text-green-200 ring-1 ring-inset ring-green-500/20">
              <IconCheck className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold text-sm">Successfully decoded Wi-Fi credentials!</p>
            </div>
            <div className="space-y-3 text-sm font-mono p-4 bg-background/50 rounded-lg">
              <p><strong className="text-text-subtle w-24 inline-block">SSID</strong>: <span className="text-inherit">{result.ssid}</span></p>
              {result.hidden && (
                  <p><strong className="text-text-subtle w-24 inline-block">Hidden</strong>: <span className="text-accent font-semibold">Yes</span></p>
              )}
              <p><strong className="text-text-subtle w-24 inline-block">Encryption</strong>: <span className="text-inherit">{result.encryption === 'nopass' ? 'None/Open' : (result.encryption || 'Unknown')}</span></p>
              <p><strong className="text-text-subtle w-24 inline-block">Password</strong>: <span className="text-inherit">{result.password || 'N/A'}</span></p>
            </div>
            <Button onClick={handleCopyCredentials} icon={<IconCopy />} variant="secondary">
              Copy Credentials
            </Button>
          </div>
        )}
        {!error && !result && (
          <div className="text-center text-text-subtle animate-fade-in">
            <IconScanner className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-text-main">Ready to scan</p>
            <p className="text-sm mt-1">Use your camera or upload an image.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrScanner;