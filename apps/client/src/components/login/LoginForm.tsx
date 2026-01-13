import { useForm } from 'react-hook-form';
import { FormInput } from '../form/FormInput';
import { FormSubmit } from '../form/FormSubmit';
import { CustomForm } from '../form/CustomForm';
import { UseLogin } from '../../hooks/login';
import { NavLink } from 'react-router';
import type {FormLogin} from "../../modules/types/formLogin.type.ts";


export const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormLogin>({
        mode: 'onSubmit',
    });
    const { login, isPending, isError, error, reset } = UseLogin();
    const onSubmit = async (data: FormLogin): Promise<void> => {
        await login(data);
    };

    return (
        <div className="card flex-col flex items-center just p-10 shadow-xl shadow-base-300">
            <CustomForm
                label="Accéder à votre compte"
                role="form"
                onSubmit={handleSubmit(onSubmit)}
                onClick={() => {
                    reset();
                }}
            >
                <div className="w-full flex flex-col gap-5 justify-around">
                    <FormInput<FormLogin>
                        register={register('email')}
                        placeholder="Email"
                        label="Email"
                        type="email"
                        error={errors.email}
                    />

                    <FormInput<FormLogin>
                        placeholder="Mot de passe"
                        register={register('password', { required: true })}
                        label="Mot de passe"
                        type="password"
                        error={errors.password}
                    />
                </div>
                <FormSubmit
                    isPending={isPending}
                    isError={isError}
                    error={error}
                    title="Se connecter"
                    pendingTitle="Connexion..."
                    className="btn btn-primary w-full"
                />
            </CustomForm>
            <div className="flex flex-row justify-center w-full mt-5">
                <NavLink to="/signup" className="btn btn-secondary">
                    Créer un compte
                </NavLink>
            </div>
        </div>
    );
};
