import { X } from 'lucide-react';

export type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmClassName?: string;
    isPending?: boolean;
};

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    confirmClassName = 'btn-error',
    isPending = false,
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <dialog open={isOpen} className="modal">
            <div className="modal-box">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-circle btn-ghost btn-sm"
                        disabled={isPending}
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="py-4">{message}</p>

                <div className="flex gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost"
                        disabled={isPending}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className={`btn ${confirmClassName}`}
                        disabled={isPending}
                    >
                        {isPending ? 'En cours...' : confirmText}
                    </button>
                </div>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose} disabled={isPending}>
                    Fermer
                </button>
            </form>
        </dialog>
    );
}
