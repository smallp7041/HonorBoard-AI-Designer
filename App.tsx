import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { AppState, Layer, LayerType, TextLayer, ImageLayer } from './types';
import { editImageWithGemini } from './services/geminiService';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
    // Initial State with some defaults matching the example
    const [state, setState] = useState<AppState>({
        width: 600,
        height: 900,
        background: 'linear-gradient(135deg, #1a0b2e 0%, #4a0e4e 50%, #000000 100%)',
        layers: [
            // Badge Code
            {
                id: '1', type: LayerType.TEXT, x: 20, y: 8, rotation: 0, scale: 1, zIndex: 10, isVisible: true,
                content: 'TP071', fontFamily: '"Montserrat", sans-serif', fontSize: 32, color: '#ffffff',
                isGradient: false, fontWeight: '700', textAlign: 'left', shadow: true, strokeWidth: 0, strokeColor: '#000000'
            },
            // Name
            {
                id: '2', type: LayerType.TEXT, x: 50, y: 70, rotation: 0, scale: 1, zIndex: 10, isVisible: true,
                content: '蘇昱志', fontFamily: '"Noto Sans TC", sans-serif', fontSize: 64, color: '#ffffff',
                isGradient: false, fontWeight: '700', textAlign: 'center', shadow: true, strokeWidth: 0, strokeColor: '#000000'
            },
            // Title
            {
                id: '3', type: LayerType.TEXT, x: 80, y: 72, rotation: 0, scale: 1, zIndex: 10, isVisible: true,
                content: '業務經理', fontFamily: '"Noto Sans TC", sans-serif', fontSize: 24, color: '#00BFFF',
                isGradient: false, fontWeight: '700', textAlign: 'left', shadow: false, strokeWidth: 0, strokeColor: '#000000'
            },
            // Year
            {
                id: '4', type: LayerType.TEXT, x: 50, y: 50, rotation: 0, scale: 1, zIndex: 5, isVisible: true,
                content: '2026', fontFamily: '"Montserrat", sans-serif', fontSize: 100, color: '#ffffff',
                isGradient: true, gradientStart: '#ff00cc', gradientEnd: '#ffffff', fontWeight: '900', textAlign: 'center', shadow: true, strokeWidth: 0, strokeColor: '#000000'
            },
             // Big Number
             {
                id: '5', type: LayerType.TEXT, x: 18, y: 58, rotation: 0, scale: 1, zIndex: 6, isVisible: true,
                content: '3', fontFamily: '"Roboto", sans-serif', fontSize: 180, color: '#FFD700',
                isGradient: true, gradientStart: '#FF8C00', gradientEnd: '#FFD700', fontWeight: '900', textAlign: 'center', shadow: true, strokeWidth: 0, strokeColor: '#000000'
            },
             // Achievement Text
             {
                id: '6', type: LayerType.TEXT, x: 60, y: 58, rotation: 0, scale: 1, zIndex: 6, isVisible: true,
                content: '百萬店長', fontFamily: '"Noto Sans TC", sans-serif', fontSize: 60, color: '#ffffff',
                isGradient: true, gradientStart: '#ffffff', gradientEnd: '#ff00cc', fontWeight: '900', textAlign: 'left', shadow: true, strokeWidth: 0, strokeColor: '#000000'
            },
            // FYC
            {
                id: '7', type: LayerType.TEXT, x: 50, y: 85, rotation: 0, scale: 1, zIndex: 10, isVisible: true,
                content: 'FYC 3,810,626', fontFamily: '"Montserrat", sans-serif', fontSize: 42, color: '#ffffff',
                isGradient: false, fontWeight: '400', textAlign: 'center', shadow: true, strokeWidth: 0, strokeColor: '#000000'
            }
        ],
        selectedLayerId: null,
        isGeneratingAI: false
    });

    const canvasRef = useRef<HTMLDivElement>(null);

    const updateLayer = (id: string, updates: any) => {
        setState(prev => ({
            ...prev,
            layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
        }));
    };

    const addTextLayer = () => {
        const newLayer: TextLayer = {
            id: uuidv4(),
            type: LayerType.TEXT,
            x: 50,
            y: 50,
            rotation: 0,
            scale: 1,
            zIndex: state.layers.length + 1,
            isVisible: true,
            content: '新文字',
            fontFamily: '"Noto Sans TC", sans-serif',
            fontSize: 40,
            color: '#ffffff',
            isGradient: false,
            fontWeight: '700',
            textAlign: 'center',
            shadow: true,
            strokeWidth: 0,
            strokeColor: '#000000'
        };
        setState(prev => ({ ...prev, layers: [...prev.layers, newLayer], selectedLayerId: newLayer.id }));
    };

    const addImageLayer = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                const newSrc = e.target.result as string;

                // Find existing image layer
                const existingLayer = state.layers.find(l => l.type === LayerType.IMAGE);

                if (existingLayer) {
                    // Replace existing image
                    updateLayer(existingLayer.id, { src: newSrc });
                    setState(prev => ({ ...prev, selectedLayerId: existingLayer.id }));
                } else {
                    // Create new image layer
                    const newLayer: ImageLayer = {
                        id: uuidv4(),
                        type: LayerType.IMAGE,
                        x: 50,
                        y: 35, // Default positioning for portrait
                        rotation: 0,
                        scale: 1,
                        zIndex: 2, // Behind text usually
                        isVisible: true,
                        src: newSrc,
                        opacity: 1,
                        mask: 'none'
                    };
                    
                    setState(prev => ({ 
                        ...prev, 
                        layers: [...prev.layers, newLayer], 
                        selectedLayerId: newLayer.id
                    }));
                }
            }
        };
        reader.readAsDataURL(file);
    };

    const setBackground = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setState(prev => ({ ...prev, background: e.target?.result as string }));
            }
        };
        reader.readAsDataURL(file);
    };

    const deleteLayer = (id: string) => {
        setState(prev => ({
            ...prev,
            layers: prev.layers.filter(l => l.id !== id),
            selectedLayerId: null
        }));
    };

    const exportImage = async () => {
        if (!canvasRef.current) return;
        
        setState(prev => ({ ...prev, selectedLayerId: null }));
        
        setTimeout(async () => {
            try {
                await document.fonts.ready;

                const dataUrl = await toPng(canvasRef.current!, {
                     cacheBust: true,
                     pixelRatio: 2, 
                     width: 600,
                     height: 900,
                     style: {
                        transform: 'none', 
                        margin: '0',
                        padding: '0',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                     }
                });
                
                const link = document.createElement('a');
                link.download = `HonorBoard-${new Date().getFullYear()}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error("Export failed", err);
                alert("Export failed. Please try again.");
            }
        }, 500); 
    };

    const exportPdf = async () => {
        if (!canvasRef.current) return;
        
        // 1. Deselect everything for clean capture
        setState(prev => ({ ...prev, selectedLayerId: null }));
        
        setTimeout(async () => {
            try {
                await document.fonts.ready;

                // 2. Generate High Resolution Image for PDF
                // pixelRatio 3 is usually 300dpi equivalent for screens, sufficient for high quality print
                const dataUrl = await toPng(canvasRef.current!, {
                     cacheBust: true,
                     pixelRatio: 4, 
                     width: 600,
                     height: 900,
                     style: {
                        transform: 'none', 
                        margin: '0',
                        padding: '0',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                     }
                });

                // 3. Initialize PDF
                // A4 size: 210mm x 297mm
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth(); // 210
                const pageHeight = pdf.internal.pageSize.getHeight(); // 297
                
                // Calculate dimensions to center the poster
                // Poster aspect ratio is 600:900 = 1:1.5
                // Page aspect ratio is 210:297 = 1:1.414
                
                // Since 1.5 > 1.414, the poster is "taller" relative to its width than the page.
                // We should fit by height.
                
                let imgHeight = pageHeight;
                let imgWidth = imgHeight * (600 / 900); // Maintain aspect ratio
                
                // If by some chance width is too big (shouldn't happen with A4 portrait vs 2:3), check it
                if (imgWidth > pageWidth) {
                    imgWidth = pageWidth;
                    imgHeight = imgWidth * (900 / 600);
                }
                
                const x = (pageWidth - imgWidth) / 2;
                const y = (pageHeight - imgHeight) / 2;

                pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
                pdf.save(`HonorBoard-${new Date().getFullYear()}.pdf`);

            } catch (err) {
                console.error("PDF Export failed", err);
                alert("PDF Export failed. Please try again.");
            }
        }, 500);
    };

    // Correct implementation of AI Edit flow
    const runAiEdit = async (prompt: string) => {
        const layer = state.layers.find(l => l.id === state.selectedLayerId) as ImageLayer;
        if (!layer) return;

        setState(prev => ({ ...prev, isGeneratingAI: true }));

        try {
            const newImageBase64 = await editImageWithGemini(layer.src, prompt);
            updateLayer(layer.id, { src: newImageBase64 });
        } catch (error) {
            console.error(error);
            alert("AI generation failed. Please check your API Key or try a different prompt. Note: Gemini requires valid API key.");
        } finally {
            setState(prev => ({ ...prev, isGeneratingAI: false }));
        }
    };

    const selectedLayer = state.layers.find((l: Layer) => l.id === state.selectedLayerId) || null;

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative">
                <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-6 justify-between z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <i className="fas fa-award text-white text-sm"></i>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            HONOR BOARD <span className="text-blue-400 font-light">AI DESIGNER</span>
                        </h1>
                    </div>
                    <div className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                         {state.selectedLayerId ? '編輯模式 (Editing)' : '預覽模式 (Preview)'}
                    </div>
                </header>
                
                <main className="flex-1 overflow-auto bg-gray-950 flex relative">
                   {/* Grid Pattern Background */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        position: 'fixed' // Fix background to viewport so it doesn't scroll awkwardly
                   }}></div>

                   <div className="m-auto p-10">
                       <Canvas 
                            state={state} 
                            onSelectLayer={(id) => setState(prev => ({ ...prev, selectedLayerId: id }))}
                            onUpdateLayer={updateLayer}
                            canvasRef={canvasRef}
                       />
                   </div>
                </main>
            </div>

            <ControlPanel 
                selectedLayer={selectedLayer}
                onUpdateLayer={updateLayer}
                onAddText={addTextLayer}
                onAddImage={addImageLayer}
                onSetBackground={setBackground}
                onDeleteLayer={deleteLayer}
                onExport={exportImage}
                onExportPdf={exportPdf}
                onEditWithAI={runAiEdit}
                isGeneratingAI={state.isGeneratingAI}
            />
        </div>
    );
};

export default App;