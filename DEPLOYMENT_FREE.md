# Deploiement Gratuit - HaitiConnect

Ce guide deploie HaitiConnect sur:

- Backend: Render (plan `free`)
- Base de donnees: MongoDB Atlas (cluster `M0` gratuit)

## 1) Preparer le depot GitHub

1. Cree un repository GitHub.
2. Pousse ce projet dessus (incluant `render.yaml`).

## 2) Creer MongoDB Atlas gratuit

1. Cree un compte Atlas.
2. Cree un cluster `M0` (free tier).
3. Cree un utilisateur DB (username/password).
4. Dans `Network Access`, autorise Render:
   - pour tester vite: `0.0.0.0/0`
   - en production: restreindre ensuite.
5. Copie la chaine `MONGO_URI`.

## 3) Deployer sur Render

1. Connecte GitHub a Render.
2. Clique `New +` -> `Blueprint`.
3. Selectionne ton repo.
4. Render detecte `render.yaml` et cree le service.

### Variables a renseigner dans Render (Environment)

- `MONGO_URI`
- `JWT_SECRET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `SUPER_ADMIN_FIRST_NAME` (optionnel)
- `SUPER_ADMIN_LAST_NAME` (optionnel)
- `TWILIO_ACCOUNT_SID` (si WhatsApp actif)
- `TWILIO_AUTH_TOKEN` (si WhatsApp actif)
- `TWILIO_WHATSAPP_FROM` (ex: `whatsapp:+14155238886`)
- `DIRECTOR_WHATSAPP` (optionnel)
- `PUBLIC_BASE_URL` = URL Render du service (ex: `https://haiticonnect-api.onrender.com`)

`JWT_EXPIRES_IN=1d` et `NODE_ENV=production` sont deja preconfigures.

### Import en bloc depuis un fichier `.env`

Tu peux importer rapidement toutes les variables:

1. Ouvre `render.env.example` dans le projet.
2. Remplace les valeurs (`MONGO_URI`, `JWT_SECRET`, etc.).
3. Sur Render -> `Environment` -> option `Add from .env` (ou collage multi-lignes).
4. Colle tout le contenu du fichier, puis sauvegarde.

## 4) Verifier apres deploiement

- Health: `GET https://<ton-service>.onrender.com/health`
- Swagger: `https://<ton-service>.onrender.com/api/docs`

## 5) Notes importantes

- Le plan gratuit Render peut "sleep" apres inactivite, donc le premier appel peut etre lent.
- Pour WhatsApp Business en production, configure un numero approuve et des templates si necessaire.
- Pour les PDFs bulletins, le stockage local du conteneur n'est pas persistant a long terme.
  Pour production robuste, branche un stockage objet (S3/Cloudinary/GCS).
