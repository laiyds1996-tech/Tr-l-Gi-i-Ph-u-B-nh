
import React from 'react';

interface ResultsDisplayProps {
    result: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
    // A simple function to render markdown-like text to basic HTML
    const renderContent = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(4)}</h3>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 border-b pb-2">{line.substring(3)}</h2>;
            }
            if (line.startsWith('* ')) {
                return <li key={index} className="ml-6 my-1">{line.substring(2)}</li>;
            }
            if (line.trim() === '') {
                return <br key={index} />;
            }
            return <p key={index} className="my-2">{line}</p>;
        });
    };

    return (
        <div className="text-left whitespace-pre-wrap font-sans">
             {renderContent(result)}
        </div>
    );
};
