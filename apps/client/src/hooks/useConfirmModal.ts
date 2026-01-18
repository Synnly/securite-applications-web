import { useState } from 'react';

export type ConfirmAction = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmClassName?: string;
    onConfirm: () => void | Promise<void>;
};

export function useConfirmModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

    const openConfirm = (action: ConfirmAction) => {
        setConfirmAction(action);
        setIsOpen(true);
    };

    const closeConfirm = () => {
        if (!isPending) {
            setIsOpen(false);
            setConfirmAction(null);
        }
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;

        setIsPending(true);
        try {
            await confirmAction.onConfirm();
            setIsOpen(false);
            setConfirmAction(null);
        } finally {
            setIsPending(false);
        }
    };

    return {
        isOpen,
        isPending,
        confirmAction,
        openConfirm,
        closeConfirm,
        handleConfirm,
    };
}
