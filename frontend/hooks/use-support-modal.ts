import { create } from 'zustand';

interface SupportModalStore {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
}

export const useSupportModal = create<SupportModalStore>((set) => ({
	isOpen: false,
	onOpen: () => set({ isOpen: true }),
	onClose: () => set({ isOpen: false }),
}));
