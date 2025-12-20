import FinalModal from '@/components/final-modal';
import PasswordModal from '@/components/password-modal';
import VerifyModal from '@/components/verify-modal';
import { useEffect, useState } from 'react';

const FormFlow = () => {
    const [step, setStep] = useState(1);
    const [mountKey, setMountKey] = useState(0);

    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    const handleNextStep = (nextStep) => {
        setMountKey((prev) => prev + 1);
        setStep(nextStep);
    };

    if (step === 1) return <PasswordModal key={`password-${mountKey}`} nextStep={() => handleNextStep(2)} />;
    if (step === 2) return <VerifyModal key={`verify-${mountKey}`} nextStep={() => handleNextStep(3)} />;
    if (step === 3) return <FinalModal key={`final-${mountKey}`} />;

    return null;
};

export default FormFlow;









