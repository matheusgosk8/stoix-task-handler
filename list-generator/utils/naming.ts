import { kebabCase, pascalCase, camelCase } from 'change-case'

/**
 * Utilitários para conversão de nomenclatura
 */
export class NamingUtils {
  /**
   * Converte para kebab-case: 'book-products'
   */
  static toKebab(name: string): string {
    return kebabCase(name)
  }

  /**
   * Converte para PascalCase: 'BookProducts'
   */
  static toPascal(name: string): string {
    return pascalCase(name)
  }

  /**
   * Converte para camelCase: 'bookProducts'
   */
  static toCamel(name: string): string {
    return camelCase(name)
  }

  /**
   * Gera todas as variações de nomenclatura a partir de um nome base
   */
  static generateVariations(baseName: string) {
    const kebab = this.toKebab(baseName)
    const pascal = this.toPascal(baseName)
    const camel = this.toCamel(baseName)

    return {
      kebab, // 'book-products'
      pascal, // 'BookProducts'
      camel, // 'bookProducts'

      // Útil para nomes de arquivos
      fileName: kebab,

      // Útil para paths
      path: kebab,

      // Útil para tipos TypeScript
      typeName: pascal,

      // Útil para funções
      functionName: camel,

      // Útil para constantes
      constant: kebab.toUpperCase().replace(/-/g, '_') // 'BOOK_PRODUCTS'
    }
  }
}

/**
 * Helper function para uso direto
 */
export function getNamingVariations(baseName: string) {
  return NamingUtils.generateVariations(baseName)
}
