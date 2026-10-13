import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ChevronLeft, ChevronRight, Download, Check } from 'lucide-react';
import { downloadImage } from '../../utils/download';
import { resolveImageUrl } from '../../utils/imageAssets';

export const ImageViewerModal: React.FC = () => {
  const { imageViewer, closeImageViewer, nextImage, prevImage, showToast } = useApp();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageViewer.isOpen) return;
      if (e.key === 'Escape') closeImageViewer();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageViewer.isOpen, closeImageViewer, nextImage, prevImage]);

  if (!imageViewer.isOpen || !imageViewer.images.length) return null;

  const rawImage = imageViewer.images[imageViewer.activeIndex];
  const currentImage = resolveImageUrl(rawImage);
  const totalCount = imageViewer.images.length;
  const currentIndex = imageViewer.activeIndex + 1;

  const handleDownload = async () => {
    setDownloading(true);
    const filename = `campaign-flyer-${currentIndex}.jpg`;
    await downloadImage(currentImage, filename);
    showToast(`Downloaded ${filename}`, 'success');
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6 transition-all duration-200">
      {/* Top Bar with [ Download ] [ X ] */}
      <div className="w-full max-w-4xl flex items-center justify-between py-2 text-white">
        <div>
          {totalCount > 1 ? (
            <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-white border border-slate-700">
              {currentIndex} / {totalCount}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400">
              Flyer Preview
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            title="Download Flyer"
          >
            {downloading ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-blue-400" />
            )}
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={closeImageViewer}
            className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden my-3">
        <img
          src={currentImage}
          alt={`Flyer ${currentIndex}`}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl transition-all select-none"
          referrerPolicy="no-referrer"
        />

        {/* Previous Button (if multiple images) */}
        {totalCount > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 sm:left-4 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-700 transition-all active:scale-95 cursor-pointer"
            aria-label="Previous flyer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button (if multiple images) */}
        {totalCount > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 sm:right-4 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-700 transition-all active:scale-95 cursor-pointer"
            aria-label="Next flyer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip (if multiple images) */}
      <div className="w-full max-w-md flex items-center justify-center gap-2 py-2">
        {totalCount > 1 &&
          imageViewer.images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const step = idx - imageViewer.activeIndex;
                if (step > 0) {
                  for (let i = 0; i < step; i++) nextImage();
                } else if (step < 0) {
                  for (let i = 0; i < Math.abs(step); i++) prevImage();
                }
              }}
              className={`w-12 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                idx === imageViewer.activeIndex
                  ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/20'
                  : 'border-slate-800 opacity-40 hover:opacity-80'
              }`}
            >
              <img
                src={img}
                alt={`Thumb ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
      </div>
    </div>
  );
};
