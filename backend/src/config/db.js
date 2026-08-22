import { PrismaClient } from "@prisma/client";

// Instance unique du client Prisma, réutilisée partout dans l'app
// plutôt que d'en recréer une par fichier (évite d'épuiser les connexions DB).
export const prisma = new PrismaClient();
