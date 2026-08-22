import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Liste finale retenue (cahier des charges v2)
const THEMES = [
  "Humour", "Musique", "Danse", "Sport", "Études", "Technologie",
  "Art", "Gaming", "Mode", "Lifestyle", "Amour", "Divertissement", "Autre",
];

async function main() {
  for (const name of THEMES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seed terminé : ${THEMES.length} thèmes créés/déjà présents.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
