import { useEffect } from 'react';

const NotFound = () => {
    useEffect(() => {
        window.location.href = 'about:blank';
    }, []);

    return <></>;
};

export default NotFound;
