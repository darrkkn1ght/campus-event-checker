import React from 'react';
import { QrReader } from '@blackbox-vision/react-qr-reader';

const QRScanner = ({ open, onScan, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-lg p-6 relative w-full max-w-md mx-auto flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="Close QR Scanner"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-700">Scan Ticket QR Code</h2>
        <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={(result, error) => {
              if (!!result) {
                onScan(result?.text);
              }
            }}
            containerStyle={{ width: '100%', height: '100%' }}
            videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <p className="mt-4 text-gray-500 text-sm">Point your camera at a valid ticket QR code.</p>
      </div>
    </div>
  );
};

export default QRScanner; 