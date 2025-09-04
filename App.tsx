import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Disclaimer } from './components/Disclaimer';
import { analyzePathologyImages } from './services/geminiService';
import { fileToImageDataObject } from './utils/fileUtils';

const App: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
    const [patientGender, setPatientGender] = useState<string>('');
    const [patientAge, setPatientAge] = useState<string>('');
    const [sampleLocation, setSampleLocation] = useState<string>('');
    const [clinicalDiagnosis, setClinicalDiagnosis] = useState<string>('');
    const [additionalNotes, setAdditionalNotes] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (files: File[] | null) => {
        setSelectedFiles(files);
        setAnalysisResult(null);
        setError(null);
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setError('Vui lòng chọn ít nhất một tệp hình ảnh để phân tích.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const imagePromises = selectedFiles.map(fileToImageDataObject);
            
            const imagesData = await Promise.all(imagePromises);
            
            const clinicalContext = `
- Giới tính: ${patientGender || 'Không cung cấp'}
- Tuổi: ${patientAge || 'Không cung cấp'}
- Vị trí lấy mẫu: ${sampleLocation || 'Không cung cấp'}
- Chẩn đoán lâm sàng: ${clinicalDiagnosis || 'Không cung cấp'}
- Ghi chú bổ sung: ${additionalNotes || 'Không có'}
            `.trim();

            const result = await analyzePathologyImages(imagesData, clinicalContext);
            setAnalysisResult(result);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi trong quá trình phân tích. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFiles, patientGender, patientAge, sampleLocation, clinicalDiagnosis, additionalNotes]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col space-y-6 h-fit">
                    <h2 className="text-2xl font-bold text-gray-700 border-b pb-3">Thông tin bệnh nhân</h2>
                    <ImageUploader onFileSelect={handleFileSelect} />
                    
                    {/* Clinical Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin lâm sàng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="patient-gender" className="block text-sm font-medium text-gray-600">Giới tính</label>
                                <select 
                                    id="patient-gender" 
                                    value={patientGender} 
                                    onChange={e => setPatientGender(e.target.value)} 
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="patient-age" className="block text-sm font-medium text-gray-600">Tuổi</label>
                                <input type="number" id="patient-age" value={patientAge} onChange={e => setPatientAge(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="50" />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="sample-location" className="block text-sm font-medium text-gray-600">Vị trí lấy mẫu</label>
                             <input type="text" id="sample-location" value={sampleLocation} onChange={e => setSampleLocation(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="VD: Thùy trên phổi phải" />
                        </div>
                         <div>
                             <label htmlFor="clinical-diagnosis" className="block text-sm font-medium text-gray-600">Chẩn đoán lâm sàng</label>
                             <input type="text" id="clinical-diagnosis" value={clinicalDiagnosis} onChange={e => setClinicalDiagnosis(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="VD: U phổi" />
                        </div>
                        <div>
                            <label htmlFor="additional-notes" className="block text-sm font-medium text-gray-600">
                                Ghi chú bổ sung
                            </label>
                            <textarea
                                id="additional-notes"
                                rows={3}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Thêm bất kỳ thông tin nào khác..."
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isLoading || !selectedFiles || selectedFiles.length === 0}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <i className="fas fa-microscope"></i>
                                <span>Phân Tích Hình Ảnh</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Results Panel */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-700 border-b pb-3 mb-6">Kết quả Phân tích</h2>
                    <div className="min-h-[400px] prose prose-lg max-w-none">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <LoadingSpinner />
                                <p className="mt-4 text-gray-600 font-medium">AI đang phân tích, vui lòng chờ trong giây lát...</p>
                                <p className="mt-2 text-sm text-gray-500">Việc xử lý tệp TIF/TIFF có thể mất nhiều thời gian hơn.</p>
                            </div>
                        )}
                        {error && (
                             <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                <p className="font-bold">Lỗi</p>
                                <p>{error}</p>
                            </div>
                        )}
                        {analysisResult && <ResultsDisplay result={analysisResult} />}
                        {!isLoading && !analysisResult && !error && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                <i className="fas fa-file-image text-6xl mb-4"></i>
                                <h3 className="text-xl font-semibold">Sẵn sàng để phân tích</h3>
                                <p>Vui lòng tải lên một hoặc nhiều hình ảnh giải phẫu bệnh để bắt đầu.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Disclaimer />
        </div>
    );
};

export default App;