import React, { useRef, useState } from 'react';
import { LayerType, TextLayer, ImageLayer, FONTS } from '../types';

interface ControlPanelProps {
    selectedLayer: TextLayer | ImageLayer | null;
    onUpdateLayer: (id: string, updates: any) => void;
    onAddText: () => void;
    onAddImage: (file: File) => void;
    onSetBackground: (file: File) => void;
    onDeleteLayer: (id: string) => void;
    onExport: () => void;
    onExportPdf: () => void;
    onEditWithAI: (prompt: string) => void;
    isGeneratingAI: boolean;
}

const TEXT_PRESETS = [
    { 
        name: '書法墨韻', 
        style: { fontFamily: '"Ma Shan Zheng", cursive', isGradient: false, color: '#0d0d0d', shadow: true, shadowColor: 'rgba(0,0,0,0.3)', strokeWidth: 0, fontWeight: '400' } 
    },
    { 
        name: '烈焰燃燒', 
        style: { fontFamily: '"Bangers", cursive', isGradient: true, gradientStart: '#FF0000', gradientEnd: '#FFFF00', color: '#FF0000', shadow: true, shadowColor: '#500000', strokeWidth: 0 } 
    },
    { 
        name: '冰河世紀', 
        style: { fontFamily: '"Oswald", sans-serif', isGradient: true, gradientStart: '#E0F7FA', gradientEnd: '#00BFFF', color: '#00BFFF', shadow: true, shadowColor: '#FFFFFF', strokeWidth: 0 } 
    },
    { 
        name: '綠野仙蹤', 
        style: { fontFamily: '"ZCOOL KuaiLe", cursive', isGradient: true, gradientStart: '#76FF03', gradientEnd: '#006400', color: '#008000', shadow: true, shadowColor: '#000000', strokeWidth: 0 } 
    },
    { 
        name: '榮耀金', 
        style: { fontFamily: '"Cinzel", serif', isGradient: true, gradientStart: '#FFD700', gradientEnd: '#BF953F', color: '#FFD700', shadow: true, shadowColor: '#000000', strokeWidth: 0 } 
    },
    { 
        name: '霓虹粉', 
        style: { fontFamily: '"Montserrat", sans-serif', isGradient: true, gradientStart: '#ff00cc', gradientEnd: '#333399', color: '#ff00cc', shadow: true, shadowColor: 'rgba(255,0,204,0.5)', strokeWidth: 0 } 
    },
    { 
        name: '黑金霸氣', 
        style: { fontFamily: '"Noto Serif TC", serif', isGradient: false, color: '#1a1a1a', shadow: true, shadowColor: 'rgba(255,215,0,0.5)', strokeWidth: 2, strokeColor: '#FFD700' } 
    },
    { 
        name: '純白極簡', 
        style: { fontFamily: '"Noto Sans TC", sans-serif', isGradient: false, color: '#ffffff', shadow: true, shadowColor: 'rgba(0,0,0,0.5)', strokeWidth: 0 } 
    },
    {
        name: '科技藍',
        style: { fontFamily: '"Orbitron", sans-serif', isGradient: true, gradientStart: '#00FFFF', gradientEnd: '#00BFFF', color: '#00FFFF', shadow: true, shadowColor: '#000000', strokeWidth: 0 } 
    },
    {
        name: '鈦金屬',
        style: { fontFamily: '"Montserrat", sans-serif', isGradient: true, gradientStart: '#E0E0E0', gradientEnd: '#707070', color: '#C0C0C0', shadow: true, shadowColor: '#000000', strokeWidth: 1, strokeColor: '#FFFFFF' }
    },
    {
        name: '賽博龐克',
        style: { fontFamily: '"Orbitron", sans-serif', isGradient: true, gradientStart: '#00FF00', gradientEnd: '#FF00FF', color: '#00FF00', shadow: true, shadowColor: '#000000', strokeWidth: 0 } 
    },
    {
        name: '優雅奢華',
        style: { fontFamily: '"Playfair Display", serif', isGradient: true, gradientStart: '#E0AAFF', gradientEnd: '#7B2CBF', color: '#7B2CBF', shadow: true, shadowColor: '#FFFFFF', strokeWidth: 0 }
    }
];

const MASK_PRESETS = [
    { name: '無', value: 'none', icon: 'fa-square' },
    { name: '底部漸層', value: 'gradient-bottom', icon: 'fa-arrow-down' },
    { name: '長底部漸層', value: 'gradient-bottom-strong', icon: 'fa-arrow-down-long' },
    { name: '頂部漸層', value: 'gradient-top', icon: 'fa-arrow-up' },
    { name: '左側漸層', value: 'gradient-left', icon: 'fa-arrow-left' },
    { name: '右側漸層', value: 'gradient-right', icon: 'fa-arrow-right' },
    { name: '圓形', value: 'circle', icon: 'fa-circle' },
    { name: '柔邊', value: 'soft-rect', icon: 'fa-cloud' },
    { name: '對角切', value: 'diagonal', icon: 'fa-slash' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
    selectedLayer,
    onUpdateLayer,
    onAddText,
    onAddImage,
    onSetBackground,
    onDeleteLayer,
    onExport,
    onExportPdf,
    onEditWithAI,
    isGeneratingAI
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);
    const [aiPrompt, setAiPrompt] = useState("");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onAddImage(e.target.files[0]);
            e.target.value = '';
        }
    };

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onSetBackground(e.target.files[0]);
            e.target.value = '';
        }
    };

    const toggleFontWeight = (currentWeight: string) => {
        if (currentWeight === '400' || currentWeight === 'normal') return '700';
        if (currentWeight === '700' || currentWeight === 'bold') return '900';
        return '400';
    };

    const getWeightLabel = (weight: string) => {
        if (weight === '700' || weight === 'bold') return '粗體 (Bold)';
        if (weight === '900') return '極粗 (Heavy)';
        return '一般 (Normal)';
    };

    return (
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col h-full overflow-y-auto shrink-0 z-20 shadow-xl">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">榮譽榜設計</h2>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button 
                        onClick={onAddText}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 transition-colors"
                        disabled={isGeneratingAI}
                    >
                        <i className="fas fa-font"></i> 新增文字
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`${isGeneratingAI ? 'bg-purple-800 cursor-wait' : 'bg-purple-600 hover:bg-purple-500'} text-white p-2 rounded flex items-center justify-center gap-2 transition-colors`}
                        disabled={isGeneratingAI}
                    >
                         {isGeneratingAI ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-image"></i>}
                         {isGeneratingAI ? '去背中...' : '上傳照片'}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                <div className="mb-4">
                    <button 
                        onClick={() => bgInputRef.current?.click()}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 p-2 rounded text-sm mb-2 transition-colors"
                        disabled={isGeneratingAI}
                    >
                        <i className="fas fa-images"></i> 變更背景圖
                    </button>
                    <input 
                        type="file" 
                        ref={bgInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleBgUpload}
                    />
                </div>

                <div className="space-y-2">
                    <button 
                        onClick={onExport}
                        className="w-full bg-green-600 hover:bg-green-500 text-white p-3 rounded font-bold shadow-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isGeneratingAI}
                    >
                        <i className="fas fa-image mr-2"></i> 下載圖片 (PNG)
                    </button>
                    <button 
                        onClick={onExportPdf}
                        className="w-full bg-red-600 hover:bg-red-500 text-white p-3 rounded font-bold shadow-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isGeneratingAI}
                    >
                        <i className="fas fa-file-pdf mr-2"></i> 下載高解析 PDF (A3)
                    </button>
                </div>
            </div>

            {selectedLayer ? (
                <div className="p-4 space-y-5">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <h3 className="text-lg font-semibold text-gray-300">
                            編輯 {selectedLayer.type === LayerType.TEXT ? '文字' : '圖片'}
                        </h3>
                        <button 
                            onClick={() => onDeleteLayer(selectedLayer.id)}
                            className="text-red-400 hover:text-red-300 transition-colors bg-red-900/30 p-2 rounded"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>

                    {/* Common Properties */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-400">大小 (Scale)</label>
                            <span className="text-xs text-gray-400">{selectedLayer.scale.toFixed(1)}x</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="3" 
                            step="0.1"
                            value={selectedLayer.scale}
                            onChange={(e) => onUpdateLayer(selectedLayer.id, { scale: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-400">旋轉 (Rotation)</label>
                            <span className="text-xs text-gray-400">{selectedLayer.rotation}°</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={selectedLayer.rotation}
                            onChange={(e) => onUpdateLayer(selectedLayer.id, { rotation: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Text Specific */}
                    {selectedLayer.type === LayerType.TEXT && (
                        <>
                             {/* Style Presets */}
                             <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                <span className="text-xs text-gray-400 block mb-2">快速風格 (Presets)</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {TEXT_PRESETS.map(preset => (
                                        <button
                                            key={preset.name}
                                            onClick={() => onUpdateLayer(selectedLayer.id, preset.style)}
                                            className="text-xs bg-gray-700 hover:bg-gray-600 py-1 px-1 rounded transition-colors text-gray-200 overflow-hidden text-ellipsis whitespace-nowrap"
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">內容</label>
                                <textarea 
                                    value={(selectedLayer as TextLayer).content}
                                    onChange={(e) => onUpdateLayer(selectedLayer.id, { content: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    rows={2}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">字體大小</label>
                                    <input 
                                        type="number" 
                                        value={(selectedLayer as TextLayer).fontSize}
                                        onChange={(e) => onUpdateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">字型</label>
                                    <select 
                                        value={(selectedLayer as TextLayer).fontFamily}
                                        onChange={(e) => onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                                    >
                                        {FONTS.map(f => (
                                            <option key={f.name} value={f.value}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                <label className="flex items-center gap-2 cursor-pointer mb-3">
                                    <input 
                                        type="checkbox"
                                        checked={(selectedLayer as TextLayer).isGradient}
                                        onChange={(e) => onUpdateLayer(selectedLayer.id, { isGradient: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600"
                                    />
                                    <span className="text-sm font-medium">使用漸層色</span>
                                </label>
                                
                                {(selectedLayer as TextLayer).isGradient ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-xs text-gray-500 block">開始</span>
                                            <input 
                                                type="color" 
                                                value={(selectedLayer as TextLayer).gradientStart || '#FFD700'}
                                                onChange={(e) => onUpdateLayer(selectedLayer.id, { gradientStart: e.target.value })}
                                                className="w-full h-8 rounded cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">結束</span>
                                            <input 
                                                type="color" 
                                                value={(selectedLayer as TextLayer).gradientEnd || '#FF8C00'}
                                                onChange={(e) => onUpdateLayer(selectedLayer.id, { gradientEnd: e.target.value })}
                                                className="w-full h-8 rounded cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-1">單一顏色</span>
                                        <input 
                                            type="color" 
                                            value={(selectedLayer as TextLayer).color}
                                            onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })}
                                            className="w-full h-8 rounded cursor-pointer border-0 p-0"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Stroke & Shadow */}
                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">描邊寬度</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="10"
                                        value={(selectedLayer as TextLayer).strokeWidth || 0}
                                        onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeWidth: parseInt(e.target.value) })}
                                        className="w-16 bg-gray-800 border border-gray-600 rounded px-1 text-right text-sm"
                                    />
                                </div>
                                {(selectedLayer as TextLayer).strokeWidth > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">描邊顏色</span>
                                        <input 
                                            type="color" 
                                            value={(selectedLayer as TextLayer).strokeColor || '#000000'}
                                            onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeColor: e.target.value })}
                                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                        />
                                    </div>
                                )}
                                
                                <div className="border-t border-gray-600 pt-2">
                                     <label className="flex items-center gap-2 cursor-pointer mb-2">
                                        <input 
                                            type="checkbox"
                                            checked={(selectedLayer as TextLayer).shadow}
                                            onChange={(e) => onUpdateLayer(selectedLayer.id, { shadow: e.target.checked })}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600"
                                        />
                                        <span className="text-sm font-medium">使用陰影</span>
                                    </label>
                                    {(selectedLayer as TextLayer).shadow && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">陰影顏色</span>
                                            <input 
                                                type="color" 
                                                value={(selectedLayer as TextLayer).shadowColor || '#000000'}
                                                onChange={(e) => onUpdateLayer(selectedLayer.id, { shadowColor: e.target.value })}
                                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                className={`w-full p-2 rounded border transition-colors mt-2 flex justify-between items-center px-4 ${
                                    (selectedLayer as TextLayer).fontWeight === '700' || (selectedLayer as TextLayer).fontWeight === '900'
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'border-gray-600 text-gray-400 hover:bg-gray-700'
                                }`}
                                onClick={() => onUpdateLayer(selectedLayer.id, { fontWeight: toggleFontWeight((selectedLayer as TextLayer).fontWeight) })}
                            >
                                <span><i className="fas fa-bold"></i> 字重設定</span>
                                <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{getWeightLabel((selectedLayer as TextLayer).fontWeight)}</span>
                            </button>
                        </>
                    )}

                    {/* Image Specific (AI Edit) */}
                    {selectedLayer.type === LayerType.IMAGE && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                             {/* Mask Selection */}
                             <div className="mb-4">
                                <span className="text-xs text-gray-400 block mb-2">遮罩效果 (Mask)</span>
                                <div className="grid grid-cols-4 gap-2">
                                    {MASK_PRESETS.map(mask => (
                                        <button
                                            key={mask.value}
                                            onClick={() => onUpdateLayer(selectedLayer.id, { mask: mask.value })}
                                            className={`flex flex-col items-center justify-center p-2 rounded text-xs transition-colors border ${
                                                (selectedLayer as ImageLayer).mask === mask.value 
                                                ? 'bg-blue-600 border-blue-400 text-white' 
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                            }`}
                                            title={mask.name}
                                        >
                                            <i className={`fas ${mask.icon} mb-1 text-sm`}></i>
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <h4 className="text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 flex items-center">
                                <i className="fas fa-magic mr-2"></i>AI 圖片編輯
                            </h4>
                            <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                <p className="text-xs text-gray-400 mb-2">使用 Gemini 2.5 Flash Image 來修改此照片。</p>
                                
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="例如：移除背景、加上復古濾鏡、變成油畫風格、加入紅色領帶..."
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white mb-2 focus:border-blue-500 outline-none"
                                    rows={3}
                                />
                                
                                <button
                                    onClick={() => onEditWithAI(aiPrompt)}
                                    disabled={isGeneratingAI || !aiPrompt.trim()}
                                    className={`w-full py-2 px-4 rounded font-bold text-white transition-all shadow-md
                                        ${isGeneratingAI || !aiPrompt.trim() 
                                            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02]'
                                        }`}
                                >
                                    {isGeneratingAI ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <i className="fas fa-spinner fa-spin"></i> 處理中...
                                        </span>
                                    ) : (
                                        '開始生成 (Generate)'
                                    )}
                                </button>
                            </div>
                            <div className="mt-3">
                                <label className="text-xs text-gray-400 block mb-1">透明度 (Opacity)</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05"
                                    value={(selectedLayer as ImageLayer).opacity}
                                    onChange={(e) => onUpdateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-mouse-pointer fa-2x opacity-50 text-blue-400"></i>
                    </div>
                    <p className="font-medium text-gray-400">尚未選取任何物件</p>
                    <p className="text-sm mt-2">點擊畫布上的文字或圖片進行編輯，或使用上方按鈕新增物件。</p>
                </div>
            )}
        </div>
    );
};