import { useLocation } from "react-router-dom";
import {Navbar} from "../components/layout/Navbar.tsx";
import {Heart} from "lucide-react";

export const DonationSucessPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const query = Object.fromEntries(searchParams.entries());
    const _id = query._id;
    const amount = query.amount;

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-center items-center h-screen gap-4 relative">
                <div className="absolute top-1/6">
                    <Heart size={256} strokeWidth={1.5} className="fill-red-500" />
                </div>
                <h1 className="text-4xl font-bold">Merci pour ton don !</h1>
                <p className="text-lg">
                    Ton don d'un montant de <strong>{amount} €</strong> a été
                    reçu avec succès.
                </p>
                <p className="text-lg">
                    Référence de la transaction : <strong>{_id}</strong>
                </p>
            </div>
        </>
    );
}