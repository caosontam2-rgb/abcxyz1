import config from './config.js';

const deleteMessage = async ({ token, chatId, messageId }) => {
    const deleteMessageUrl = `https://api.telegram.org/bot${token}/deleteMessage`;

    const payload = {
        chat_id: chatId,
        message_id: messageId
    };

    const response = await fetch(deleteMessageUrl, {
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
};

export default {
    async fetch(request) {
        const { method } = request;

        console.log(`${method} delete-telegram`);

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
            const body = await request.json();
            const { messageId, chatId } = body;

            if (!messageId) {
                return new Response(
                    JSON.stringify({
                        error: 'thiếu messageId'
                    }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }

            const targetChatId = chatId || config.chat_id;

            const telegramResponse = await deleteMessage({
                token: config.token,
                chatId: targetChatId,
                messageId
            });

            console.log('delete response:', telegramResponse);

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'xóa message thành công'
                }),
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        } catch (err) {
            console.error('lỗi xóa message:', err);
            return new Response(
                JSON.stringify({
                    error: 'lỗi xóa message',
                    details: err.message
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }
};

