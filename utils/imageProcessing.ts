
export const removeColorFromImage = (base64Image: string, targetColor: 'black' | 'white' | 'auto', tolerance: number = 30): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Handle cross-origin if needed
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            let rBg = 0, gBg = 0, bBg = 0;
            
            if (targetColor === 'auto') {
                // Pick top-left pixel
                rBg = data[0];
                gBg = data[1];
                bBg = data[2];
            } else if (targetColor === 'white') {
                rBg = 255; gBg = 255; bBg = 255;
            } else {
                rBg = 0; gBg = 0; bBg = 0;
            }

            // Simple Euclidian distance or Manhattan distance
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Calculate difference
                const diff = Math.abs(r - rBg) + Math.abs(g - gBg) + Math.abs(b - bBg);

                if (diff < tolerance * 3) { // 3 channels
                     // Smooth edges slightly?
                     // For now, hard cut
                    data[i + 3] = 0; 
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (e) => reject(e);
        img.src = base64Image;
    });
};
