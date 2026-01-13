import { NavLink } from 'react-router';
import { BookOpen, Users, MessageSquare, PenTool } from 'lucide-react';

export const LandingPage = () => {
    return (
        <div className="min-h-screen">
            <div className="hero min-h-screen bg-linear-to-br from-primary/10 to-secondary/10">
                <div className="hero-content text-center">
                    <div className="max-w-3xl">
                        <div className="mb-8">
                            <h1 className="text-9xl font-black mb-2 bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
                                SAW
                            </h1>
                            <div className="h-1 w-32 mx-auto bg-linear-to-r from-primary to-secondary rounded-full animate-pulse"></div>
                        </div>
                        <h2 className="text-5xl font-bold mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Partagez vos idées avec le monde
                        </h2>
                        <p className="text-xl mb-8 text-base-content/80">
                            Une plateforme moderne pour publier vos articles,
                            échanger avec une communauté passionnée et découvrir
                            du contenu inspirant.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <NavLink
                                to="/signup"
                                className="btn btn-primary btn-lg"
                            >
                                Commencer gratuitement
                            </NavLink>
                            <NavLink
                                to="/posts"
                                className="btn btn-outline btn-lg"
                            >
                                Découvrir les posts
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20 px-4 bg-base-200">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        Pourquoi nous rejoindre ?
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body items-center text-center">
                                <PenTool
                                    size={48}
                                    className="text-primary mb-4"
                                />
                                <h3 className="card-title">
                                    Publiez facilement
                                </h3>
                                <p>
                                    Créez et partagez vos articles en quelques
                                    clics avec notre éditeur Markdown intuitif.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body items-center text-center">
                                <BookOpen
                                    size={48}
                                    className="text-secondary mb-4"
                                />
                                <h3 className="card-title">Contenu varié</h3>
                                <p>
                                    Découvrez une multitude d'articles sur des
                                    sujets passionnants et diversifiés.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body items-center text-center">
                                <MessageSquare
                                    size={48}
                                    className="text-accent mb-4"
                                />
                                <h3 className="card-title">Échangez</h3>
                                <p>
                                    Commentez, discutez et partagez vos opinions
                                    avec la communauté.
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body items-center text-center">
                                <Users size={48} className="text-info mb-4" />
                                <h3 className="card-title">
                                    Communauté active
                                </h3>
                                <p>
                                    Rejoignez une communauté de passionnés et
                                    développez votre réseau.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Prêt à partager vos idées ?
                    </h2>
                    <p className="text-xl mb-8 text-base-content/70">
                        Créez votre compte gratuitement et commencez à publier
                        dès aujourd'hui.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <NavLink
                            to="/signup"
                            className="btn btn-primary btn-lg"
                        >
                            S'inscrire maintenant
                        </NavLink>
                        <NavLink to="/signin" className="btn btn-ghost btn-lg">
                            J'ai déjà un compte
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};
