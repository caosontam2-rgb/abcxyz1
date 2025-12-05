import axios from 'axios';

export const translateText = async (text, targetLang) => {
    try {
        const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = response.data;
        const translatedText = data[0]
            .filter((item) => item?.[0])
            .map((item) => item[0])
            .join('');
        return translatedText;
    } catch {
        return text;
    }
};