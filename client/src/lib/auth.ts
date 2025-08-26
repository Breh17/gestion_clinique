export const ROLES = {
  SUPERVISEUR: "superviseur",
  MEDECIN: "medecin",
  SECRETAIRE: "secretaire",
  PHARMACIEN: "pharmacien",
  CAISSIER: "caissier",
  COMPTABLE: "comptable",
  INTERVENANT: "intervenant",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS = {
  [ROLES.SUPERVISEUR]: "Superviseur",
  [ROLES.MEDECIN]: "Médecin",
  [ROLES.SECRETAIRE]: "Secrétaire",
  [ROLES.PHARMACIEN]: "Pharmacien",
  [ROLES.CAISSIER]: "Caissier",
  [ROLES.COMPTABLE]: "Comptable",
  [ROLES.INTERVENANT]: "Intervenant Externe",
};

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole) || userRole === ROLES.SUPERVISEUR;
}

export function formatUserName(user: { firstName?: string; lastName?: string; username: string }): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username;
}
