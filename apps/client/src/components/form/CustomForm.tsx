import * as React from 'react';

type CustomFormProps = {
    label?: string;
    children: React.ReactNode;
    col?: boolean;
} & React.FormHTMLAttributes<HTMLFormElement>;

export const CustomForm = ({
    label,
    children,
    col = true,
    ...rest
}: CustomFormProps) => {
    return (
        <>
            {label && (
                <div className="px-2 text-center w-full mx-2">
                    <p className="uppercase font-bold text-2xl">{label}</p>
                </div>
            )}
            <form
                {...rest}
                className={`flex flex-${col ? 'col' : 'row'} mt-4 gap-5 items-center justify-around h-full w-full`}
            >
                {children}
            </form>
        </>
    );
};
