import React, { useRef, useState, useEffect } from 'react';
import { EditorSlide, SlideElement } from '../../types';

interface Props {
  slide: EditorSlide;
}

export const CustomSlideRenderer: React.FC<Props> = ({ slide }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState<number>(1000);

  useEffect(() => {
    if (!stageRef.current) return;
    const updateSize = () => {
      if (stageRef.current) {
        setStageWidth(stageRef.current.clientWidth || 1000);
      }
    };
    updateSize();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setStageWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const fontScale = stageWidth > 0 ? stageWidth / 1000 : 1;
  const scaledFontSize = (size?: number, fallback = 24) => {
    const base = size || fallback;
    return Math.max(9, Math.round(base * fontScale));
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center p-2 sm:p-8"
      style={{
        backgroundColor:
          slide.background?.value?.startsWith('#') || slide.background?.value?.startsWith('rgb')
            ? slide.background.value
            : '#FFFFFF',
        backgroundImage:
          slide.background?.type === 'gradient'
            ? slide.background.value
            : slide.background?.type === 'image'
            ? `url(${slide.background.value})`
            : undefined,
        backgroundSize: slide.background?.fit || 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 16:9 Stage */}
      <div
        ref={stageRef}
        className="w-full max-w-6xl aspect-video relative overflow-hidden flex items-center justify-center select-none shadow-2xl rounded-2xl"
      >
        {slide.elements.map((el) => {
          return (
            <div
              key={el.id}
              className="absolute transition-all"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                transform: `rotate(${el.rotation || 0}deg)`,
                zIndex: el.zIndex,
                opacity: el.opacity !== undefined ? el.opacity : 1,
              }}
            >
              {el.type === 'text' && (
                <div
                  className="w-full h-full whitespace-pre-wrap flex flex-col justify-center"
                  style={{
                    fontFamily:
                      el.style.fontFamily === 'serif' ? 'Playfair Display, serif' : 'Montserrat, sans-serif',
                    fontSize: `${scaledFontSize(el.style.fontSize, 24)}px`,
                    fontWeight: el.style.fontWeight || 'normal',
                    fontStyle: el.style.fontStyle || 'normal',
                    textDecoration: el.style.textDecoration || 'none',
                    color: el.style.color || '#2C2C2C',
                    textAlign: el.style.textAlign || 'left',
                    lineHeight: el.style.lineHeight || 1.3,
                    letterSpacing: el.style.letterSpacing ? `${el.style.letterSpacing * fontScale}px` : undefined,
                    textTransform: el.style.textTransform || 'none',
                  }}
                >
                  {el.content}
                </div>
              )}

              {el.type === 'image' && (
                <img
                  src={el.content}
                  alt={el.name || 'Imagem'}
                  className="w-full h-full object-cover"
                  style={{
                    objectFit: el.style.objectFit || 'cover',
                    borderRadius: el.style.borderRadius ? `${el.style.borderRadius * fontScale}px` : '0px',
                    boxShadow: el.style.shadow ? '0 15px 30px -5px rgba(0, 0, 0, 0.15)' : 'none',
                  }}
                />
              )}

              {el.type === 'shape' && (
                <div
                  className={`w-full h-full ${el.style.shapeType === 'circle' ? 'rounded-full' : ''}`}
                  style={{
                    backgroundColor: el.style.backgroundColor || '#3A6351',
                    borderRadius:
                      el.style.shapeType === 'circle'
                        ? '9999px'
                        : el.style.borderRadius !== undefined
                        ? `${el.style.borderRadius * fontScale}px`
                        : '16px',
                    borderColor: el.style.borderColor || 'transparent',
                    borderWidth: el.style.borderWidth ? `${el.style.borderWidth}px` : '0px',
                  }}
                />
              )}

              {el.type === 'number' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center select-none">
                  <span
                    className="font-bold font-serif leading-none tracking-tight"
                    style={{
                      fontSize: `${scaledFontSize(el.style.fontSize, 64)}px`,
                      color: el.style.color || '#3A6351',
                    }}
                  >
                    {el.content}
                  </span>
                  {el.secondaryContent && (
                    <p
                      className="text-gray-500 font-sans mt-2 max-w-[85%] leading-snug"
                      style={{ fontSize: `${scaledFontSize(14, 14)}px` }}
                    >
                      {el.secondaryContent}
                    </p>
                  )}
                </div>
              )}

              {el.type === 'quote' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 text-center select-none">
                  <p
                    className="font-serif italic leading-relaxed"
                    style={{
                      fontSize: `${scaledFontSize(el.style.fontSize, 28)}px`,
                      color: el.style.color || '#2C2C2C',
                    }}
                  >
                    {el.content}
                  </p>
                  {el.secondaryContent && (
                    <span
                      className="uppercase tracking-widest text-[#3A6351] font-bold font-sans mt-2 sm:mt-4"
                      style={{ fontSize: `${scaledFontSize(11, 11)}px` }}
                    >
                      {el.secondaryContent}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
