# securite-applications-web

## Configuration des environnements
### Backend
1. `DATABASE_URL` : URL de connexion à la base de données MongoDB (ex: mongodb://localhost:27017/ma_base)
2. `FRONTEND_URL` : URL de l'application frontend (ex: http://localhost:8080). Nécessaire pour la configuration CORS.
3. `PORT` : Port sur lequel le serveur backend écoute (ex: 3000).
4. `ACCESS_TOKEN_SECRET` : Clé secrète pour signer les tokens d'accès JWT. Clé de 64 caractères minimum recommandée.
5. `REFRESH_TOKEN_SECRET` : Clé secrète pour signer les tokens de rafraîchissement JWT. Clé de 64 caractères minimum recommandée.
6. `ACCESS_TOKEN_LIFESPAN_MINUTES` : Durée de vie des tokens d'accès en minutes (ex: 15 pour 15 minutes). Durée très courte recommandée (max 1 heure).
7. `REFRESH_TOKEN_LIFESPAN_MINUTES` : Durée de vie des tokens de rafraîchissement en minutes (ex: 43200 pour 30 jours). Durée plus longue recommandée.

### Frontend