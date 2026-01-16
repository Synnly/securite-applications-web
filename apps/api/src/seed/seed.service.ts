import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { PostService } from '../post/post.service';
import { CommentService } from '../comment/comment.service';
import { CreatePostDto } from '../post/dto/createPost.dto';
import { CreateCommentDto } from '../comment/dto/createComment.dto';
import * as fs from 'fs';
import { randomBytes } from 'node:crypto';
import { Role } from '../common/roles/roles.enum';

@Injectable()
export class SeedService {
    constructor(
        private userService: UserService,
        private postService: PostService,
        private commentService: CommentService,
    ) {}

    /**
     * Run the seed process to initialize the database with default data.
     * Creates a default admin user if none exist and a general forum.
     * If the default admin is created, their credentials are saved to 'ADMIN-CREDENTIALS.txt'.
     * If the file cannot be written, an error is logged and the admin is not created.
     */
    async run() {
        // Create a default admin if none exist
        const adminCount = await this.userService.countByRole(Role.ADMIN);

        if (adminCount === 0) {
            const password = randomBytes(64).toString('hex');

            try {
                fs.writeFileSync(
                    'ADMIN-CREDENTIALS.txt',
                    'CHANGE THE DEFAULT PASSWORD AND DELETE THIS FILE AS SOON AS POSSIBLE :\n' +
                        password,
                );

                const dto = new CreateUserDto();

                dto.email = 'admin@admin.admin';
                dto.password = password;
                dto.role = Role.ADMIN;

                await this.userService.create(dto);
            } catch (error) {
                Logger.error(
                    'Failed to write ADMIN-CREDENTIALS.txt file during seeding. Default admin not created.',
                );
            }
        }

        // Seed posts and comments
        try {
            await this.seedPostsAndComments();
        } catch (error) {
            Logger.error(
                'Failed to seed posts and comments during seeding:',
                error,
            );
        }
    }

    /**
     * Seeds 12 posts with random comments (1-30 per post)
     */
    private async seedPostsAndComments() {
        // Get admin user to be the author
        const users = await this.userService.findAll();
        if (users.length === 0) return;
        const posts = await this.postService.findAll({ page: 1, limit: 1 });
        if (posts.data.length > 0) return; // Posts already exist
        const author = users[0];

        const postsData = [
            {
                title: '🚀 Introduction au Développement Web Moderne',
                body: `# Bienvenue dans le monde du développement web!

Le développement web a **considérablement évolué** ces dernières années. Voici les points clés:

## Technologies Essentielles

- **Frontend**: React, Vue.js, Angular
- **Backend**: Node.js, Django, Spring Boot
- **Bases de données**: MongoDB, PostgreSQL, Redis

### Pourquoi apprendre le développement web?

1. Forte demande sur le marché
2. Créativité et innovation
3. Travail flexible et remote-friendly

> "Le web est devenu la plateforme universelle pour créer et partager des applications."

\`\`\`javascript
console.log("Hello, World!");
\`\`\``,
            },
            {
                title: '🔐 Sécurité des Applications Web: Guide Complet',
                body: `# Les Fondamentaux de la Sécurité Web

## Menaces Courantes

### 1. Injection SQL
L'une des vulnérabilités les plus dangereuses:

\`\`\`sql
SELECT * FROM users WHERE username = '$input';
-- Danger si $input = "admin' OR '1'='1"
\`\`\`

### 2. XSS (Cross-Site Scripting)
Attaque permettant d'injecter du code malveillant.

### 3. CSRF (Cross-Site Request Forgery)

## Bonnes Pratiques

- ✅ Toujours valider les entrées utilisateur
- ✅ Utiliser des requêtes préparées
- ✅ Implémenter HTTPS
- ✅ Gérer correctement les sessions

**Important**: La sécurité n'est pas une option, c'est une nécessité!`,
            },
            {
                title: '💡 Les Design Patterns en JavaScript',
                body: `# Patterns de Conception JavaScript

## Singleton Pattern

\`\`\`javascript
const Singleton = (function() {
    let instance;
    
    function createInstance() {
        return { message: "I am the instance" };
    }
    
    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
\`\`\`

## Observer Pattern
Parfait pour créer des systèmes événementiels!

### Avantages:
1. Découplage du code
2. Réutilisabilité
3. Maintenabilité améliorée

---

*Ces patterns sont la base d'une architecture solide.*`,
            },
            {
                title: '🎨 CSS Grid vs Flexbox: Quand Utiliser Quoi?',
                body: `# Le Grand Débat: Grid ou Flexbox?

## Flexbox

**Meilleur pour**: Layouts unidimensionnels

\`\`\`css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
\`\`\`

### Cas d'usage:
- Navigation bars
- Card layouts
- Centrage vertical

## CSS Grid

**Meilleur pour**: Layouts bidimensionnels

\`\`\`css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
\`\`\`

### Cas d'usage:
- Page layouts complexes
- Galeries d'images
- Dashboards

| Feature | Flexbox | Grid |
|---------|---------|------|
| Dimension | 1D | 2D |
| Complexité | Simple | Avancée |
| Support | Excellent | Bon |

> La vraie réponse: utilisez les deux selon le contexte!`,
            },
            {
                title: '⚡ Optimisation des Performances React',
                body: `# Rendre vos Applications React Ultra-Rapides

## Techniques Essentielles

### 1. Memoization avec React.memo

\`\`\`jsx
const MyComponent = React.memo(({ data }) => {
    return <div>{data.name}</div>;
});
\`\`\`

### 2. useMemo et useCallback

\`\`\`jsx
const expensiveValue = useMemo(() => {
    return computeExpensiveValue(a, b);
}, [a, b]);
\`\`\`

### 3. Code Splitting

\`\`\`jsx
const LazyComponent = React.lazy(() => import('./Heavy'));
\`\`\`

## Checklist Performance:

- [ ] Lazy loading des images
- [ ] Virtualisation des longues listes
- [ ] Réduction du bundle size
- [ ] Service Workers pour le cache
- [ ] Optimisation des re-renders

**Résultat**: Application fluide et utilisateurs heureux! 🎉`,
            },
            {
                title: '🗄️ MongoDB vs PostgreSQL: Le Bon Choix',
                body: `# Bases de Données: SQL ou NoSQL?

## MongoDB (NoSQL)

### Avantages:
- 📊 Schéma flexible
- 🚀 Scaling horizontal facile
- 📝 Format JSON naturel

\`\`\`javascript
db.users.insertOne({
    name: "Alice",
    skills: ["JavaScript", "Python"],
    address: {
        city: "Paris",
        country: "France"
    }
});
\`\`\`

## PostgreSQL (SQL)

### Avantages:
- ✨ ACID compliance
- 🔗 Relations complexes
- 📈 Requêtes analytiques puissantes

\`\`\`sql
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.name;
\`\`\`

## Quand Choisir Quoi?

| Critère | MongoDB | PostgreSQL |
|---------|---------|------------|
| Structure variable | ✅ | ❌ |
| Transactions complexes | ❌ | ✅ |
| Relations multiples | ❌ | ✅ |
| Scaling horizontal | ✅ | ⚠️ |`,
            },
            {
                title: '🧪 Testing Best Practices avec Jest',
                body: `# L'Art du Testing en JavaScript

## Pourquoi Tester?

> "Code sans tests = dette technique garantie"

### Les 3 Types de Tests:

1. **Unit Tests**: Testent des fonctions isolées
2. **Integration Tests**: Testent l'interaction entre modules
3. **E2E Tests**: Testent le parcours utilisateur complet

## Exemple avec Jest

\`\`\`javascript
describe('Calculator', () => {
    it('should add two numbers correctly', () => {
        expect(add(2, 3)).toBe(5);
    });
    
    it('should handle negative numbers', () => {
        expect(add(-1, -1)).toBe(-2);
    });
});
\`\`\`

## Couverture de Code

Visez **80%+ de coverage**, mais la qualité prime sur la quantité!

### Tips:
- ✨ Tests lisibles et maintenables
- 🎯 Un test = une responsabilité
- 🔄 Éviter les tests fragiles
- 📊 Surveiller les métriques`,
            },
            {
                title: '🌐 API RESTful: Principes et Conventions',
                body: `# Créer des APIs RESTful Élégantes

## Les Verbes HTTP

| Verbe | Usage | Exemple |
|-------|-------|----------|
| GET | Récupérer | \`GET /api/users\` |
| POST | Créer | \`POST /api/users\` |
| PUT | Remplacer | \`PUT /api/users/1\` |
| PATCH | Modifier | \`PATCH /api/users/1\` |
| DELETE | Supprimer | \`DELETE /api/users/1\` |

## Codes de Statut HTTP

### Succès (2xx)
- **200**: OK
- **201**: Created
- **204**: No Content

### Erreurs Client (4xx)
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found

### Erreurs Serveur (5xx)
- **500**: Internal Server Error
- **503**: Service Unavailable

## Exemple de Réponse Structurée

\`\`\`json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "John Doe"
    },
    "metadata": {
        "timestamp": "2026-01-12T10:00:00Z"
    }
}
\`\`\`

**Best Practice**: Versionnez vos APIs! \`/api/v1/users\``,
            },
            {
                title: '🔄 Git Workflow: Les Bonnes Pratiques',
                body: `# Maîtriser Git comme un Pro

## Conventional Commits

\`\`\`bash
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify user service logic
test: add unit tests for auth module
\`\`\`

## Branching Strategy

### GitFlow

\`\`\`
main (production)
  └─ develop
      ├─ feature/new-feature
      ├─ bugfix/critical-fix
      └─ release/v1.2.0
\`\`\`

## Commandes Utiles

\`\`\`bash
# Stash temporaire
git stash save "WIP: new feature"

# Rebase interactif
git rebase -i HEAD~3

# Cherry-pick un commit
git cherry-pick abc123

# Amend le dernier commit
git commit --amend
\`\`\`

### Tips:
- 📝 Commits atomiques et descriptifs
- 🔍 Relire avant de push
- 🚫 Jamais de force push sur main
- ✅ Pull requests = code review`,
            },
            {
                title: '🎯 TypeScript: Typage Avancé',
                body: `# TypeScript: Au-delà des Bases

## Generics

\`\`\`typescript
function identity<T>(arg: T): T {
    return arg;
}

const result = identity<string>("hello");
\`\`\`

## Union Types

\`\`\`typescript
type Status = "pending" | "approved" | "rejected";

interface User {
    id: number;
    name: string;
    status: Status;
}
\`\`\`

## Utility Types

\`\`\`typescript
// Partial: tous les champs optionnels
type PartialUser = Partial<User>;

// Pick: sélectionner des champs
type UserPreview = Pick<User, "id" | "name">;

// Omit: exclure des champs
type UserWithoutId = Omit<User, "id">;

// Record: créer un type objet
type UserRoles = Record<string, string[]>;
\`\`\`

## Type Guards

\`\`\`typescript
function isString(value: unknown): value is string {
    return typeof value === "string";
}
\`\`\`

### Avantages:
1. 🛡️ Sécurité du typage
2. 📚 IntelliSense amélioré
3. 🐛 Détection d'erreurs précoce
4. 📖 Documentation auto-générée`,
            },
            {
                title: '🚢 Docker: Conteneurisation pour Débutants',
                body: `# Docker: Simplifier le Déploiement

## Qu'est-ce que Docker?

Docker permet d'**empaqueter une application** avec toutes ses dépendances dans un conteneur.

## Dockerfile Exemple

\`\`\`dockerfile
# Image de base
FROM node:18-alpine

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
\`\`\`

## Docker Compose

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
\`\`\`

## Commandes Essentielles

\`\`\`bash
# Build une image
docker build -t myapp .

# Lancer un conteneur
docker run -p 3000:3000 myapp

# Voir les conteneurs actifs
docker ps

# Arrêter un conteneur
docker stop container_id
\`\`\`

### Bénéfices:
- ✅ Environnement reproductible
- ✅ Isolation des applications
- ✅ Déploiement simplifié
- ✅ Scaling facile`,
            },
            {
                title: '🎓 Clean Code: Principes Fondamentaux',
                body: `# L'Art d'Écrire du Code Propre

## Les Principes SOLID

### S - Single Responsibility
> Une classe = une responsabilité

### O - Open/Closed
> Ouvert à l'extension, fermé à la modification

### L - Liskov Substitution
> Les sous-types doivent être substituables

### I - Interface Segregation
> Interfaces spécifiques > interfaces générales

### D - Dependency Inversion
> Dépendre d'abstractions, pas de concrétions

## Nommage Significatif

❌ **Mauvais**:
\`\`\`javascript
const d = new Date();
const arr = [];
function fn(x, y) { return x + y; }
\`\`\`

✅ **Bon**:
\`\`\`javascript
const currentDate = new Date();
const activeUsers = [];
function calculateTotal(price, tax) {
    return price + tax;
}
\`\`\`

## Règles d'Or

1. **DRY**: Don't Repeat Yourself
2. **KISS**: Keep It Simple, Stupid
3. **YAGNI**: You Aren't Gonna Need It

### Commentaires

> "Un bon code se documente lui-même"

Commentez le **pourquoi**, pas le **comment**.

---

*Code propre = équipe heureuse = projet réussi* ✨`,
            },
        ];

        const commentTemplates = [
            'Excellent article! Très instructif 👍',
            "Merci pour ce partage, ça m'a beaucoup aidé!",
            "Quelqu'un a des ressources complémentaires sur ce sujet?",
            "Je ne suis pas d'accord avec certains points, notamment...",
            'Super clair! Parfait pour les débutants 🎯',
            "Est-ce que quelqu'un a testé cette approche en production?",
            "J'ai rencontré un problème similaire la semaine dernière",
            'Très bon résumé! Bookmarké pour référence future',
            'Pourriez-vous développer la partie sur...?',
            'Il y a une typo dans le code, ligne 15',
            "Génial! J'ai appris quelque chose de nouveau aujourd'hui",
            "C'est exactement ce que je cherchais, merci!",
            'Intéressant, mais il manque peut-être un exemple concret',
            'Je recommande aussi de regarder la documentation officielle',
            "Ça fait longtemps que j'utilise cette technique, elle marche bien",
            'Attention, cette méthode peut poser des problèmes de performance',
            "Bravo pour la clarté de l'explication! 🌟",
            "Quelqu'un connaît une alternative à cette solution?",
            "J'ai implémenté ça hier, fonctionne parfaitement!",
            "N'oubliez pas de gérer les cas d'erreur aussi",
            "Excellent timing, j'en avais justement besoin!",
            'Pour ceux qui veulent approfondir, je conseille...',
            'Petite question: est-ce compatible avec les versions antérieures?',
            "Merci! Ça m'a économisé des heures de recherche",
            'Très bon point sur la sécurité 🔐',
            'Je vais essayer ça sur mon projet personnel',
            'Il faudrait peut-être mettre à jour avec les dernières versions',
            "Impressionnant! Vous avez d'autres articles du même genre?",
            "Simple et efficace, j'adore! 💯",
            'Attention aux breaking changes dans la v2',
            "Quelqu'un a des benchmarks de performance?",
            'Cette approche est recommandée par la communauté',
            'Je préfère utiliser une autre méthode personnellement',
            'Bien expliqué! Même ma grand-mère comprendrait 😄',
            'Y a-t-il des limitations connues?',
            "Parfait pour mon cas d'usage, merci beaucoup!",
            'Je vais partager ça avec mon équipe',
            'Très pédagogique, continuez comme ça!',
            'On devrait ajouter ça dans notre style guide',
            "Exact! J'ai fait la même erreur au début",
        ];

        // Create posts and comments
        for (const postData of postsData) {
            const dto = new CreatePostDto();
            dto.title = postData.title;
            dto.body = postData.body;

            await this.postService.create(dto, author._id.toString());

            // Get the created post to add comments
            const allPosts = await this.postService.findAll({
                page: 1,
                limit: 100,
            });
            const createdPost = allPosts.data.find(
                (p) => p.title === postData.title,
            );

            if (createdPost) {
                // Random number of comments between 1 and 30
                const commentCount = Math.floor(Math.random() * 30) + 1;

                for (let i = 0; i < commentCount; i++) {
                    const commentDto = new CreateCommentDto();
                    // Pick a random comment from templates
                    const randomIndex = Math.floor(
                        Math.random() * commentTemplates.length,
                    );
                    commentDto.text = commentTemplates[randomIndex];

                    await this.commentService.create(
                        commentDto,
                        author._id.toString(),
                        createdPost._id.toString(),
                    );
                }
            }
        }

        Logger.log('✅ Successfully seeded 12 posts with random comments');
    }
}
