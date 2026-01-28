import { NavLink } from 'react-router';
import { BookOpen, Users, MessageSquare, PenTool, TrendingUp } from 'lucide-react';
import { fetchStats } from '../hooks/fetchStats';
import { useEffect, useState } from 'react';
import { formatCompactNumber } from '../utils/formatNumber';

export const LandingPage = () => {
    const [stats, setStats] = useState<{ users: number; posts: number; comments: number } | null>(
        null,
    );
    const [, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        fetchStats()
            .then((data) => {
                if (mounted) setStats(data);
            })
            .catch((err) => {
                if (mounted) setError(err?.message || 'Failed to load stats');
            });

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen">
            <div className="hero min-h-screen bg-linear-to-br from-primary/20 via-secondary/10 to-accent/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                <div className="hero-content text-center relative z-10">
                    <div className="max-w-4xl">
                        <div className="mb-10">
                            <h1 className="text-8xl md:text-9xl font-black mb-4 bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                SAW
                            </h1>
                            <div className="h-1.5 w-40 mx-auto bg-linear-to-r from-primary via-secondary to-accent rounded-full shadow-lg"></div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
                            Partagez vos idées avec le{' '}
                            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                monde
                            </span>
                        </h2>
                        <p className="text-lg md:text-xl mb-10 text-base-content/70 max-w-2xl mx-auto leading-relaxed">
                            Une plateforme moderne pour publier vos articles, échanger avec une
                            communauté passionnée et découvrir du contenu inspirant.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap mb-12">
                            <NavLink
                                to="/signup"
                                className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-all"
                            >
                                <TrendingUp size={20} />
                                Commencer gratuitement
                            </NavLink>
                            <NavLink
                                to="/posts"
                                className="btn btn-outline btn-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                Découvrir les posts
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-24 px-4 bg-linear-to-b from-base-100 to-base-200">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            La communauté SAW en{' '}
                            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                chiffres
                            </span>
                        </h2>
                        <p className="text-base-content/60 text-lg">
                            Une plateforme en pleine croissance
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card bg-linear-to-br from-info/10 to-info/5 border-2 border-info/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="card-body items-center text-center">
                                <Users size={56} className="text-info mb-4" />
                                <div className="text-5xl font-black text-info mb-2">
                                    {stats ? formatCompactNumber(stats.users) : '—'}
                                </div>
                                <h3 className="text-xl font-semibold text-base-content/80">
                                    Utilisateurs
                                </h3>
                                <p className="text-sm text-base-content/60">
                                    Rejoignez notre communauté
                                </p>
                            </div>
                        </div>

                        <div className="card bg-linear-to-br from-primary/10 to-primary/5 border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="card-body items-center text-center">
                                <BookOpen size={56} className="text-primary mb-4" />
                                <div className="text-5xl font-black text-primary mb-2">
                                    {stats ? formatCompactNumber(stats.posts) : '—'}
                                </div>
                                <h3 className="text-xl font-semibold text-base-content/80">
                                    Articles publiés
                                </h3>
                                <p className="text-sm text-base-content/60">
                                    Des contenus de qualité
                                </p>
                            </div>
                        </div>

                        <div className="card bg-linear-to-br from-accent/10 to-accent/5 border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="card-body items-center text-center">
                                <MessageSquare size={56} className="text-accent mb-4" />
                                <div className="text-5xl font-black text-accent mb-2">
                                    {stats ? formatCompactNumber(stats.comments) : '—'}
                                </div>
                                <h3 className="text-xl font-semibold text-base-content/80">
                                    Commentaires
                                </h3>
                                <p className="text-sm text-base-content/60">
                                    Des échanges enrichissants
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-24 px-4 bg-base-200">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Pourquoi{' '}
                            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                nous rejoindre
                            </span>{' '}
                            ?
                        </h2>
                        <p className="text-base-content/60 text-lg">
                            Découvrez tous les avantages de notre plateforme
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-base-300">
                            <div className="card-body items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <PenTool size={40} className="text-primary" />
                                </div>
                                <h3 className="card-title text-xl">Publiez facilement</h3>
                                <p className="text-base-content/70">
                                    Créez et partagez vos articles en quelques clics avec notre
                                    éditeur Markdown intuitif.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-base-300">
                            <div className="card-body items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                                    <BookOpen size={40} className="text-secondary" />
                                </div>
                                <h3 className="card-title text-xl">Contenu varié</h3>
                                <p className="text-base-content/70">
                                    Découvrez une multitude d'articles sur des sujets passionnants
                                    et diversifiés.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-base-300">
                            <div className="card-body items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                    <MessageSquare size={40} className="text-accent" />
                                </div>
                                <h3 className="card-title text-xl">Échangez</h3>
                                <p className="text-base-content/70">
                                    Commentez, discutez et partagez vos opinions avec la communauté.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-base-300">
                            <div className="card-body items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-info/10 flex items-center justify-center mb-4">
                                    <Users size={40} className="text-info" />
                                </div>
                                <h3 className="card-title text-xl">Communauté active</h3>
                                <p className="text-base-content/70">
                                    Rejoignez une communauté de passionnés et développez votre
                                    réseau.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-24 px-4 bg-linear-to-br from-primary/10 via-secondary/5 to-accent/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Prêt à{' '}
                        <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                            partager
                        </span>{' '}
                        vos idées ?
                    </h2>
                    <p className="text-xl mb-10 text-base-content/70 max-w-2xl mx-auto">
                        Créez votre compte gratuitement et commencez à publier dès aujourd'hui.
                        Rejoignez des milliers d'auteurs passionnés.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <NavLink
                            to="/signup"
                            className="btn btn-primary btn-lg shadow-xl hover:shadow-2xl transition-all"
                        >
                            S'inscrire maintenant
                        </NavLink>
                        <NavLink
                            to="/signin"
                            className="btn btn-outline btn-lg shadow-xl hover:shadow-2xl transition-all"
                        >
                            J'ai déjà un compte
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};
