# HaitiConnect Backend (Node.js + Express)

Backend SaaS multi-ecole pour la gestion financiere et administrative, avec un premier module de gestion des paiements scolaires et notifications WhatsApp.

## Fonctionnalites implementees

- Multi-ecole avec `schoolId` (segmentation des donnees)
- Authentification JWT
- Roles et permissions:
  - `SUPER_ADMIN`
  - `DIRECTOR`
  - `CASHIER`
  - `PARENT`
  - `STUDENT`
- CRUD REST API:
  - Utilisateurs
  - Eleves
  - Paiements
  - Rapports
- Paiements:
  - Enregistrement des paiements
  - Suivi du montant paye et du solde du
  - Numero de recu automatique
  - Historique des transactions par eleve
  - Rapports financiers (journalier + resume global)
- Notifications WhatsApp (Twilio WhatsApp API):
  - Confirmation apres paiement
  - Alerte de solde a la direction
  - Rappels de paiement a envoyer manuellement via endpoint
- Documentation OpenAPI disponible via Swagger UI
- Module bulletins scolaires:
  - Saisie des notes par professeur (matiere/periode/coefficient)
  - Generation bulletin final par direction
  - Export PDF pret a imprimer
  - Envoi du bulletin final via WhatsApp aux parents

## Architecture

```text
src/
  app.js
  server.js
  config/
    db.js
    swagger.js
  constants/
    roles.js
  controllers/
    auth.controller.js
    users.controller.js
    students.controller.js
    payments.controller.js
    reports.controller.js
    notifications.controller.js
    grades.controller.js
    bulletins.controller.js
  docs/
    openapi.yaml
  middlewares/
    auth.middleware.js
    rbac.middleware.js
    schoolScope.middleware.js
    error.middleware.js
  models/
    School.js
    User.js
    Student.js
    Payment.js
    Grade.js
    Bulletin.js
  routes/
    index.js
    auth.routes.js
    users.routes.js
    students.routes.js
    payments.routes.js
    reports.routes.js
    notifications.routes.js
    grades.routes.js
    bulletins.routes.js
  services/
    whatsapp.service.js
    bulletin.service.js
  utils/
    receipt.js
  validators/
    grade.validator.js
    bulletin.validator.js
```

## Installation

```bash
npm install
```

## Configuration

1. Copier `.env.example` vers `.env`
2. Renseigner les variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM`
   - `PUBLIC_BASE_URL` (important pour media URL des PDFs de bulletins WhatsApp)

## Lancer le serveur

```bash
npm run dev
```

Serveur: `http://localhost:4000`

## Documentation API

- Swagger UI: `http://localhost:4000/api/docs`
- Health check: `GET /health`

## Deploiement gratuit

- Fichier Render Blueprint: `render.yaml`
- Guide complet: `DEPLOYMENT_FREE.md`

## Endpoints principaux (prefix: `/api/v1`)

- `POST /auth/register`
- `POST /auth/login`
- `GET/POST /users`
- `GET/POST /students`
- `GET /students/:id/balance`
- `GET/POST /payments`
- `GET /payments/student/:studentId/history`
- `GET /reports/daily`
- `GET /reports/financial-summary`
- `POST /notifications/reminders/send-due`
- `GET/POST /grades`
- `GET/PUT/DELETE /grades/:id`
- `POST /bulletins/generate`
- `GET /bulletins`
- `GET /bulletins/:id`
- `GET /bulletins/:id/export`
- `POST /bulletins/:id/send-whatsapp`

## Extensibilite (modules futurs)

La structure est deja preparee pour ajouter:

- Gestion des eleves et profils scolaires (approfondi)
- Suivi des presences et absences
- Gestion des cours, emplois du temps et enseignants
- Gestion des notes, examens et bulletins
- Portail parent/eleve (messages et documents)
- Analytics avances et rapports statistiques

Pour chaque nouveau module: ajouter `models/`, `controllers/`, `routes/`, puis brancher dans `src/routes/index.js`.
