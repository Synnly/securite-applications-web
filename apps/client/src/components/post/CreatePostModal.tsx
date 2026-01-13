import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

import {
    createPostSchema,
    type CreatePostForm,
} from '../../modules/types/post.type';
import { FormInput } from '../form/FormInput.tsx';
import { FormMarkdownEditor } from '../form/FormMarkdownEditor.tsx';
import { FormSubmit } from '../form/FormSubmit.tsx';
import { CustomForm } from '../form/CustomForm.tsx';
import { X } from 'lucide-react';
import { createPost } from '../../hooks/fetchPosts.ts';

export type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export function CreatePostModal({ isOpen, onClose }: Props) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<CreatePostForm>({
        resolver: zodResolver(createPostSchema) as Resolver<CreatePostForm>,
        mode: 'onSubmit',
        defaultValues: {
            title: '',
            body: '',
        },
    });

    const { mutateAsync, isPending, isError, error } = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            toast.success('Post créé avec succès');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            reset();
            onClose();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erreur lors de la création du post');
        },
    });

    const onSubmit: SubmitHandler<CreatePostForm> = async (data) => {
        await mutateAsync({
            data: {
                title: data.title,
                body: data.body,
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <dialog open={isOpen} className="modal">
            <div className="modal-box max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl">Créer un nouveau post</h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="btn btn-circle btn-ghost"
                        disabled={isPending}
                    >
                        <X size={24} />
                    </button>
                </div>

                <CustomForm
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormInput<CreatePostForm>
                        label="Titre du post"
                        register={register('title')}
                        error={errors.title}
                        placeholder="Entrez le titre du post"
                        disabled={isPending}
                        className="w-full"
                    />

                    <FormMarkdownEditor<CreatePostForm>
                        name="body"
                        label="Corps"
                        control={control}
                        error={errors.body}
                        placeholder="Décrivez le post en Markdown..."
                        disabled={isPending}
                        rows={10}
                    />

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-ghost"
                            disabled={isPending}
                        >
                            Annuler
                        </button>
                        <FormSubmit
                            isPending={isPending}
                            isError={isError}
                            error={error}
                            title="Créer le post"
                            pendingTitle="Création..."
                            className="btn-primary"
                        />
                    </div>
                </CustomForm>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose} disabled={isPending}>
                    Fermer
                </button>
            </form>
        </dialog>
    );
}
