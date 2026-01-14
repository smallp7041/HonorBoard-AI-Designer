import React from 'react';
import { LayerType, AppState, TextLayer, ImageLayer } from '../types';
import { DraggableLayer } from './DraggableLayer';

interface CanvasProps {
    state: AppState;
    onSelectLayer: (id: string) => void;
    onUpdateLayer: (id: string, updates: any) => void;
    canvasRef: React.RefObject<HTMLDivElement>;
}

export const Canvas: React.FC<CanvasProps> = ({ state, onSelectLayer, onUpdateLayer, canvasRef }) => {
    const canvasWidth = 600;
    const canvasHeight = 900; 

    const renderLayer = (layer: TextLayer | ImageLayer) => {
        if (!layer.isVisible) return null;

        if (layer.type === LayerType.TEXT) {
            const hasStroke = layer.strokeWidth > 0;
            
            // CSS Fixes for Export:
            // 1. display: 'inline-block' prevents background-clip from collapsing in exports.
            // 2. backgroundSize: '100% 100%' ensures gradient covers the full text rect.
            // 3. textRendering: 'geometricPrecision' helps with font definition in canvas.
            
            const textStyle: React.CSSProperties = {
                display: 'inline-block', 
                fontFamily: layer.fontFamily,
                fontSize: `${layer.fontSize}px`,
                fontWeight: layer.fontWeight,
                textAlign: layer.textAlign,
                whiteSpace: 'pre', // Changed from pre-wrap to pre to keep layout tighter
                lineHeight: 1.1,   // Tighter line height prevents vertical shifts
                letterSpacing: '0px', // Explicitly set to avoid browser differences
                
                // Rendering improvements
                textRendering: 'geometricPrecision',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',

                // Color & Gradient handling
                color: layer.isGradient ? 'transparent' : layer.color,
                WebkitTextFillColor: layer.isGradient ? 'transparent' : layer.color,
                
                backgroundImage: layer.isGradient 
                    ? `linear-gradient(to bottom, ${layer.gradientStart || '#FFD700'}, ${layer.gradientEnd || '#FF8C00'})`
                    : 'none',
                backgroundSize: '100% 100%',
                    
                WebkitBackgroundClip: layer.isGradient ? 'text' : 'border-box',
                backgroundClip: layer.isGradient ? 'text' : 'border-box',
                
                // Ensure gradient applies correctly across lines
                WebkitBoxDecorationBreak: 'clone',
                boxDecorationBreak: 'clone',
                
                // Shadow & Stroke
                filter: layer.shadow ? `drop-shadow(2px 2px 2px ${layer.shadowColor || 'rgba(0,0,0,0.8)'})` : 'none',
                
                // Text Stroke - CRITICAL FIX: Use 'none' instead of '0px transparent' to allow subpixel rendering
                WebkitTextStroke: hasStroke ? `${layer.strokeWidth}px ${layer.strokeColor}` : 'none',
            };

            return (
                <div style={textStyle} className="px-2 py-1 relative">
                    {layer.content}
                </div>
            );
        }

        if (layer.type === LayerType.IMAGE) {
            const imgStyle: React.CSSProperties = {
                opacity: layer.opacity,
                maxWidth: '600px', 
                maxHeight: '900px',
                pointerEvents: 'none',
            };
            
            // Apply mask based on type
            let maskClass = "";
            switch (layer.mask) {
                case 'circle':
                    maskClass = "mask-circle";
                    break;
                case 'gradient-bottom':
                    maskClass = "mask-gradient-bottom";
                    break;
                case 'gradient-bottom-strong':
                    maskClass = "mask-gradient-bottom-strong";
                    break;
                case 'gradient-top':
                    maskClass = "mask-gradient-top";
                    break;
                case 'gradient-left':
                    maskClass = "mask-gradient-left";
                    break;
                case 'gradient-right':
                    maskClass = "mask-gradient-right";
                    break;
                case 'soft-rect':
                    maskClass = "mask-soft-rect";
                    break;
                case 'diagonal':
                    maskClass = "mask-diagonal";
                    break;
                default:
                    maskClass = "";
            }

            return (
                 <div className="relative">
                     <img 
                        src={layer.src} 
                        alt="User Upload" 
                        style={imgStyle}
                        className={maskClass}
                     />
                 </div>
            );
        }

        return null;
    };

    return (
        <div 
            ref={canvasRef}
            id="poster-canvas"
            className="relative bg-white shadow-2xl overflow-hidden shrink-0"
            style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                minWidth: `${canvasWidth}px`, // Enforce size
                minHeight: `${canvasHeight}px`,
                backgroundColor: '#000',
                backgroundImage: state.background.startsWith('http') || state.background.startsWith('data:') 
                    ? `url(${state.background})` 
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // Canvas-wide text rendering settings
                textRendering: 'geometricPrecision',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
            }}
            onClick={() => onSelectLayer('')}
        >
            {/* 
               CRITICAL FIX for Export:
               Embedding styles directly ensures html-to-image captures them correctly
               without relying on global stylesheet parsing which can be flaky.
            */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Audiowide&family=Bangers&family=Cinzel:wght@400;700;900&family=Great+Vibes&family=Long+Cang&family=Ma+Shan+Zheng&family=Montserrat:wght@400;700;900&family=Noto+Sans+TC:wght@400;700;900&family=Noto+Serif+TC:wght@400;700;900&family=Orbitron:wght@400;700;900&family=Oswald:wght@400;700&family=Permanent+Marker&family=Playfair+Display:wght@400;700;900&family=Righteous&family=Roboto:wght@400;700;900&family=ZCOOL+KuaiLe&family=ZCOOL+XiaoWei&display=swap');

                    /* --- CSS Masks for Image Blending --- */
                    
                    /* 1. Standard Fade Bottom */
                    .mask-gradient-bottom {
                        -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
                        mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
                    }

                    /* 2. Strong Fade Bottom (More gradual) */
                    .mask-gradient-bottom-strong {
                        -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
                        mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
                    }

                    /* 3. Fade Top */
                    .mask-gradient-top {
                        -webkit-mask-image: linear-gradient(to top, black 60%, transparent 100%);
                        mask-image: linear-gradient(to top, black 60%, transparent 100%);
                    }

                    /* 4. Fade Left (Right side visible, left side fades) */
                    .mask-gradient-left {
                        -webkit-mask-image: linear-gradient(to left, black 60%, transparent 100%);
                        mask-image: linear-gradient(to left, black 60%, transparent 100%);
                    }

                    /* 5. Fade Right (Left side visible, right side fades) */
                    .mask-gradient-right {
                        -webkit-mask-image: linear-gradient(to right, black 60%, transparent 100%);
                        mask-image: linear-gradient(to right, black 60%, transparent 100%);
                    }

                    /* 6. Circle */
                    .mask-circle {
                        -webkit-mask-image: radial-gradient(circle, black 50%, transparent 100%);
                        mask-image: radial-gradient(circle, black 50%, transparent 100%);
                        border-radius: 50%;
                    }

                    /* 7. Soft Rect (Vignette) */
                    .mask-soft-rect {
                        -webkit-mask-image: radial-gradient(ellipse at center, black 50%, transparent 100%);
                        mask-image: radial-gradient(ellipse at center, black 50%, transparent 100%);
                    }

                    /* 8. Diagonal Slice */
                    .mask-diagonal {
                        -webkit-mask-image: linear-gradient(135deg, black 60%, transparent 90%);
                        mask-image: linear-gradient(135deg, black 60%, transparent 90%);
                    }
                `}
            </style>

            {/* Background Color Fallback */}
            {!state.background.startsWith('http') && !state.background.startsWith('data:') && (
                <div className="absolute inset-0" style={{ backgroundColor: state.background }} />
            )}

            {state.layers.map((layer) => (
                <DraggableLayer
                    key={layer.id}
                    layer={layer}
                    isSelected={state.selectedLayerId === layer.id}
                    onSelect={onSelectLayer}
                    onUpdate={onUpdateLayer}
                    canvasSize={{ width: canvasWidth, height: canvasHeight }}
                >
                    {renderLayer(layer)}
                </DraggableLayer>
            ))}
        </div>
    );
};