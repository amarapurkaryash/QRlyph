
import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IconQrCode } from './icons';
import type { Theme } from '../types';

interface QrCodePreviewProps {
  value: string;
  size?: number;
  theme: Theme;
  fgColor: string;
  bgColor: string;
  logoImage: string | null;
}

const QrCodePreview = forwardRef<SVGSVGElement, QrCodePreviewProps>(({ value, size = 256, theme, fgColor, bgColor, logoImage }, ref) => {
  const uniqueKey = `${value}-${fgColor}-${bgColor}-${logoImage}`;

  return (
    <div 
      key={uniqueKey}
      className="relative flex items-center justify-center bg-surface p-6 rounded-xl border border-border w-full aspect-square"
    >
      {value ? (
        <div className="animate-fade-in-scale shadow-md rounded-lg overflow-hidden" style={{ backgroundColor: bgColor }}>
            <QRCodeSVG
                ref={ref}
                value={value}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H" 
                includeMargin={true}
                imageSettings={logoImage ? {
                  src: logoImage,
                  height: size * 0.2,
                  width: size * 0.2,
                  excavate: true,
                } : undefined}
            />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-text-subtle">
          <IconQrCode className="w-24 h-24 mb-4 opacity-30" />
          <p className="font-semibold text-text-main">Your QR Code will appear here</p>
          <p className="text-sm mt-1">Fill in the Wi-Fi details to generate it.</p>
        </div>
      )}
    </div>
  );
});

QrCodePreview.displayName = 'QrCodePreview';
export default QrCodePreview;