# securite-applications-web


## Sommaire
- [Setup du projet](#setup-du-projet)
  - [Prérequis](#prérequis)
  - [Installation Backend](#installation-backend)
  - [Installation Frontend](#installation-frontend)
  - [Installation application bancaire](#installation-application-bancaire)
- [Configuration des environnements](#configuration-des-environnements)
- [Déploiement](#déploiement)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Admin par défaut](#admin-par-défaut)

## Setup du projet
### Prérequis
- Node.js 22.x ou supérieur
- npm 10.x ou supérieur
- MongoDB

Pour l'installation de Node.js et npm, vous pouvez vous référer au site officiel https://nodejs.org/en/download et 
configurer en fonction de la VM.

### Installation Backend
1. Cloner le dépôt
   ```bash
   git clone https://github.com/Synnly/securite-applications-web
   cd securite-applications-web
   ```
2. Installer les dépendances
   ```bash
   cd apps/api
   npm i
   mkdir keys
   ```
   
3. Configurer les variables d'environnement (voir section "Configuration des environnements" ci-dessous).

4. Placer les fichiers de certificats TLS dans le dossier `apps/api/keys/` :
   - `key.pem` : Clé privée
   - `cert.pem` : Certificat public
   
   Ces fichiers sont **obligatoires** pour le démarrage du backend.

5. Lancer les tests
    ```bash
    npm run test
    ```

6. Build
   ```bash
   npm run build
   ```

### Installation Frontend
1. Cloner le dépôt
   ```bash
   git clone https://github.com/Synnly/securite-applications-web
   cd securite-applications-web
   ```
2. Installer les dépendances
   ```bash
   cd apps/client
   npm i
   ```

3. Configurer les variables d'environnement (voir section "Configuration des environnements" ci-dessous).

4. Build
   ```bash
   npm run build
   ```
   
### Installation application bancaire
1. Cloner le dépôt
   ```bash
   git clone https://github.com/Synnly/securite-applications-web
   cd securite-applications-web
   ```
2. Installer les dépendances
   ```bash
   cd apps/bank
   npm i
   mkdir keys
   ```

3. Configurer les variables d'environnement (voir section "Configuration des environnements" ci-dessous).

4. Placer les fichiers de certificats TLS dans le dossier `apps/bank/keys/` :
    - `key.pem` : Clé privée
    - `cert.pem` : Certificat public

   Ces fichiers sont **obligatoires** pour le démarrage de l'application bancaire.

5. Lancer les tests
    ```bash
    npm run test
    ```

6. Build
   ```bash
   npm run build
   ```



## Configuration des environnements
Les variables d'environnement doivent être configurées dans des fichiers `.env` placés à la racine des dossiers `apps/*`.

### Backend & application bancaire
1. `DATABASE_URL` : URL de connexion à la base de données MongoDB (ex: mongodb://localhost:27017/ma_base)
2. `CORS_URL` : URLs des applications accédant au serveur (ex: http://localhost:8080). Peut être une liste d'URLs séparée par des point-virgules sans espace. **IMPORTANT** : l'application bancaire doit accepter les requêtes du backend ET du frontend.
3. `PORT` : Port sur lequel le serveur backend écoute (ex: 3000).
4. `ACCESS_TOKEN_SECRET` : Clé secrète pour signer les tokens d'accès JWT. Clé de 64 caractères minimum recommandée.
5. `REFRESH_TOKEN_SECRET` : Clé secrète pour signer les tokens de rafraîchissement JWT. Clé de 64 caractères minimum recommandée.
6. `ACCESS_TOKEN_LIFESPAN_MINUTES` : Durée de vie des tokens d'accès en minutes (ex: 15 pour 15 minutes). Durée très courte recommandée (max 1 heure).
7. `REFRESH_TOKEN_LIFESPAN_MINUTES` : Durée de vie des tokens de rafraîchissement en minutes (ex: 43200 pour 30 jours). Durée plus longue recommandée.
8. `CSRF_SECRET` : Secret utilisé pour la protection CSRF. Clé de 64 caractères minimum recommandée.
9. `PRETTY_LOGS` : Si `true`, les logs seront formatés pour être plus lisibles (utile en développement). Si `false`, les logs seront en format JSON (utile en production).

### Frontend
1. `VITE_APIURL` : URL de l'application backend (ex: http://localhost:3000).
2. `VITE_BANKURL` : URL de l'application bancaire (ex: http://localhost:4000).


## Déploiement

### Backend
Depuis le dossier `apps/api`, il suffit de lancer la commande :
```bash
npm run start:prod
```

### Frontend
Pour déployer le frontend, il suffit de servir les fichiers statiques générés dans le dossier `dist` après le build dans
le bon dossier de NGINX.

## Admin par défaut
Un utilisateur admin est créé par défaut lors du premier démarrage du backend avec pour email `admin@admin.admin` et un
mot de passe stocké dans `apps/api/ADMIN-CREDENTIALS.txt`. Il est fortement recommandé de changer ce mot de passe après la
première connexion.


[Revenir en haut](#sommaire)