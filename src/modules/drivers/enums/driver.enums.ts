/**
 * Categorías de Licencia de Conducción en Colombia
 * Según normativa vigente del Ministerio de Transporte
 */
export enum LicenseCategory {
  /** A1 - Motocicletas hasta 125cc */
  A1 = 'A1',

  /** A2 - Motocicletas, motociclos y mototriciclos con cilindrada superior a 125cc */
  A2 = 'A2',

  /** B1 - Automóviles, motocarros, cuatrimotos, camionetas, microbuses y vehículos de servicio particular */
  B1 = 'B1',

  /** B2 - Camiones rígidos, busetas y buses de servicio particular */
  B2 = 'B2',

  /** B3 - Vehículos articulados de servicio particular */
  B3 = 'B3',

  /** C1 - Automóviles, motocarros, camionetas, microbuses de servicio público */
  C1 = 'C1',

  /** C2 - Camiones rígidos, busetas y buses de servicio público */
  C2 = 'C2',

  /** C3 - Vehículos articulados de servicio público */
  C3 = 'C3',
}

/**
 * Grupos Sanguíneos
 */
export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

/**
 * Estado de la Licencia según RUNT
 */
export enum LicenseStatus {
  /** Licencia activa y válida */
  ACTIVE = 'activa',

  /** Licencia suspendida por infracciones */
  SUSPENDED = 'suspendida',

  /** Licencia cancelada */
  CANCELLED = 'cancelada',
}

/**
 * Tipos de Contrato Laboral
 */
export enum ContractType {
  /** Contrato a término indefinido */
  INDEFINITE = 'indefinido',

  /** Contrato a término fijo */
  FIXED_TERM = 'fijo',

  /** Contrato por obra o labor */
  LABOR = 'obra_labor',

  /** Prestación de servicios */
  SERVICES = 'servicios',
}

/**
 * Tipos de Certificación para Conductores
 */
export enum CertificationType {
  /** Curso de conducción defensiva */
  DEFENSIVE_DRIVING = 'conduccion_defensiva',

  /** Manejo de carga peligrosa */
  DANGEROUS_CARGO = 'carga_peligrosa',

  /** Primeros auxilios */
  FIRST_AID = 'primeros_auxilios',

  /** Mecánica básica */
  BASIC_MECHANICS = 'mecanica_basica',

  /** Manejo de carga refrigerada */
  REFRIGERATED_CARGO = 'carga_refrigerada',

  /** Otro */
  OTHER = 'otro',
}

/**
 * Tipos de Vehículo para Experiencia Laboral
 */
export enum VehicleType {
  /** Camión sencillo */
  SIMPLE_TRUCK = 'sencillo',

  /** Camión dobletroque */
  DOUBLE_TRUCK = 'dobletroque',

  /** Tractocamión */
  TRACTOR_TRAILER = 'tractocamion',

  /** Turbo/Patineta */
  TURBO = 'turbo',

  /** Bus/Buseta */
  BUS = 'bus',

  /** Minibus */
  MINIBUS = 'minibus',

  /** Camioneta */
  VAN = 'camioneta',

  /** Otro */
  OTHER = 'otro',
}

/**
 * Tipos de Carga para Experiencia Laboral
 */
export enum CargoType {
  /** Carga seca general */
  DRY_CARGO = 'seca',

  /** Carga refrigerada */
  REFRIGERATED = 'refrigerada',

  /** Carga peligrosa */
  DANGEROUS = 'peligrosa',

  /** Carga líquida */
  LIQUID = 'liquida',

  /** Contenedores */
  CONTAINERS = 'contenedores',

  /** Carga sobredimensionada */
  OVERSIZED = 'sobredimensionada',

  /** Otro */
  OTHER = 'otro',
}
