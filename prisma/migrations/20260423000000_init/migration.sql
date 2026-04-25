-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "refClient" TEXT NOT NULL,
    "typePrestation" TEXT NOT NULL DEFAULT '',
    "nomSociete" TEXT NOT NULL,
    "contactNom" TEXT NOT NULL DEFAULT '',
    "contactTitre" TEXT NOT NULL DEFAULT '',
    "telephone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "adresse" TEXT NOT NULL DEFAULT '',
    "ville" TEXT NOT NULL DEFAULT '',
    "departement" TEXT NOT NULL DEFAULT '67',
    "codePostal" TEXT NOT NULL DEFAULT '',
    "nbrEp6" INTEGER NOT NULL DEFAULT 0,
    "nbrCo2" INTEGER NOT NULL DEFAULT 0,
    "nbrPoudre" INTEGER NOT NULL DEFAULT 0,
    "nbrRia" INTEGER NOT NULL DEFAULT 0,
    "nbrAlarmeT4" INTEGER NOT NULL DEFAULT 0,
    "nbrSsi" INTEGER NOT NULL DEFAULT 0,
    "desenfumage" INTEGER NOT NULL DEFAULT 0,
    "observations" TEXT NOT NULL DEFAULT '',
    "moisIntervention" INTEGER NOT NULL DEFAULT 1,
    "anneeDerniere" INTEGER NOT NULL DEFAULT 2025,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "dateVisite" TEXT NOT NULL,
    "technicien" TEXT NOT NULL DEFAULT '',
    "travauxJson" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_refClient_key" ON "Client"("refClient");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
