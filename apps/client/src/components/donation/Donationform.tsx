import {type formDonation, formDonationSchema} from "../../modules/types/formDonation.type.ts";
import {type Resolver, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {UseDonation} from "../../hooks/donation.ts";
import {CustomForm} from "../form/CustomForm.tsx";
import {FormInput} from "../form/FormInput.tsx";
import {FormSubmit} from "../form/FormSubmit.tsx";

export const DonationForm = () => {
const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
    } = useForm<formDonation>({
        resolver: zodResolver(formDonationSchema) as Resolver<formDonation>,
        mode: 'onSubmit',
    });

const {
        register: registerDonation,
        isPending,
        isError,
        error,
        reset,
    } = UseDonation();

    const onSubmit = async (data: formDonation) => {
        await registerDonation(data);
    }

    const onChange = (fieldName: 'amount' | 'cardNumber' | 'expirationDate' | 'cvv') => {
        clearErrors(fieldName);
    };
    
    return (
        <div className="card flex-col flex items-center p-10 shadow-xl shadow-base-300 border border-base-300 min-w-1/2">
            <CustomForm
                label="Faire un don"
                role="form"
                onSubmit={handleSubmit((data) => onSubmit(data))}
                onClick={() => {
                    reset();
                }}
            >
                <div className="w-full flex flex-col gap-5 justify-around">
                    <FormInput<formDonation>
                        register={register('amount', {
                            required: true,
                            onChange: () => {
                                onChange('amount');
                            }
                        })}
                        label="Montant du don (€)"
                        placeholder="50"
                        type="number"
                        error={errors.amount}
                        min={1}
                    />

                    <FormInput<formDonation>
                        register={register('cardNumber', {
                            required: true,
                            onChange: () => {
                                onChange('cardNumber');
                            }
                        })}
                        label="Numéro de carte bancaire"
                        placeholder="1234 5678 9012 3456"
                        type="number"
                        error={errors.cardNumber}
                    />

                    <div className="flex gap-10">
                        <FormInput<formDonation>
                            register={register('expirationDate', {
                                required: true,
                                onChange: () => {
                                    onChange('expirationDate');
                                }
                            })}
                            label="Date d'expiration"
                            placeholder="MM/AA"
                            type="string"
                            error={errors.expirationDate}
                        />

                        <FormInput<formDonation>
                            register={register('cvv', {
                                required: true,
                                onChange: () => {
                                    onChange('cvv');
                                }
                            })}
                            label="Cryptogramme visuel (CVV)"
                            placeholder="123"
                            type="number"
                            error={errors.cvv}
                        />
                    </div>

                    <FormSubmit
                        isPending={isPending}
                        isError={isError}
                        error={error}
                        title="Donner"
                        pendingTitle="Transaction..."
                        className="btn btn-primary w-full"
                    />
                </div>
                
            </CustomForm>
        </div>
    );

}