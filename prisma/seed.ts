import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SEED_CLIENTS = [
  { refClient: "AC-0142", typePrestation: "EXTINCTION", nomSociete: "Garage Muller SARL", contactNom: "Jean-Pierre Muller", contactTitre: "Gérant", telephone: "03 88 45 12 67", email: "contact@garage-muller.fr", adresse: "14 rue des Artisans", ville: "Haguenau", departement: "67", codePostal: "67500", nbrEp6: 6, nbrCo2: 2, nbrPoudre: 3, nbrRia: 0, nbrAlarmeT4: 0, nbrSsi: 0, desenfumage: 0, observations: "Accès parking arrière — demander Pascal en atelier.", moisIntervention: 4, anneeDerniere: 2025 },
  { refClient: "AC-0087", typePrestation: "EXTINCTION,SSI", nomSociete: "Restaurant Au Cerf", contactNom: "Sylvie Koch", contactTitre: "Propriétaire", telephone: "03 88 91 34 22", email: "reservations@aucerf.fr", adresse: "3 place du Marché", ville: "Obernai", departement: "67", codePostal: "67210", nbrEp6: 4, nbrCo2: 3, nbrPoudre: 1, nbrRia: 0, nbrAlarmeT4: 1, nbrSsi: 0, desenfumage: 0, observations: "Fermé lundi. Extincteur cuisine CO2 à remplacer 2026.", moisIntervention: 5, anneeDerniere: 2025 },
  { refClient: "AC-0203", typePrestation: "EXTINCTION,ALARME", nomSociete: "Mosquée Eyyub Sultan", contactNom: "Mehmet Yildiz", contactTitre: "Président association", telephone: "06 24 88 17 03", email: "association.eyyub@gmail.com", adresse: "8 rue du Général Leclerc", ville: "Mulhouse", departement: "68", codePostal: "68100", nbrEp6: 8, nbrCo2: 0, nbrPoudre: 2, nbrRia: 0, nbrAlarmeT4: 1, nbrSsi: 0, desenfumage: 0, observations: "Privilégier RDV après prière du vendredi.", moisIntervention: 5, anneeDerniere: 2025 },
  { refClient: "AC-0055", typePrestation: "EXTINCTION,SSI,DESENFUMAGE", nomSociete: "Supermarché Coccimarket", contactNom: "Laurent Weber", contactTitre: "Directeur", telephone: "03 89 42 11 88", email: "l.weber@cocci-colmar.fr", adresse: "22 avenue de la République", ville: "Colmar", departement: "68", codePostal: "68000", nbrEp6: 12, nbrCo2: 4, nbrPoudre: 2, nbrRia: 2, nbrAlarmeT4: 0, nbrSsi: 1, desenfumage: 3, observations: "Désenfumage toiture vérifier trappe zone B avant intervention.", moisIntervention: 5, anneeDerniere: 2025 },
  { refClient: "AC-0178", typePrestation: "EXTINCTION", nomSociete: "Boulangerie Schmitt", contactNom: "Catherine Schmitt", contactTitre: "Gérante", telephone: "03 88 76 02 14", email: "boulangerie.schmitt@orange.fr", adresse: "41 Grand Rue", ville: "Sélestat", departement: "67", codePostal: "67600", nbrEp6: 3, nbrCo2: 1, nbrPoudre: 1, nbrRia: 0, nbrAlarmeT4: 0, nbrSsi: 0, desenfumage: 0, observations: "Fournil RDC — passer avant 6h ou après 14h.", moisIntervention: 5, anneeDerniere: 2025 },
  { refClient: "AC-0234", typePrestation: "EXTINCTION", nomSociete: "Association Les Tilleuls", contactNom: "Bernard Hoffmann", contactTitre: "Trésorier", telephone: "06 12 45 78 90", email: "asso.tilleuls@laposte.net", adresse: "5 rue du Stade", ville: "Wissembourg", departement: "67", codePostal: "67160", nbrEp6: 4, nbrCo2: 0, nbrPoudre: 2, nbrRia: 0, nbrAlarmeT4: 0, nbrSsi: 0, desenfumage: 0, observations: "Clé chez M. Hoffmann, domicile 2 rue de l'Église.", moisIntervention: 6, anneeDerniere: 2025 },
  { refClient: "AC-0019", typePrestation: "EXTINCTION,SSI,DESENFUMAGE", nomSociete: "SCI Strasbourg Kléber", contactNom: "Maître Dietrich", contactTitre: "Syndic", telephone: "03 88 32 55 01", email: "syndic@dietrich-immo.fr", adresse: "12 rue du Vieux Marché aux Poissons", ville: "Strasbourg", departement: "67", codePostal: "67000", nbrEp6: 18, nbrCo2: 4, nbrPoudre: 0, nbrRia: 4, nbrAlarmeT4: 0, nbrSsi: 1, desenfumage: 2, observations: "Immeuble R+5. Passer par loge gardien au RDC.", moisIntervention: 3, anneeDerniere: 2025 },
  { refClient: "AC-0112", typePrestation: "EXTINCTION", nomSociete: "Auto-École Rapide", contactNom: "Fatima El Amrani", contactTitre: "Gérante", telephone: "03 89 55 67 41", email: "contact@autoecole-rapide68.fr", adresse: "78 rue de Bâle", ville: "Saint-Louis", departement: "68", codePostal: "68300", nbrEp6: 2, nbrCo2: 1, nbrPoudre: 0, nbrRia: 0, nbrAlarmeT4: 0, nbrSsi: 0, desenfumage: 0, observations: "", moisIntervention: 6, anneeDerniere: 2025 },
  { refClient: "AC-0267", typePrestation: "EXTINCTION,ALARME", nomSociete: "Pharmacie Centrale", contactNom: "Dr. Philippe Meyer", contactTitre: "Pharmacien titulaire", telephone: "03 88 14 22 09", email: "pharmacie.meyer@wanadoo.fr", adresse: "6 place Kléber", ville: "Strasbourg", departement: "67", codePostal: "67000", nbrEp6: 3, nbrCo2: 2, nbrPoudre: 0, nbrRia: 0, nbrAlarmeT4: 1, nbrSsi: 0, desenfumage: 0, observations: "Alarme Type 4 pile à changer chaque vérification.", moisIntervention: 7, anneeDerniere: 2025 },
  { refClient: "AC-0091", typePrestation: "EXTINCTION,SSI,DESENFUMAGE,ALARME", nomSociete: "EHPAD Les Charmilles", contactNom: "Isabelle Fuchs", contactTitre: "Directrice", telephone: "03 89 77 88 12", email: "direction@ehpad-charmilles.fr", adresse: "15 rue des Vergers", ville: "Guebwiller", departement: "68", codePostal: "68500", nbrEp6: 24, nbrCo2: 6, nbrPoudre: 2, nbrRia: 6, nbrAlarmeT4: 0, nbrSsi: 1, desenfumage: 4, observations: "ERP catégorie J. Rapport conforme pour commission sécurité.", moisIntervention: 2, anneeDerniere: 2025 },
  { refClient: "AC-0158", typePrestation: "EXTINCTION,SSI", nomSociete: "Imprimerie Braun", contactNom: "Marc Braun", contactTitre: "PDG", telephone: "03 88 62 14 55", email: "m.braun@imprimerie-braun.com", adresse: "ZA des Pins, 3 rue du Tilleul", ville: "Schiltigheim", departement: "67", codePostal: "67300", nbrEp6: 9, nbrCo2: 3, nbrPoudre: 4, nbrRia: 1, nbrAlarmeT4: 0, nbrSsi: 1, desenfumage: 0, observations: "Attention solvants en zone stockage — poudre obligatoire.", moisIntervention: 4, anneeDerniere: 2025 },
  { refClient: "AC-0220", typePrestation: "EXTINCTION", nomSociete: "Cabinet Dentaire Lemaire", contactNom: "Dr. Anne Lemaire", contactTitre: "Chirurgien-dentiste", telephone: "03 89 41 02 87", email: "cabinet.lemaire@orange.fr", adresse: "44 avenue de Paris", ville: "Mulhouse", departement: "68", codePostal: "68100", nbrEp6: 2, nbrCo2: 1, nbrPoudre: 0, nbrRia: 0, nbrAlarmeT4: 0, nbrSsi: 0, desenfumage: 0, observations: "", moisIntervention: 7, anneeDerniere: 2025 },
  { refClient: "AC-0033", typePrestation: "EXTINCTION", nomSociete: "Camping du Ried", contactNom: "Gérard Lang", contactTitre: "Gérant", telephone: "03 88 85 44 21", email: "info@camping-du-ried.fr", adresse: "Route du Rhin", ville: "Rhinau", departement: "67", codePostal: "67860", nbrEp6: 8, nbrCo2: 2, nbrPoudre: 4, nbrRia: 0, nbrAlarmeT4: 0, nbrSsi: 0, desenfumage: 0, observations: "Saisonnier — privilégier mars à mai avant ouverture.", moisIntervention: 4, anneeDerniere: 2025 },
  { refClient: "AC-0301", typePrestation: "EXTINCTION,SSI", nomSociete: "Garage Peugeot Altkirch", contactNom: "Stéphane Bauer", contactTitre: "Chef d'atelier", telephone: "03 89 40 18 77", email: "s.bauer@peugeot-altkirch.fr", adresse: "ZI Est, 12 rue de l'Industrie", ville: "Altkirch", departement: "68", codePostal: "68130", nbrEp6: 11, nbrCo2: 2, nbrPoudre: 6, nbrRia: 1, nbrAlarmeT4: 0, nbrSsi: 1, desenfumage: 0, observations: "Peinture cabine — risque spécifique.", moisIntervention: 6, anneeDerniere: 2025 },
  { refClient: "AC-0064", typePrestation: "EXTINCTION,SSI,DESENFUMAGE", nomSociete: "Hôtel des Vosges", contactNom: "Nathalie Ritter", contactTitre: "Directrice", telephone: "03 88 93 01 22", email: "reception@hoteldesvosges.fr", adresse: "10 route de Strasbourg", ville: "Saverne", departement: "67", codePostal: "67700", nbrEp6: 14, nbrCo2: 3, nbrPoudre: 0, nbrRia: 2, nbrAlarmeT4: 0, nbrSsi: 1, desenfumage: 2, observations: "32 chambres. Coupure eau prévenir réception.", moisIntervention: 5, anneeDerniere: 2025 },
]

const INITIAL_SETTINGS = {
  techniciens: [
    { id: "t-1", nom: "Thomas Schneider", initiales: "TS", tel: "06 24 80 38 42", email: "t.schneider@acepi.fr", secteur: "67" },
    { id: "t-2", nom: "Marc Kieffer",     initiales: "MK", tel: "06 71 22 18 09", email: "m.kieffer@acepi.fr",   secteur: "68" },
    { id: "t-3", nom: "Laure Roth",       initiales: "LR", tel: "06 45 67 88 12", email: "l.roth@acepi.fr",      secteur: "67+68" },
  ],
  prestations: [
    { id: "p-1", code: "EXTINCTION",  label: "Extinction (extincteurs + RIA)",    color: "#D40712" },
    { id: "p-2", code: "SSI",         label: "Système de sécurité incendie",       color: "#22508F" },
    { id: "p-3", code: "DESENFUMAGE", label: "Désenfumage (trappes, exutoires)",   color: "#E89B0B" },
    { id: "p-4", code: "ALARME",      label: "Alarme Type 4",                      color: "#0F8B61" },
  ],
  travaux: [
    { id: "tr-1", label: "Extincteurs remplacés",          unit: "unité", withQty: true,  withType: true  },
    { id: "tr-2", label: "Valves remplacées",              unit: "unité", withQty: true,  withType: true  },
    { id: "tr-3", label: "Alarme testée (Type 4 / SSI)",   unit: "test",  withQty: false, withType: false },
    { id: "tr-4", label: "Système de désenfumage vérifié", unit: "unité", withQty: false, withType: false },
    { id: "tr-5", label: "Contrôle étiquetage / plombs",  unit: "unité", withQty: false, withType: false },
    { id: "tr-6", label: "Autre intervention",             unit: "unité", withQty: false, withType: false },
  ],
  equipements: [
    { id: "e-1", code: "EP6",    label: "Extincteur eau pulvérisée 6L",  categorie: "Extincteur" },
    { id: "e-2", code: "CO2",    label: "Extincteur dioxyde de carbone",  categorie: "Extincteur" },
    { id: "e-3", code: "POUDRE", label: "Extincteur poudre ABC",          categorie: "Extincteur" },
    { id: "e-4", code: "RIA",    label: "Robinet d'incendie armé",        categorie: "Hydrant"    },
    { id: "e-5", code: "T4",     label: "Alarme Type 4",                  categorie: "Alarme"     },
    { id: "e-6", code: "SSI",    label: "Système sécurité incendie",      categorie: "Alarme"     },
    { id: "e-7", code: "DESENF", label: "Trappe de désenfumage",          categorie: "Désenfumage"},
  ],
  secteurs: [
    { id: "s-1", code: "67", nom: "Bas-Rhin" },
    { id: "s-2", code: "68", nom: "Haut-Rhin" },
  ],
}

async function main() {
  console.log('Seeding database…')

  const count = await prisma.client.count()
  if (count === 0) {
    for (const c of SEED_CLIENTS) {
      await prisma.client.create({ data: c })
    }
    console.log(`Inserted ${SEED_CLIENTS.length} clients`)
  } else {
    console.log(`Skipping clients — ${count} already exist`)
  }

  for (const [key, value] of Object.entries(INITIAL_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: JSON.stringify(value) },
    })
  }

  // Create default admin user if none exists
  const userCount = await prisma.user.count()
  if (userCount === 0) {
    const defaultUsername = process.env.DEFAULT_USERNAME ?? 'admin'
    const defaultPassword = process.env.DEFAULT_PASSWORD ?? 'acepi2025'
    const hash = await bcrypt.hash(defaultPassword, 12)
    await prisma.user.create({
      data: { username: defaultUsername, passwordHash: hash, displayName: 'Administrateur' },
    })
    console.log(`Created user "${defaultUsername}" (password: "${defaultPassword}") — change it after first login!`)
  } else {
    console.log(`Skipping user — ${userCount} already exist`)
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
