import React, { useRef, useState, useEffect } from 'react';
import { Layer } from '../types';

interface DraggableLayerProps {
    layer: Layer;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Layer>) => void;
    children: React.ReactNode;
    canvasSize: { width: number; height: number };
}

export const DraggableLayer: React.FC<DraggableLayerProps> = ({
    layer,
    isSelected,
    onSelect,
    onUpdate,
    children,
    canvasSize
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        // 阻止 MouseDown 冒泡只是第一步，防止在此階段就觸發父層邏輯
        e.stopPropagation();
        onSelect(layer.id);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialPos({ x: layer.x, y: layer.y });
    };

    // 新增：處理 Click 事件，確保放開滑鼠時產生的 Click 事件不會冒泡到 Canvas 背景
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;

            // Convert pixels to percentage
            const dxPercent = (dx / canvasSize.width) * 100;
            const dyPercent = (dy / canvasSize.height) * 100;

            onUpdate(layer.id, {
                x: initialPos.x + dxPercent,
                y: initialPos.y + dyPercent
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, initialPos, canvasSize, layer.id, onUpdate]);

    return (
        <div
            ref={elementRef}
            className={`absolute cursor-move select-none group ${isSelected ? 'z-50' : 'z-auto'}`}
            style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                zIndex: layer.zIndex,
            }}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
        >
            {children}
            
            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute inset-0 -m-2 border-2 border-blue-500 rounded-lg pointer-events-none opacity-75">
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                </div>
            )}
        </div>
    );
};