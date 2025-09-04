// This tells TypeScript that UTIF exists on the global window object.
declare const UTIF: any;

interface ConvertedImage {
    base64: string;
    mimeType: string;
}

const convertTiffToPng = (file: File): Promise<ConvertedImage> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const buffer = event.target?.result as ArrayBuffer;
                const ifds = UTIF.decode(buffer);
                const firstPage = ifds[0];
                UTIF.decodeImage(buffer, firstPage, ifds);
                const rgba = UTIF.toRGBA8(firstPage);

                const canvas = document.createElement('canvas');
                canvas.width = firstPage.width;
                canvas.height = firstPage.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error("Không thể lấy context của canvas."));
                }
                const imageData = ctx.createImageData(firstPage.width, firstPage.height);
                imageData.data.set(rgba);
                ctx.putImageData(imageData, 0, 0);
                
                const dataUrl = canvas.toDataURL('image/png');
                const base64 = dataUrl.split(',')[1];
                resolve({ base64, mimeType: 'image/png' });

            } catch (err) {
                console.error("Lỗi khi chuyển đổi TIF:", err);
                reject(new Error("Không thể xử lý tệp TIF/TIFF. Tệp có thể bị hỏng hoặc có định dạng không được hỗ trợ."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

export const fileToImageDataObject = (file: File): Promise<ConvertedImage> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Check for TIFF and convert if necessary
    if (file.type === 'image/tiff' || extension === 'tif' || extension === 'tiff') {
        return convertTiffToPng(file);
    }

    // Standard handling for other image types
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix e.g. "data:image/png;base64,"
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = (error) => reject(error);
    });
};
