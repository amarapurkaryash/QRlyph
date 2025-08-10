
import React, { useState, useEffect, useRef } from 'react';
import type { EncryptionType, Theme } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import Button from './Button';
import QrCodePreview from './QrCodePreview';
import { IconDownload, IconCopy, IconWifi, IconLock, IconLockOpen, IconColorLens, IconExpand, IconUpload, IconClose, IconCard } from './icons';

interface QrGeneratorProps {
  theme: Theme;
}

export const QrGenerator: React.FC<QrGeneratorProps> = ({ theme }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<EncryptionType>('WPA2');
  const [isHidden, setIsHidden] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [copyText, setCopyText] = useState('Copy Data');
  const qrCodeRef = useRef<SVGSVGElement>(null);
  const [qrPreviewSize, setQrPreviewSize] = useState(256);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Branding state
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const debouncedSsid = useDebounce(ssid, 300);
  const debouncedPassword = useDebounce(password, 300);
  const debouncedEncryption = useDebounce(encryption, 300);
  const debouncedIsHidden = useDebounce(isHidden, 300);

  useEffect(() => {
    if (!debouncedSsid) {
      setQrValue('');
      return;
    }
    const escape = (str: string) => str.replace(/([\\;,"'])/g, '\\$1');
    const qrEncryption = debouncedEncryption;
    const pass = qrEncryption === 'nopass' ? '' : `P:${escape(debouncedPassword)};`;
    const hidden = debouncedIsHidden ? 'H:true;' : '';
    const formattedQrValue = `WIFI:S:${escape(debouncedSsid)};T:${qrEncryption};${pass}${hidden};`;
    setQrValue(formattedQrValue);
  }, [debouncedSsid, debouncedPassword, debouncedEncryption, debouncedIsHidden]);

  // Effect to handle responsive QR code size
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        const newSize = Math.min(width - 48, 320);
        if (newSize > 0) {
            setQrPreviewSize(newSize);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * Generates an SVG string from the QR code ref.
   * @param makeBgTransparent - If true, modifies the SVG to have a transparent background,
   * essential for canvas-based exports (PNG, Card). If false, returns the SVG as-is.
   */
  const getSvgString = (makeBgTransparent: boolean): string => {
    if (!qrCodeRef.current) return '';
    const node = qrCodeRef.current;

    if (makeBgTransparent) {
      const clonedNode = node.cloneNode(true) as SVGSVGElement;
      // The first <rect> child is the background rendered by qrcode.react.
      // We make it transparent for drawing on a canvas.
      const bgRect = clonedNode.querySelector('rect');
      if (bgRect) {
        bgRect.setAttribute('fill', 'transparent');
      }
      return new XMLSerializer().serializeToString(clonedNode);
    }

    // For direct SVG download, we want the background color included.
    return new XMLSerializer().serializeToString(node);
  };

  const handleDownload = (format: 'png' | 'svg') => {
    if (!qrValue) return;

    const safeSsid = ssid.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'qrcode';
    const a = document.createElement('a');
    a.download = `qrlyph-wifi-${safeSsid}.${format}`;

    if (format === 'svg') {
      const svgString = getSvgString(false); // Get with background
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      a.href = URL.createObjectURL(svgBlob);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      return;
    }

    // PNG export logic
    const svgString = getSvgString(true); // Get with transparent background
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const exportSize = 512;
      canvas.width = exportSize;
      canvas.height = exportSize;
      
      // Step 1: Fill canvas with the correct background color.
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Step 2: Draw the QR code (with its now-transparent background) on top.
      ctx.drawImage(img, 0, 0, exportSize, exportSize);
      
      const pngUrl = canvas.toDataURL('image/png');
      a.href = pngUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      console.error("Failed to load SVG image for PNG conversion.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleExportCard = () => {
    if (!qrValue || !ssid) return;

    const canvas = document.createElement('canvas');
    const cardSize = 800;
    
    canvas.width = cardSize;
    canvas.height = cardSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function drawStar(x: number, y: number, size: number, color: string) {
        if (!ctx) return;
        ctx.save();
        ctx.fillStyle = color;
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI * 2);
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = outerRadius / 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.rotate(Math.PI / spikes);
            ctx.lineTo(0, -innerRadius);
            ctx.rotate(Math.PI / spikes);
            ctx.lineTo(0, -outerRadius);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
    const cardBackgroundColor = '#FFFFFF';
    const cardTextColorMain = '#1e293b';
    const cardTextColorSubtle = '#64748b';
    const doodleColor = '#e2e8f0';

    ctx.fillStyle = cardBackgroundColor;
    ctx.fillRect(0, 0, cardSize, cardSize);
    
    const distantStarCount = 200;
    for (let i = 0; i < distantStarCount; i++) {
        const x = Math.random() * cardSize;
        const y = Math.random() * cardSize;
        const size = Math.random() * 8 + 2;
        ctx.globalAlpha = Math.random() * 0.3 + 0.1;
        drawStar(x, y, size, doodleColor);
    }

    const closeStarCount = 50;
    for (let i = 0; i < closeStarCount; i++) {
        const x = Math.random() * cardSize;
        const y = Math.random() * cardSize;
        const size = Math.random() * 15 + 10;
        ctx.globalAlpha = Math.random() * 0.4 + 0.4;
        drawStar(x, y, size, doodleColor);
    }
    ctx.globalAlpha = 1.0;
    
    const svgString = getSvgString(true); // Get QR code with transparent background
    const img = new Image();
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.textAlign = 'center';
      
      const titleY = 110;
      const qrPlaqueY = 160;
      const qrPlaqueSize = 340;
      const detailsYStart = qrPlaqueY + qrPlaqueSize + 80;
      const footerY = cardSize - 30;
      const qrPlaqueX = (cardSize - qrPlaqueSize) / 2;

      ctx.fillStyle = primaryColor;
      ctx.font = "bold 40px 'Inter', sans-serif";
      ctx.fillText('Scan to Connect', cardSize / 2, titleY);

      const qrSize = 280;
      const qrPlaquePadding = (qrPlaqueSize - qrSize) / 2;
      const qrX = qrPlaqueX + qrPlaquePadding;
      const qrY = qrPlaqueY + qrPlaquePadding;
      
      const cornerRadius = 24;
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.moveTo(qrPlaqueX + cornerRadius, qrPlaqueY);
      ctx.lineTo(qrPlaqueX + qrPlaqueSize - cornerRadius, qrPlaqueY);
      ctx.quadraticCurveTo(qrPlaqueX + qrPlaqueSize, qrPlaqueY, qrPlaqueX + qrPlaqueSize, qrPlaqueY + cornerRadius);
      ctx.lineTo(qrPlaqueX + qrPlaqueSize, qrPlaqueY + qrPlaqueSize - cornerRadius);
      ctx.quadraticCurveTo(qrPlaqueX + qrPlaqueSize, qrPlaqueY + qrPlaqueSize, qrPlaqueX + qrPlaqueSize - cornerRadius, qrPlaqueY + qrPlaqueSize);
      ctx.lineTo(qrPlaqueX + cornerRadius, qrPlaqueY + qrPlaqueSize);
      ctx.quadraticCurveTo(qrPlaqueX, qrPlaqueY + qrPlaqueSize, qrPlaqueX, qrPlaqueY + qrPlaqueSize - cornerRadius);
      ctx.lineTo(qrPlaqueX, qrPlaqueY + cornerRadius);
      ctx.quadraticCurveTo(qrPlaqueX, qrPlaqueY, qrPlaqueX + cornerRadius, qrPlaqueY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Draw the QR code with its custom background inside the plaque
      ctx.fillStyle = bgColor;
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
      URL.revokeObjectURL(url);
      
      const framePadding = 15;
      const frameLength = 60;
      const frameThickness = 4;
      ctx.strokeStyle = doodleColor;
      ctx.lineWidth = frameThickness;
      const p = qrPlaqueX - framePadding;
      const q = qrPlaqueY - framePadding;
      const r = qrPlaqueX + qrPlaqueSize + framePadding;
      const s = qrPlaqueY + qrPlaqueSize + framePadding;
      ctx.beginPath(); ctx.moveTo(p + frameLength, q); ctx.lineTo(p, q); ctx.lineTo(p, q + frameLength); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r - frameLength, q); ctx.lineTo(r, q); ctx.lineTo(r, q + frameLength); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p + frameLength, s); ctx.lineTo(p, s); ctx.lineTo(p, s - frameLength); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r - frameLength, s); ctx.lineTo(r, s); ctx.lineTo(r, s - frameLength); ctx.stroke();
      
      const centerX = cardSize / 2;
      const labelFontSize = 15;
      const valueFontSize = 34;
      const labelValueSpacing = 40;
      const groupSpacing = 55;
      const ssidLabelY = detailsYStart;
      const ssidValueY = ssidLabelY + labelValueSpacing;
      const passwordLabelY = ssidValueY + groupSpacing;
      const passwordValueY = passwordLabelY + labelValueSpacing;
      
      ctx.fillStyle = cardTextColorSubtle;
      ctx.font = `bold ${labelFontSize}px 'Inter', sans-serif`;
      ctx.letterSpacing = "1px";
      ctx.fillText('NETWORK (SSID)', centerX, ssidLabelY);

      ctx.fillStyle = cardTextColorMain;
      ctx.font = `${valueFontSize}px 'Inter', sans-serif`;
      ctx.letterSpacing = "0px";
      ctx.fillText(ssid, centerX, ssidValueY);
      
      ctx.fillStyle = cardTextColorSubtle;
      ctx.font = `bold ${labelFontSize}px 'Inter', sans-serif`;
      ctx.letterSpacing = "1px";
      ctx.fillText('PASSWORD', centerX, passwordLabelY);

      ctx.fillStyle = cardTextColorMain;
      ctx.font = `${valueFontSize}px 'Inter', sans-serif`;
      const displayPassword = (encryption === 'nopass' || !password) ? 'None / Open' : password;
      ctx.fillText(displayPassword, centerX, passwordValueY);
      
      ctx.font = "bold 14px 'Inter', sans-serif";
      ctx.fillStyle = cardTextColorSubtle;
      ctx.globalAlpha = 0.7;
      ctx.fillText('Made with QRlyph', centerX, footerY);
      ctx.globalAlpha = 1.0;
      
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const safeSsid = ssid.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'wifi';
      a.download = `qrlyph-wifi-card-${safeSsid}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = url;
  };
  
  const handleCopy = () => {
    if(!qrValue) return;
    navigator.clipboard.writeText(qrValue).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy Data'), 2000);
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB size limit
        alert("Logo image is too large. Please use an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBranding = () => {
    setFgColor('#000000');
    setBgColor('#FFFFFF');
    setLogoImage(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };
  
  useEffect(() => {
    handleResetBranding();
  }, [theme]);


  const encryptionOptions: { value: EncryptionType; label: string }[] = [
    { value: 'WPA', label: 'WPA' },
    { value: 'WPA2', label: 'WPA2' },
    { value: 'WPA3', label: 'WPA3' },
    { value: 'WEP', label: 'WEP' },
    { value: 'nopass', label: 'None/Open' },
  ];

  const PasswordIcon = encryption === 'nopass' ? IconLockOpen : IconLock;
  const inputClasses = "block w-full rounded-lg border-0 bg-surface pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-colors";
  const labelClasses = "block text-xs font-bold uppercase tracking-wider text-text-subtle mb-2";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
      <div ref={previewContainerRef} className="w-full flex flex-col gap-6 items-center justify-center">
        <QrCodePreview
          value={qrValue}
          ref={qrCodeRef}
          size={qrPreviewSize}
          theme={theme}
          fgColor={fgColor}
          bgColor={bgColor}
          logoImage={logoImage}
        />
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => handleDownload('png')} disabled={!qrValue} icon={<IconDownload />}>
            PNG
          </Button>
          <Button onClick={() => handleDownload('svg')} disabled={!qrValue} variant="secondary" icon={<IconDownload />}>
            SVG
          </Button>
          <Button onClick={handleExportCard} disabled={!qrValue} variant="secondary" icon={<IconCard />}>
            Export Card
          </Button>
          <Button onClick={handleCopy} disabled={!qrValue} variant="ghost" icon={<IconCopy />}>
            {copyText}
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="ssid" className={labelClasses}>
            Network Name (SSID)
          </label>
          <div className="relative rounded-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <IconWifi className="h-5 w-5 text-text-subtle" />
            </div>
            <input type="text" name="ssid" id="ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} className={inputClasses} placeholder="e.g., MyHomeWiFi" required aria-required="true" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <div className="relative rounded-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <PasswordIcon className="h-5 w-5 text-text-subtle" />
            </div>
            <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="Your network password" disabled={encryption === 'nopass'} />
          </div>
        </div>

        <div>
            <label className={labelClasses}>
                Encryption
            </label>
            <div className="flex flex-wrap items-center gap-2">
                {encryptionOptions.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setEncryption(opt.value)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          encryption === opt.value
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface text-text-main hover:bg-border/60'
                        }`}
                    >
                      {opt.label}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="flex items-center">
            <input id="hidden-network" name="hidden-network" type="checkbox" checked={isHidden} onChange={e => setIsHidden(e.target.checked)} className="h-4 w-4 rounded border border-border bg-background text-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent" />
            <label htmlFor="hidden-network" className="ml-3 block text-sm text-inherit">
                This is a hidden network
            </label>
        </div>

        <div className="pt-4">
            <div className="border-t border-border">
                <button onClick={() => setIsBrandingOpen(!isBrandingOpen)} className="w-full flex justify-between items-center py-3 text-left focus:outline-none" aria-expanded={isBrandingOpen} aria-controls="branding-panel">
                    <span className="flex items-center gap-3">
                        <IconColorLens className={`w-5 h-5 transition-colors ${isBrandingOpen ? 'text-accent' : 'text-text-subtle'}`} />
                        <span className={labelClasses + ' mb-0'}>Branding & Customization</span>
                    </span>
                    <IconExpand className={`w-6 h-6 text-text-subtle transition-transform ${isBrandingOpen ? 'rotate-180' : ''}`} />
                </button>
                {isBrandingOpen && (
                    <div id="branding-panel" className="space-y-6 pt-4 pb-2 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fgColor" className={labelClasses}>Foreground</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 flex-shrink-0">
                                        <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="w-full h-full rounded-md border border-border pointer-events-none" style={{ backgroundColor: fgColor }}></div>
                                    </div>
                                    <input type="text" id="fgColor" value={fgColor.toUpperCase()} onChange={e => setFgColor(e.target.value)} className="block w-full rounded-lg border-0 bg-surface px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-colors" />
                                 </div>
                            </div>
                             <div>
                                <label htmlFor="bgColor" className={labelClasses}>Background</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 flex-shrink-0">
                                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="w-full h-full rounded-md border border-border pointer-events-none" style={{ backgroundColor: bgColor }}></div>
                                    </div>
                                    <input type="text" id="bgColor" value={bgColor.toUpperCase()} onChange={e => setBgColor(e.target.value)} className="block w-full rounded-lg border-0 bg-surface px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-colors" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Center Logo</label>
                            {logoImage ? (
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-surface border border-border">
                                    <img src={logoImage} alt="Logo preview" className="w-10 h-10 object-contain rounded bg-white p-1" />
                                    <span className="flex-1 text-sm text-text-subtle truncate">Custom logo</span>
                                    <button onClick={() => { setLogoImage(null); if (logoInputRef.current) logoInputRef.current.value = ""; }} className="p-1 rounded-full text-text-subtle hover:bg-border" aria-label="Remove logo" >
                                        <IconClose className="w-5 h-5"/>
                                    </button>
                                </div>
                            ) : (
                                <Button type="button" onClick={() => logoInputRef.current?.click()} variant="secondary" icon={<IconUpload />} className="w-full" >
                                    Upload Image
                                </Button>
                            )}
                            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg, image/svg+xml" className="hidden" />
                            <p className="text-xs text-text-subtle mt-2">Optional. Use a square image under 1MB for best results.</p>
                        </div>
                        <Button onClick={handleResetBranding} variant="ghost" className="w-full !py-2 text-sm">
                            Reset Customization
                        </Button>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
