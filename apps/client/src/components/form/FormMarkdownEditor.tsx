import type { FieldError, FieldValues, Control, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import MDEditor from '@uiw/react-md-editor';

import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

export type FormMarkdownEditorProps<T extends FieldValues> = {
    name: Path<T>;
    label?: string;
    control: Control<T>;
    error?: FieldError;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    rows?: number;
};

export function FormMarkdownEditor<T extends FieldValues>({
    name,
    label,
    control,
    error,
    placeholder,
    disabled = false,
    className,
    rows = 6,
}: FormMarkdownEditorProps<T>) {
    return (
        <div className="flex flex-col w-full">
            {label && (
                <label
                    className="font-bold text-sm pb-2 uppercase"
                    htmlFor={String(name)}
                >
                    {label}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <div className={className} data-color-mode="light">
                        <MDEditor
                            value={field.value}
                            onChange={field.onChange}
                            preview="live"
                            height={rows * 24}
                            textareaProps={{
                                placeholder: placeholder,
                                disabled: disabled,
                            }}
                            previewOptions={{
                                rehypePlugins: [],
                            }}
                        />
                    </div>
                )}
            />

            {error && error.message && (
                <span className="text-error-content mt-1 bg-error p-3">
                    {error.message.charAt(0).toUpperCase() +
                        error.message.slice(1)}
                </span>
            )}
        </div>
    );
}
