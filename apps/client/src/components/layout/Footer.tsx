import { Link } from 'react-router-dom';

export default function Footer() {

    return (
        <footer className="footer bg-base-200 text-base-content p-6 md:p-8">
            <div className="w-full flex justify-center">
            <div className="w-fit flex gap-0">
                Ce site est gratuit et indépendant. Pour soutenir son développement et nous aider à garder notre indépendance,
                vous pouvez faire un don à <Link to="/donate" className="link link-hover p-0 pl-1">cette page</Link>.
            </div>
            </div>
        </footer>
    );
}
