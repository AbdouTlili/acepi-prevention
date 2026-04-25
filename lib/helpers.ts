import type { Client, ClientStatus } from './types'

export const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
export const MOIS_COURT = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"]
export const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]

export function computeNextDue(c: Client): Date {
  return new Date(c.anneeDerniere + 1, c.moisIntervention - 1, 15)
}

export function computeStatus(c: Client, today: Date = new Date()): ClientStatus {
  const next = computeNextDue(c)
  const diffDays = Math.floor((next.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0)  return { code: 'overdue', label: 'En retard', days: diffDays }
  if (diffDays <= 14) return { code: 'due',     label: 'À prévoir', days: diffDays }
  if (diffDays <= 45) return { code: 'soon',    label: 'Bientôt',   days: diffDays }
  return { code: 'ok', label: 'OK', days: diffDays }
}

export function totalEquip(c: Client): number {
  return c.ep6 + c.co2 + c.poudre + c.ria + c.alarmeT4 + c.ssi + c.desenfumage
}

export function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${MOIS_COURT[d.getMonth()].toLowerCase()}. ${d.getFullYear()}`
}

export function formatDateLong(d: Date): string {
  return `${d.getDate()} ${MOIS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`
}

// Convert Excel serial number to JS Date
export function excelSerialToDate(serial: number): Date {
  return new Date(Date.UTC(1899, 11, 30) + serial * 86400000)
}

// Convert French month name to month number (1-12)
export function frenchMonthToNumber(name: string): number {
  const map: Record<string, number> = {
    JANVIER: 1, FÉVRIER: 2, FEVRIER: 2, MARS: 3, AVRIL: 4, MAI: 5, JUIN: 6,
    JUILLET: 7, AOÛT: 8, AOUT: 8, SEPTEMBRE: 9, OCTOBRE: 10, NOVEMBRE: 11, DÉCEMBRE: 12, DECEMBRE: 12,
  }
  return map[name.toUpperCase().trim()] ?? 1
}

// Map DB row → Client shape used by all frontend components
export function dbRowToClient(row: {
  id: number; refClient: string; typePrestation: string; nomSociete: string;
  contactNom: string; contactTitre: string; telephone: string; email: string;
  adresse: string; ville: string; departement: string; codePostal: string;
  nbrEp6: number; nbrCo2: number; nbrPoudre: number; nbrRia: number;
  nbrAlarmeT4: number; nbrSsi: number; desenfumage: number; observations: string;
  moisIntervention: number; anneeDerniere: number;
}): Client {
  return {
    id: row.id,
    ref: row.refClient,
    nom: row.nomSociete,
    contact: row.contactNom,
    titre: row.contactTitre,
    tel: row.telephone,
    email: row.email,
    adresse: row.adresse,
    ville: row.ville,
    dept: row.departement,
    cp: row.codePostal,
    prestation: row.typePrestation ? row.typePrestation.split(',').filter(Boolean) : [],
    moisIntervention: row.moisIntervention,
    anneeDerniere: row.anneeDerniere,
    ep6: row.nbrEp6,
    co2: row.nbrCo2,
    poudre: row.nbrPoudre,
    ria: row.nbrRia,
    alarmeT4: row.nbrAlarmeT4,
    ssi: row.nbrSsi,
    desenfumage: row.desenfumage,
    obs: row.observations,
  }
}

// Map Client shape → DB fields for upsert
export function clientToDbFields(c: Omit<Client, 'id'>) {
  return {
    refClient: c.ref,
    typePrestation: c.prestation.join(','),
    nomSociete: c.nom,
    contactNom: c.contact,
    contactTitre: c.titre,
    telephone: c.tel,
    email: c.email,
    adresse: c.adresse,
    ville: c.ville,
    departement: c.dept,
    codePostal: c.cp,
    nbrEp6: c.ep6,
    nbrCo2: c.co2,
    nbrPoudre: c.poudre,
    nbrRia: c.ria,
    nbrAlarmeT4: c.alarmeT4,
    nbrSsi: c.ssi,
    desenfumage: c.desenfumage,
    observations: c.obs,
    moisIntervention: c.moisIntervention,
    anneeDerniere: c.anneeDerniere,
  }
}
