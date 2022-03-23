import {
  ReturnTypeFunc,
  Field as GqlField,
  FieldOptions,
  ObjectType as GqlObjectType,
  ObjectTypeOptions,
  Query as GqlQuery,
  QueryOptions,
  ResolveField as GqlResolveField,
  ResolveFieldOptions,
  Mutation as GqlMutation,
  MutationOptions,
  Resolver as GqlResolver,
  ResolverOptions,
} from '@nestjs/graphql';
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
  name: string;
  name_origin: string;
  type_function: ReturnTypeFunc;
  options?: IFieldOptions;
}

export interface IQueryOrMutation {
  resolver_name: string;
  name: string;
  name_origin: string;
  type_function: ReturnTypeFunc;
}

export interface IQuery extends IQueryOrMutation {
  options?: QueryOptions;
}

export interface IMutation extends IQueryOrMutation {
  options?: MutationOptions;
}

export interface IResolveField extends IQueryOrMutation {
  options?: ResolveFieldOptions;
}

export const gql_objects: Map<string, IObjectType> = new Map();
export const gql_fields: Map<string, Set<IField>> = new Map();
export const gql_queries: Map<string, IQuery> = new Map();
export const gql_mutations: Map<string, IMutation> = new Map();
export const gql_resolve_fields: Map<string, IResolveField> = new Map();

export const table_fks: Map<string, Set<string>> = new Map();
export const table_columns: Map<string, Set<string>> = new Map();

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

export function Query(returnTypeFunction: ReturnTypeFunc, options?: QueryOptions): MethodDecorator {
  return (prototype: any, property_key: string, descriptor: PropertyDescriptor) => {
    const name = options?.name || property_key;

    if (!gql_queries.has(name)) {
      gql_queries.set(name, {
        resolver_name: prototype.constructor['name'],
        name,
        name_origin: property_key,
        type_function: returnTypeFunction,
        options,
      });
    }

    return GqlQuery(returnTypeFunction, options)(prototype, property_key, descriptor);
  };
}

export function Mutation(returnTypeFunction: ReturnTypeFunc, options?: MutationOptions): MethodDecorator {
  return (prototype: any, property_key: string, descriptor: PropertyDescriptor) => {
    const name = options?.name || property_key;

    if (!gql_mutations.has(name)) {
      gql_mutations.set(name, {
        resolver_name: prototype.constructor['name'],
        name,
        name_origin: property_key,
        type_function: returnTypeFunction,
        options,
      });
    }

    return GqlMutation(returnTypeFunction, options)(prototype, property_key, descriptor);
  };
}

export function ResolveField(returnTypeFunction: ReturnTypeFunc, options?: ResolveFieldOptions): MethodDecorator {
  return (prototype: any, property_key: string, descriptor: PropertyDescriptor) => {
    const name = options?.name || property_key;

    if (!gql_resolve_fields.has(name)) {
      gql_resolve_fields.set(name, {
        resolver_name: prototype.constructor['name'],
        name,
        name_origin: property_key,
        type_function: returnTypeFunction,
        options,
      });
    }

    return GqlResolveField(returnTypeFunction, options)(prototype, property_key, descriptor);
  };
}

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
      name: options?.name || property_key,
      name_origin: property_key,
      type_function: returnTypeFunction,
      options,
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

export function Polymorphic() {
  return (prototype: any, property_key: string) => {
    if (!table_fks.has(prototype['constructor']['name'])) {
      table_fks.set(prototype['constructor']['name'], new Set([]));
    }

    table_fks.get(prototype['constructor']['name']).add(property_key);
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

export function getTableColumns(table_name: string) {
  if (table_columns.has(table_name)) {
    return table_columns.get(table_name);
  }

  const typeormArgs = getMetadataArgsStorage();

  typeormArgs.columns.forEach((col) => {
    if (!table_columns.has(col.target['name'])) {
      table_columns.set(col.target['name'], new Set([]));
    }

    const columns = table_columns.get(col.target['name']);

    columns.add(col.propertyName);
  });

  return table_columns.get(table_name) || new Set();
}
