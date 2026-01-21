import React from 'react';

interface CardUIProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export function Card({ title, description, icon }: CardUIProps) {
    return (
        <div className="card-body items-center text-center">
            {icon && <div className="mb-4">{icon}</div>}
            <h3 className="card-title">{title}</h3>
            <p>{description}</p>
        </div>
    );
}
