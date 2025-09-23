'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface EventJoinCodeProps {
  joinCode: string;
  eventCode: string;
}

export default function EventJoinCode({ joinCode, eventCode }: EventJoinCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = `${window.location.origin}/event/${eventCode}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1e40af',
            light: '#ffffff'
          }
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQRCode();
  }, [eventCode]);

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        📱 Quick Join
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="text-center">
          <p className="text-sm text-gray-700 mb-3">Scan to join event</p>
          {qrCodeDataUrl && (
            <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
              <img 
                src={qrCodeDataUrl} 
                alt="Event QR Code" 
                className="w-32 h-32 mx-auto"
              />
            </div>
          )}
        </div>

        {/* Join Code */}
        <div className="text-center">
          <p className="text-sm text-gray-700 mb-3">Or use join code</p>
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="text-3xl font-bold text-gray-900 tracking-widest mb-2">
              {joinCode}
            </div>
            <button
              onClick={copyJoinCode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600">
          Share this code or QR code with others to let them join your event
        </p>
      </div>
    </div>
  );
}