
export enum LayerType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    BACKGROUND = 'BACKGROUND'
}

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number; // percentage or pixels based on implementation
    height: number;
    scale: number;
}

export interface Layer {
    id: string;
    type: LayerType;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    rotation: number;
    scale: number;
    zIndex: number;
    isVisible: boolean;
}

export interface TextLayer extends Layer {
    type: LayerType.TEXT;
    content: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    
    // Gradient
    isGradient: boolean;
    gradientStart?: string;
    gradientEnd?: string;
    
    // Styles
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    shadow: boolean;
    shadowColor?: string;
    
    // Stroke (New)
    strokeWidth: number;
    strokeColor: string;
}

export interface ImageLayer extends Layer {
    type: LayerType.IMAGE;
    src: string;
    opacity: number;
    // Updated mask types including horizontal gradients
    mask?: 'none' | 'circle' | 'gradient-bottom' | 'gradient-bottom-strong' | 'gradient-top' | 'gradient-left' | 'gradient-right' | 'soft-rect' | 'diagonal';
}

export interface AppState {
    width: number;
    height: number;
    background: string; // Color or Image URL
    layers: (TextLayer | ImageLayer)[];
    selectedLayerId: string | null;
    isGeneratingAI: boolean;
}

export const FONTS = [
    { name: '思源黑體 (Noto Sans TC)', value: '"Noto Sans TC", sans-serif' },
    { name: '思源宋體 (Noto Serif TC)', value: '"Noto Serif TC", serif' },
    { name: '書法-馬山 (Ma Shan Zheng)', value: '"Ma Shan Zheng", cursive' },
    { name: '書法-龍長 (Long Cang)', value: '"Long Cang", cursive' },
    { name: '小薇體 (ZCOOL XiaoWei)', value: '"ZCOOL XiaoWei", serif' },
    { name: '快樂體 (ZCOOL KuaiLe)', value: '"ZCOOL KuaiLe", cursive' },
    { name: 'Montserrat (Modern)', value: '"Montserrat", sans-serif' },
    { name: 'Roboto (Standard)', value: '"Roboto", sans-serif' },
    { name: 'Cinzel (Honor/Classic)', value: '"Cinzel", serif' },
    { name: 'Oswald (Impact)', value: '"Oswald", sans-serif' },
    { name: 'Alfa Slab One (Heavy)', value: '"Alfa Slab One", cursive' },
    { name: 'Orbitron (Sci-Fi)', value: '"Orbitron", sans-serif' },
    { name: 'Audiowide (Tech)', value: '"Audiowide", cursive' },
    { name: 'Righteous (Modern)', value: '"Righteous", cursive' },
    { name: 'Bangers (Comic)', value: '"Bangers", cursive' },
    { name: 'Permanent Marker', value: '"Permanent Marker", cursive' },
    { name: 'Great Vibes (Script)', value: '"Great Vibes", cursive' },
    { name: 'Playfair Display (Luxury)', value: '"Playfair Display", serif' },
];