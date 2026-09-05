import React from 'react';
import { EditorSlide, SlideElement } from '../../types';

interface Props {
  slide: EditorSlide;
}

export const CustomSlideRenderer: React.FC<Props> = ({ slide }) => {
  return (
    <div
      className="w-full h-full flex items-center justify-center p-4 sm:p-8"
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
      <div className="w-full max-w-6xl aspect-video relative overflow-hidden flex items-center justify-center select-none shadow-2xl rounded-2xl">
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
                    fontSize: `${el.style.fontSize || 24}px`,
                    fontWeight: el.style.fontWeight || 'normal',
                    fontStyle: el.style.fontStyle || 'normal',
                    textDecoration: el.style.textDecoration || 'none',
                    color: el.style.color || '#2C2C2C',
                    textAlign: el.style.textAlign || 'left',
                    lineHeight: el.style.lineHeight || 1.3,
                    letterSpacing: el.style.letterSpacing ? `${el.style.letterSpacing}px` : undefined,
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
                    borderRadius: el.style.borderRadius ? `${el.style.borderRadius}px` : '0px',
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
                        ? `${el.style.borderRadius}px`
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
                      fontSize: `${el.style.fontSize || 64}px`,
                      color: el.style.color || '#3A6351',
                    }}
                  >
                    {el.content}
                  </span>
                  {el.secondaryContent && (
                    <p className="text-sm sm:text-base text-gray-500 font-sans mt-3 max-w-[85%] leading-snug">
                      {el.secondaryContent}
                    </p>
                  )}
                </div>
              )}

              {el.type === 'quote' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
                  <p
                    className="font-serif italic leading-relaxed"
                    style={{
                      fontSize: `${el.style.fontSize || 32}px`,
                      color: el.style.color || '#2C2C2C',
                    }}
                  >
                    {el.content}
                  </p>
                  {el.secondaryContent && (
                    <span className="text-xs uppercase tracking-widest text-[#3A6351] font-bold font-sans mt-4">
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
