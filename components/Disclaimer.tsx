
import React from 'react';

export const Disclaimer: React.FC = () => {
    return (
        <footer className="bg-yellow-100 border-t-4 border-yellow-500 mt-8">
            <div className="container mx-auto px-4 md:px-8 py-4 text-center text-yellow-800">
                <p className="font-bold text-lg"><i className="fas fa-exclamation-triangle mr-2"></i>Tuyên bố miễn trừ trách nhiệm quan trọng</p>
                <p className="text-sm mt-1">
                    Công cụ này chỉ dành cho mục đích thông tin và giáo dục. Nó không phải là một thiết bị y tế và không thể thay thế cho chẩn đoán của một nhà giải phẫu bệnh có chuyên môn. Mọi kết quả phân tích phải được xác minh bởi một chuyên gia y tế.
                </p>
            </div>
        </footer>
    );
};
