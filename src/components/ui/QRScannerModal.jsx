import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export function QRScannerModal({ isOpen, onClose, onScan }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-midnight border border-steel/20 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-steel/20 flex justify-between items-center bg-midnight/80">
          <h3 className="text-white font-display font-bold text-lg">Scan QR Code</h3>
          <button onClick={onClose} className="text-steel hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 bg-steel/5 aspect-square flex items-center justify-center">
          <Scanner 
            onScan={(result) => {
              if (result && result.length > 0) {
                onScan(result[0].rawValue);
              }
            }} 
            onError={(e) => console.error(e)}
            components={{
              audio: false,
              onOff: false,
              torch: false,
              zoom: false,
              finder: true,
            }}
          />
        </div>
        <div className="p-4 text-center text-sm text-steel font-body">
          Scan the QR code from the recipient's phone to instantly complete the pickup.
        </div>
      </div>
    </div>
  );
}
