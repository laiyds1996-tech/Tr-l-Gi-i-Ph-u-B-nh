import React, { useState, useRef, useCallback } from 'react';

interface ImageUploaderProps {
    onFileSelect: (files: File[] | null) => void;
}

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/tiff'];
const ACCEPTED_EXTENSIONS_STRING = 'image/png,image/jpeg,image/webp,.tif,.tiff';

// A simple SVG placeholder for TIFF files
const TIFF_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512' fill='%239ca3af'%3E%3Cpath d='M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48z'/%3E%3C/svg%3E";

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect }) => {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (files: FileList | null) => {
        if (files && files.length > 0) {
            // Filter files by accepted MIME types and extensions for robustness
            const validFiles = Array.from(files).filter(file => {
                const extension = file.name.split('.').pop()?.toLowerCase();
                return ACCEPTED_MIME_TYPES.includes(file.type) || extension === 'tif' || extension === 'tiff';
            });
            
            if (validFiles.length !== files.length) {
                console.warn("Some files were of an unsupported type and were ignored.");
            }

            if (validFiles.length === 0) {
                clearSelection();
                return;
            }

            setFileNames(validFiles.map(f => f.name));
            onFileSelect(validFiles);

            const previewPromises = validFiles.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const extension = file.name.split('.').pop()?.toLowerCase();
                     if (file.type === 'image/tiff' || extension === 'tif' || extension === 'tiff') {
                        resolve(TIFF_PLACEHOLDER);
                        return;
                    }

                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(previewPromises).then(previews => {
                setImagePreviews(previews);
            });
        } else {
            clearSelection();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files);
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        processFiles(event.dataTransfer.files);
    }, [processFiles]);

    const clearSelection = () => {
        setFileNames([]);
        setImagePreviews([]);
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
                Tải lên hình ảnh giải phẫu bệnh (Có thể chọn nhiều ảnh)
            </label>
            <div 
                className="group relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition bg-gray-50 min-h-[150px] flex items-center justify-center"
                onClick={handleButtonClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={ACCEPTED_EXTENSIONS_STRING}
                    multiple
                />
                {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
                        {imagePreviews.map((src, index) => (
                             <div key={index} className="relative aspect-square bg-gray-100 p-1 rounded-md" title={fileNames[index]}>
                                <img src={src} alt={`Xem trước ${fileNames[index]}`} className="w-full h-full object-contain rounded-md" />
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                        <i className="fas fa-cloud-upload-alt text-4xl"></i>
                        <p className="font-semibold">Kéo và thả hoặc nhấp để chọn tệp</p>
                        <p className="text-xs">Hỗ trợ PNG, JPG, WEBP, TIF/TIFF</p>
                    </div>
                )}
            </div>
            {fileNames.length > 0 && (
                <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Đã chọn: {fileNames.length} tệp
                    </p>
                    <button onClick={clearSelection} className="text-sm text-red-500 hover:text-red-700 font-semibold">
                        Xóa tất cả
                    </button>
                </div>
            )}
        </div>
    );
};