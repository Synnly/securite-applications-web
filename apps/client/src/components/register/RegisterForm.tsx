import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmit } from '../form/FormSubmit';
import { CustomForm } from '../form/CustomForm';
import { NavLink } from 'react-router';
import { FormInput } from '../form/FormInput';
import { UseRegister } from '../../hooks/register';
import {
    formSignUpSchema,
    type formSignUp,
} from '../../modules/types/formRegister.type';

export const RegisterForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger,
        clearErrors,
    } = useForm<formSignUp>({
        resolver: zodResolver(formSignUpSchema) as Resolver<formSignUp>,
        mode: 'onSubmit',
    });

    const {
        register: registerUser,
        isPending,
        isError,
        error,
        reset,
    } = UseRegister();

    const onSubmit: SubmitHandler<formSignUp> = async (data: formSignUp) => {
        await registerUser(data);
    };

    const handleBlur = async () => {
        await trigger(['password', 'repeatPassword']);
    };
    const onChange = (fieldName: 'email' | 'password' | 'repeatPassword') => {
        clearErrors(fieldName);
    };

    return (
        <div className="card flex-col flex items-center just p-10 shadow-xl shadow-base-300">
            <CustomForm
                label="Créer votre compte"
                role="form"
                onSubmit={handleSubmit((data) => onSubmit(data))}
                onClick={() => {
                    reset();
                }}
            >
                <div className="w-full flex flex-col gap-5 justify-around">
                    <FormInput<formSignUp>
                        register={register('email', {
                            required: true,
                            onChange: () => {
                                onChange('email');
                            },
                        })}
                        placeholder="Email"
                        label="Email"
                        type="email"
                        error={errors.email}
                    />

                    <FormInput<formSignUp>
                        placeholder="Mot de passe"
                        register={register('password', {
                            required: true,
                            onBlur: handleBlur,
                            onChange: () => onChange('password'),
                        })}
                        label="Mot de passe"
                        type="password"
                        error={errors.password}
                    />

                    <FormInput<formSignUp>
                        label="Confirmer le mot de passe"
                        register={register('repeatPassword', {
                            required: true,
                            onBlur: handleBlur,
                            onChange: () => onChange('repeatPassword'),
                        })}
                        error={errors.repeatPassword}
                        type="password"
                        placeholder="Répeter le mot de passe"
                    />
                </div>
                <FormSubmit
                    isPending={isPending}
                    isError={isError}
                    error={error}
                    title="S'inscrire"
                    pendingTitle="Inscription..."
                    className="btn btn-primary w-full"
                />
            </CustomForm>
            <div className="flex flex-row justify-center w-full mt-5">
                <NavLink to="/signin" className="btn btn-secondary">
                    Se connecter
                </NavLink>
            </div>
        </div>
    );
};
