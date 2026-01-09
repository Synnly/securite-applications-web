import { CustomForm } from '../form/CustomForm.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type Resolver, type SubmitHandler, useForm } from 'react-hook-form';
import {
    type CreateCommentForm,
    createCommentSchema,
} from '../../modules/types/comment.type.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { createComment } from '../../hooks/fetchComments.ts';
import { toast } from 'react-toastify';
import { FormInput } from '../form/FormInput.tsx';
import { FormSubmit } from '../form/FormSubmit.tsx';

interface Props {
    postId: string;
}

export const CommentInput = ({ postId }: Props) => {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateCommentForm>({
        resolver: zodResolver(
            createCommentSchema,
        ) as Resolver<CreateCommentForm>,
        mode: 'onSubmit',
        defaultValues: {
            text: '',
        },
    });

    const { mutateAsync, isPending, isError, error } = useMutation({
        mutationFn: createComment,
        onSuccess: () => {
            toast.success('Commentaire créé avec succès');
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            reset();
        },
        onError: (error: Error) => {
            toast.error(
                error.message || 'Erreur lors de la création du commentaire',
            );
        },
    });

    const onSubmit: SubmitHandler<CreateCommentForm> = async (data) => {
        await mutateAsync({
            data: {
                text: data.text,
                postId: postId,
            },
        });
    };

    return (
        <>
            <CustomForm
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                col={false}
            >
                <FormInput
                    register={register('text')}
                    error={errors.text}
                    placeholder={'Entrez votre commentaire...'}
                    disabled={isPending}
                />
                <FormSubmit
                    isPending={isPending}
                    isError={isError}
                    error={error}
                    title="Commenter"
                    pendingTitle="En cours..."
                    className="btn-primary"
                />
            </CustomForm>
        </>
    );
};
