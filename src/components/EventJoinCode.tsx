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
    <div className="bg-white border border-gray-300 shadow-sm">
      {/* Header */}
      <div className="border-b-2 border-green-700 bg-green-50 px-6 py-4">
        <h3 className="text-xl font-serif font-bold text-green-800 text-center">
          INVITE PARTICIPANTS
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">
              Scan QR Code
            </h4>
            {qrCodeDataUrl && (
              <div className="inline-block p-6 bg-white border-2 border-gray-300">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Event QR Code" 
                  className="w-36 h-36 mx-auto"
                />
              </div>
            )}
            <p className="text-xs text-gray-800 mt-3 uppercase tracking-wide">
              Point camera at code to join
            </p>
          </div>

          {/* Join Code */}
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">
              Join Code
            </h4>
            <div className="bg-gray-50 border-2 border-gray-300 p-6">
              <div className="text-4xl font-mono font-bold text-green-800 tracking-widest mb-4">
                {joinCode}
              </div>
              <button
                onClick={copyJoinCode}
                className={`px-6 py-2 font-semibold border-2 transition-all duration-200 ${
                  copied 
                    ? 'bg-green-700 text-white border-green-700' 
                    : 'bg-white text-green-700 border-green-700 hover:bg-green-50'
                }`}
              >
                {copied ? 'COPIED!' : 'COPY CODE'}
              </button>
            </div>
            <p className="text-xs text-gray-800 mt-3 uppercase tracking-wide">
              Share this 6-digit code
            </p>
          </div>
        </div>

        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-800 uppercase tracking-wide">
            Participants can scan the QR code or enter the join code to access your event
          </p>
        </div>
      </div>
    </div>
  );
}