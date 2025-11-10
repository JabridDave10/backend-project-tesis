/**
 * Enums para el módulo de Products
 * Sistema multi-tenant flexible para gestión de productos logísticos
 */

// ==================== TIPOS DE ALMACENAMIENTO ====================

/**
 * Tipo de almacenamiento requerido para el producto
 */
export enum StorageType {
  AMBIENT = 'ambient',           // Temperatura ambiente
  REFRIGERATED = 'refrigerated', // Refrigerado (0-8°C)
  FROZEN = 'frozen',             // Congelado (-18°C o menos)
  CONTROLLED = 'controlled',     // Temperatura controlada (configurable)
}

export const STORAGE_TYPE_LABELS: Record<StorageType, string> = {
  [StorageType.AMBIENT]: 'Temperatura Ambiente',
  [StorageType.REFRIGERATED]: 'Refrigerado (0-8°C)',
  [StorageType.FROZEN]: 'Congelado (-18°C)',
  [StorageType.CONTROLLED]: 'Temperatura Controlada',
};

// ==================== TIPOS DE UNIDAD DE MEDIDA ====================

/**
 * Tipo principal de unidad de medida
 */
export enum UnitTypeEnum {
  WEIGHT = 'weight',   // Peso (kg, toneladas, libras)
  VOLUME = 'volume',   // Volumen (litros, m³, galones)
  UNIT = 'unit',       // Unidades (piezas, cajas, bultos)
  PALLET = 'pallet',   // Pallets/Estibas
  BOX = 'box',         // Cajas
  CUSTOM = 'custom',   // Personalizado
}

export const UNIT_TYPE_LABELS: Record<UnitTypeEnum, string> = {
  [UnitTypeEnum.WEIGHT]: 'Peso',
  [UnitTypeEnum.VOLUME]: 'Volumen',
  [UnitTypeEnum.UNIT]: 'Unidades',
  [UnitTypeEnum.PALLET]: 'Pallets',
  [UnitTypeEnum.BOX]: 'Cajas',
  [UnitTypeEnum.CUSTOM]: 'Personalizado',
};

// ==================== TIPOS DE MOVIMIENTO DE STOCK ====================

/**
 * Tipos de movimientos de inventario
 */
export enum MovementType {
  ENTRY = 'entry',               // Entrada a bodega (compra, devolución)
  EXIT = 'exit',                 // Salida de bodega (venta, baja)
  TRANSFER = 'transfer',         // Transferencia entre bodegas
  ADJUSTMENT = 'adjustment',     // Ajuste de inventario (corrección)
  RESERVATION = 'reservation',   // Reserva para ruta
  DISPATCH = 'dispatch',         // Despacho en ruta
  RETURN = 'return',             // Devolución de ruta
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.ENTRY]: 'Entrada',
  [MovementType.EXIT]: 'Salida',
  [MovementType.TRANSFER]: 'Transferencia',
  [MovementType.ADJUSTMENT]: 'Ajuste de Inventario',
  [MovementType.RESERVATION]: 'Reserva para Ruta',
  [MovementType.DISPATCH]: 'Despacho en Ruta',
  [MovementType.RETURN]: 'Devolución',
};

// ==================== ESTADOS DE LOTE ====================

/**
 * Estados de un lote de producto
 */
export enum BatchStatus {
  AVAILABLE = 'available',       // Disponible para uso
  RESERVED = 'reserved',         // Reservado para ruta
  IN_TRANSIT = 'in_transit',     // En tránsito
  EXPIRED = 'expired',           // Vencido
  QUARANTINE = 'quarantine',     // En cuarentena (control de calidad)
  DAMAGED = 'damaged',           // Dañado
}

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  [BatchStatus.AVAILABLE]: 'Disponible',
  [BatchStatus.RESERVED]: 'Reservado',
  [BatchStatus.IN_TRANSIT]: 'En Tránsito',
  [BatchStatus.EXPIRED]: 'Vencido',
  [BatchStatus.QUARANTINE]: 'En Cuarentena',
  [BatchStatus.DAMAGED]: 'Dañado',
};

// ==================== UNIDADES DE MEDIDA COMUNES ====================

/**
 * Unidades de medida predefinidas para facilitar configuración
 */
export const COMMON_WEIGHT_UNITS = [
  'kg',
  'g',
  'mg',
  'ton',
  'lb',
  'oz',
];

export const COMMON_VOLUME_UNITS = [
  'L',
  'mL',
  'm³',
  'cm³',
  'gal',
  'fl oz',
];

export const COMMON_UNIT_NAMES = [
  'unidad',
  'pieza',
  'caja',
  'bulto',
  'paquete',
  'saco',
  'pallet',
  'estiba',
  'rollo',
  'tambor',
];
