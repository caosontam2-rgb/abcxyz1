import config from 'netlify/functions/config';

export default async (req) => {
    const { method } = req;

    console.log(`${method} send-telegram`);

    if (method !== 'POST') {
        return new Response(
            JSON.stringify({
                error: 'chỉ support POST method'
            }),
            {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    try {
        const body = await req.json();
        const { message, chatId, parseMode = 'HTML' } = body;

        if (!message) {
            return new Response(
                JSON.stringify({
                    error: 'thiếu message'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const targetChatId = chatId === 'noti' ? config.noti_chat_id : chatId || config.chat_id;

        const telegramResponse = await sendMessage({
            token: config.token,
            chatId: targetChatId,
            message,
            parseMode
        });

        console.log('telegram response:', telegramResponse);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'gửi telegram thành công',
                messageId: telegramResponse.result?.message_id
            }),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (err) {
        console.error('lỗi gửi telegram:', err);
        return new Response(
            JSON.stringify({
                error: 'lỗi gửi telegram',
                details: err.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

async function sendMessage({ token, chatId, message, parseMode }) {
    const sendMessageUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode
    };

    const response = await fetch(sendMessageUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`telegram api error: ${response.status} - ${errorText}`);
    }

    return await response.json();
}
