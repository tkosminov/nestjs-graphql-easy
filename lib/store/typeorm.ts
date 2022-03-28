import {
  getMetadataArgsStorage,
  Entity as OrmEntity,
  EntityOptions,
  CreateDateColumn as OrmCreateDateColumn,
  UpdateDateColumn as OrmUpdateDateColumn,
  Column as OrmColumn,
  ColumnOptions,
  PrimaryColumn as OrmPrimaryColumn,
  PrimaryColumnOptions,
  PrimaryGeneratedColumn as OrmPrimaryGeneratedColumn,
} from 'typeorm';
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';
import { ColumnEmbeddedOptions } from 'typeorm/decorator/options/ColumnEmbeddedOptions';
import { ColumnEnumOptions } from 'typeorm/decorator/options/ColumnEnumOptions';
import { ColumnHstoreOptions } from 'typeorm/decorator/options/ColumnHstoreOptions';
import { ColumnNumericOptions } from 'typeorm/decorator/options/ColumnNumericOptions';
import { ColumnWithLengthOptions } from 'typeorm/decorator/options/ColumnWithLengthOptions';
import { ColumnWithWidthOptions } from 'typeorm/decorator/options/ColumnWithWidthOptions';
import { PrimaryGeneratedColumnIdentityOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnIdentityOptions';
import { PrimaryGeneratedColumnNumericOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnNumericOptions';
import { PrimaryGeneratedColumnUUIDOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnUUIDOptions';
import { SpatialColumnOptions } from 'typeorm/decorator/options/SpatialColumnOptions';
import {
  ColumnType,
  SimpleColumnType,
  SpatialColumnType,
  WithLengthColumnType,
  WithPrecisionColumnType,
  WithWidthColumnType,
} from 'typeorm/driver/types/ColumnTypes';

/**
 * Map<entity_class_name, Set<entity_column_name>>
 */
export const table_columns: Map<string, Set<string>> = new Map();

/**
 * Map<entity_class_name, Set<entity_column_name>>
 */
export const table_foreign_keys: Map<string, Set<string>> = new Map();

export function getTableColumns(entity_class_name: string) {
  if (table_columns.has(entity_class_name)) {
    return table_columns.get(entity_class_name);
  }

  const typeormArgs = getMetadataArgsStorage();

  typeormArgs.columns.forEach((col) => {
    if (!table_columns.has(col.target['name'])) {
      table_columns.set(col.target['name'], new Set([]));
    }

    const columns = table_columns.get(col.target['name']);

    columns.add(col.propertyName);
  });

  return table_columns.get(entity_class_name) || new Set();
}

export function getTableForeignKeys(entity_class_name: string) {
  if (table_foreign_keys.has(entity_class_name)) {
    return table_foreign_keys.get(entity_class_name);
  }

  const typeormArgs = getMetadataArgsStorage();

  typeormArgs.joinColumns.forEach((col) => {
    if (!table_foreign_keys.has(col.target['name'])) {
      table_foreign_keys.set(col.target['name'], new Set([]));
    }

    const fks = table_foreign_keys.get(col.target['name']);

    fks.add(col.name);
  });

  return table_foreign_keys.get(entity_class_name) || new Set();
}

export function PolymorphicColumn(): PropertyDecorator {
  return (prototype: any, property_key: string) => {
    if (!table_foreign_keys.has(prototype['constructor']['name'])) {
      table_foreign_keys.set(prototype['constructor']['name'], new Set([]));
    }

    table_foreign_keys.get(prototype['constructor']['name']).add(property_key);
  };
}

export function Entity(options?: Omit<EntityOptions, 'name'>): ClassDecorator {
  return (prototype: any) => {
    return OrmEntity(options)(prototype);
  };
}

export function CreateDateColumn(options?: Omit<ColumnOptions, 'name'>): PropertyDecorator {
  return (prototype: any, property_key: string) => {
    return OrmCreateDateColumn(options)(prototype, property_key);
  };
}

export function UpdateDateColumn(options?: Omit<ColumnOptions, 'name'>): PropertyDecorator {
  return (prototype: any, property_key: string) => {
    return OrmUpdateDateColumn(options)(prototype, property_key);
  };
}

export function PrimaryColumn(options?: Omit<PrimaryColumnOptions, 'name'>): PropertyDecorator;
export function PrimaryColumn(type?: ColumnType, options?: Omit<PrimaryColumnOptions, 'name'>): PropertyDecorator;
export function PrimaryColumn(type_or_options?: any, options?: any): PropertyDecorator {
  return (prototype: any, property_key: string) => {
    return OrmPrimaryColumn(type_or_options, options)(prototype, property_key);
  };
}

export function PrimaryGeneratedColumn(): PropertyDecorator;
export function PrimaryGeneratedColumn(options: Omit<PrimaryGeneratedColumnNumericOptions, 'name'>): PropertyDecorator;
export function PrimaryGeneratedColumn(
  strategy: 'increment',
  options?: Omit<PrimaryGeneratedColumnNumericOptions, 'name'>
): PropertyDecorator;
export function PrimaryGeneratedColumn(strategy: 'uuid', options?: Omit<PrimaryGeneratedColumnUUIDOptions, 'name'>): PropertyDecorator;
export function PrimaryGeneratedColumn(strategy: 'rowid', options?: Omit<PrimaryGeneratedColumnUUIDOptions, 'name'>): PropertyDecorator;
export function PrimaryGeneratedColumn(
  strategy: 'identity',
  options?: Omit<PrimaryGeneratedColumnIdentityOptions, 'name'>
): PropertyDecorator;
export function PrimaryGeneratedColumn(strategy_or_options?: any, options?: any): PropertyDecorator {
  return (prototype: any, property_key: string) => {
    return OrmPrimaryGeneratedColumn(strategy_or_options, options)(prototype, property_key);
  };
}

export function Column(): PropertyDecorator;
export function Column(options?: Omit<ColumnOptions, 'name'>): PropertyDecorator;
export function Column(type?: SimpleColumnType, options?: Omit<ColumnCommonOptions, 'name'>): PropertyDecorator;
export function Column(type?: SpatialColumnType, options?: Omit<ColumnCommonOptions & SpatialColumnOptions, 'name'>): PropertyDecorator;
export function Column(
  type?: WithLengthColumnType,
  options?: Omit<ColumnCommonOptions & ColumnWithLengthOptions, 'name'>
): PropertyDecorator;
export function Column(type?: WithWidthColumnType, options?: Omit<ColumnCommonOptions & ColumnWithWidthOptions, 'name'>): PropertyDecorator;
export function Column(
  type?: WithPrecisionColumnType,
  options?: Omit<ColumnCommonOptions & ColumnNumericOptions, 'name'>
): PropertyDecorator;
export function Column(type?: 'enum', options?: Omit<ColumnCommonOptions & ColumnEnumOptions, 'name'>): PropertyDecorator;
export function Column(type?: 'simple-enum', options?: Omit<ColumnCommonOptions & ColumnEnumOptions, 'name'>): PropertyDecorator;
export function Column(type?: 'set', options?: Omit<ColumnCommonOptions & ColumnEnumOptions, 'name'>): PropertyDecorator;
export function Column(type?: 'hstore', options?: Omit<ColumnCommonOptions & ColumnHstoreOptions, 'name'>): PropertyDecorator;
export function Column(type?: (type?: any) => void, options?: Omit<ColumnEmbeddedOptions, 'name'>): PropertyDecorator;
export function Column(type_or_options?: any, options?: any): PropertyDecorator {
  return (prototype: any, property_key: string) => {
    return OrmColumn(type_or_options, options)(prototype, property_key);
  };
}
