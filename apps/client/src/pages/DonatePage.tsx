import {DonationForm} from "../components/donation/Donationform.tsx";
import {Navbar} from "../components/layout/Navbar.tsx";

export const DonatePage = () => {
    return (
        <>
            <Navbar />
            <div className="flex flex-col gap-10 justify-center items-center h-screen">
                <h1 className="font-bold text-4xl">Donate
                    Faites un don pour soutenir notre site !
                </h1>
                <div>
                    Nous sommes 100% indépendants, et nous voulons le rester !
                    Chaque contribution compte, même un petit don d'1€ peut faire la différence.
                </div>
                <DonationForm />
            </div>
        </>
    );
}