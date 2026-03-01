import { Injectable } from '@nestjs/common';

/**
 * Servicio de validacion de compatibilidad licencia-vehiculo
 * Basado en normativa colombiana: Ley 769/2002, Resolucion 1500/2005
 *
 * Mapeo normativo:
 *   moto              → A1, A2
 *   carro             → B1, B2, B3, C1, C2, C3
 *   furgoneta         → B1, B2, B3, C1, C2, C3
 *   camion            → B2, B3, C2, C3
 *   camion_articulado → B3, C3
 *
 * Jerarquia (licencia superior cubre inferior en su linea):
 *   Linea A: A2 > A1
 *   Linea B: B3 > B2 > B1
 *   Linea C: C3 > C2 > C1 (C1 cubre B1)
 */
@Injectable()
export class LicenseVehicleValidatorService {
  private readonly vehicleLicenseMap: Record<string, string[]> = {
    moto: ['A1', 'A2'],
    carro: ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'],
    furgoneta: ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'],
    camion: ['B2', 'B3', 'C2', 'C3'],
    camion_articulado: ['B3', 'C3'],
  };

  private readonly licenseHierarchy: Record<string, string[]> = {
    A2: ['A1'],
    B2: ['B1'],
    B3: ['B1', 'B2'],
    C1: ['B1'],
    C2: ['B1', 'C1'],
    C3: ['B1', 'B3', 'C1', 'C2'],
  };

  private readonly vehicleTypeLabels: Record<string, string> = {
    moto: 'Moto',
    carro: 'Carro',
    furgoneta: 'Furgoneta',
    camion: 'Camion',
    camion_articulado: 'Camion Articulado',
  };

  /**
   * Expande las categorias de licencia con las que cubre por jerarquia
   */
  private expandLicenses(licenseCategories: string[]): string[] {
    const expanded = new Set<string>();
    for (const license of licenseCategories) {
      const upper = license.toUpperCase();
      expanded.add(upper);
      const covers = this.licenseHierarchy[upper];
      if (covers) {
        for (const covered of covers) {
          expanded.add(covered);
        }
      }
    }
    return Array.from(expanded);
  }

  /**
   * Valida si las categorias de licencia del conductor son compatibles con el tipo de vehiculo
   */
  validateCompatibility(
    licenseCategories: string[],
    vehicleType: string,
  ): { valid: boolean; message?: string } {
    const requiredLicenses = this.vehicleLicenseMap[vehicleType];
    if (!requiredLicenses) {
      return {
        valid: false,
        message: `Tipo de vehiculo "${vehicleType}" no reconocido`,
      };
    }

    if (!licenseCategories || licenseCategories.length === 0) {
      return {
        valid: false,
        message: `El conductor no tiene categorias de licencia registradas`,
      };
    }

    const expandedLicenses = this.expandLicenses(licenseCategories);
    const hasValidLicense = requiredLicenses.some((req) =>
      expandedLicenses.includes(req),
    );

    if (!hasValidLicense) {
      const typeLabel =
        this.vehicleTypeLabels[vehicleType] || vehicleType;
      return {
        valid: false,
        message: `Licencia incompatible: un vehiculo tipo "${typeLabel}" requiere licencia ${requiredLicenses.join(' o ')}. El conductor tiene: ${licenseCategories.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Retorna los tipos de vehiculo compatibles con las licencias dadas
   */
  getCompatibleVehicleTypes(licenseCategories: string[]): string[] {
    if (!licenseCategories || licenseCategories.length === 0) return [];

    const expandedLicenses = this.expandLicenses(licenseCategories);
    const compatibleTypes: string[] = [];

    for (const [vehicleType, requiredLicenses] of Object.entries(
      this.vehicleLicenseMap,
    )) {
      const isCompatible = requiredLicenses.some((req) =>
        expandedLicenses.includes(req),
      );
      if (isCompatible) {
        compatibleTypes.push(vehicleType);
      }
    }

    return compatibleTypes;
  }

  /**
   * Retorna las licencias requeridas para un tipo de vehiculo
   */
  getRequiredLicenses(vehicleType: string): string[] {
    return this.vehicleLicenseMap[vehicleType] || [];
  }
}
