export interface Client {
  id: number
  ref: string
  nom: string
  contact: string
  titre: string
  tel: string
  email: string
  adresse: string
  ville: string
  dept: string
  cp: string
  prestation: string[]  // ["EXTINCTION", "SSI"]
  moisIntervention: number
  anneeDerniere: number
  ep6: number
  co2: number
  poudre: number
  ria: number
  alarmeT4: number
  ssi: number
  desenfumage: number
  obs: string
}

export interface Visit {
  id: number
  clientId: number
  dateVisite: string
  technicien: string
  travaux: TravauxItem[]
  notes: string
  createdAt: string
}

export interface TravauxItem {
  id: string
  label: string
  qty?: number
  subType?: string
  unit: string
  withQty: boolean
  withType: boolean
}

export interface Technicien {
  id: string
  nom: string
  initiales: string
  tel: string
  email: string
  secteur: string
}

export interface Prestation {
  id: string
  code: string
  label: string
  color: string
}

export interface TravauxType {
  id: string
  label: string
  unit: string
  withQty: boolean
  withType: boolean
}

export interface Equipement {
  id: string
  code: string
  label: string
  categorie: string
}

export interface Secteur {
  id: string
  code: string
  nom: string
}

export interface Store {
  techniciens: Technicien[]
  prestations: Prestation[]
  travaux: TravauxType[]
  equipements: Equipement[]
  secteurs: Secteur[]
}

export type StatusCode = 'ok' | 'soon' | 'due' | 'overdue'

export interface ClientStatus {
  code: StatusCode
  label: string
  days: number
}
