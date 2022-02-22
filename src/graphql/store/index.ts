import { Field as GqlField, FieldOptions, ReturnTypeFunc, ObjectType as GqlObjectType, ObjectTypeOptions } from '@nestjs/graphql';
import { getMetadataArgsStorage } from 'typeorm';

export interface IObjectType {
  relation_name: string;
  object_name: string;
  object_options?: ObjectTypeOptions;
}

interface IFieldOptions extends FieldOptions {
  filterable?: boolean;
  sortable?: boolean;
}

export interface IField {
  relation_name: string;
  field_name: string;
  field_type_function: ReturnTypeFunc;
  field_options?: IFieldOptions;
}

export const gql_objects: Map<string, IObjectType> = new Map();
export const gql_fields: Map<string, Set<IField>> = new Map();

export const table_fks: Map<string, Set<string>> = new Map();

export const where_input_types: Map<string, ReturnTypeFunc> = new Map();
export const where_field_input_types: Map<string, ReturnTypeFunc> = new Map();

export const order_input_types: Map<string, ReturnTypeFunc> = new Map();
export const order_field_input_types: Map<string, ReturnTypeFunc> = new Map();

export const decorateField = (fn: () => void, field_name: string, field_type: ReturnTypeFunc, field_options?: FieldOptions) => {
  fn.prototype[field_name] = Field(field_type, {
    nullable: true,
    ...field_options,
  })(fn.prototype, field_name);
};

/**
 * Only for entity columns
 * For other use original decorator
 */
export function Field(returnTypeFunction: ReturnTypeFunc, options?: IFieldOptions): PropertyDecorator {
  return (prototype: any, property_key: string) => {
    if (!gql_fields.has(prototype['constructor']['name'])) {
      gql_fields.set(prototype['constructor']['name'], new Set([]));
    }

    const fields = gql_fields.get(prototype['constructor']['name']);

    fields.add({
      relation_name: prototype['name'],
      field_name: property_key,
      field_type_function: returnTypeFunction,
      field_options: options,
    });

    return GqlField(returnTypeFunction, options)(prototype, property_key);
  };
}

/**
 * Only for entity.
 * For other use original decorator
 */
export function ObjectType(options?: ObjectTypeOptions): ClassDecorator {
  return (prototype: any) => {
    if (!gql_objects.has(prototype['name'])) {
      gql_objects.set(prototype['name'], {
        relation_name: prototype['name'],
        object_name: prototype['name'],
        object_options: options,
      });
    }

    return GqlObjectType(prototype['name'], options)(prototype);
  };
}

export function getTableFks(table_name: string) {
  if (table_fks.has(table_name)) {
    return table_fks.get(table_name);
  }

  const typeormArgs = getMetadataArgsStorage();

  typeormArgs.joinColumns.forEach((col) => {
    if (!table_fks.has(col.target['name'])) {
      table_fks.set(col.target['name'], new Set([]));
    }

    const fks = table_fks.get(col.target['name']);

    fks.add(col.name);
  });

  return table_fks.get(table_name) || new Set();
}
