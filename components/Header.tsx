
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center space-x-3">
                <i className="fas fa-brain text-3xl text-blue-600"></i>
                <h1 className="text-3xl font-bold text-gray-800">Trợ lý Giải Phẫu Bệnh AI</h1>
            </div>
        </header>
    );
};
