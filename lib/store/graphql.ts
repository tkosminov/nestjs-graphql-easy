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
  registerEnumType as gqlRegisterEnumType,
  EnumOptions,
} from '@nestjs/graphql';

export interface IObjectType {
  entity_class_name: string;
  name: string;
  options?: ObjectTypeOptions;
}

export enum EDataType {
  STRING = 'string',
  PRECISION = 'precision',
}

interface IFieldOptions extends Omit<FieldOptions, 'name'> {
  filterable?: boolean;
  sortable?: boolean;
  allow_filters_from?: EDataType[];
}

export interface IField {
  entity_class_name: string;
  name: string;
  type_function: ReturnTypeFunc;
  options?: IFieldOptions;
}

export interface IQueryOrMutation {
  resolver_name: string;
  name: string;
  type_function: ReturnTypeFunc;
}

export interface IEnum {
  name: string;
  type_function: ReturnTypeFunc;
}

export interface IQuery extends IQueryOrMutation {
  options?: Omit<QueryOptions, 'name'>;
}

export interface IMutation extends IQueryOrMutation {
  options?: Omit<MutationOptions, 'name'>;
}

export interface IResolveField extends IQueryOrMutation {
  options?: Omit<ResolveFieldOptions, 'name'>;
}

/**
 * Map<entity_class_name, IObjectType>
 */
export const gql_objects: Map<string, IObjectType> = new Map();

/**
 * Map<entity_class_name, Set<IField>>
 */
export const gql_fields: Map<string, Set<IField>> = new Map();

/**
 * Map<entity_class_name, Set<IField>>
 */
export const gql_enums: Map<string, IEnum> = new Map();

/**
 * Map<resolver_class_name, Set<IQuery>>
 */
export const gql_queries: Map<string, IQuery> = new Map();

/**
 * Map<resolver_class_name, Set<IMutation>>
 */
export const gql_mutations: Map<string, IMutation> = new Map();

/**
 * Map<resolver_class_name, Set<IResolveField>>
 */
export const gql_resolve_fields: Map<string, IResolveField> = new Map();

/**
 * Map<entity_class_name, ReturnTypeFunc>
 */
export const where_input_types: Map<string, ReturnTypeFunc> = new Map();

/**
 * Map<`${field_name}_FilterInputType`, ReturnTypeFunc>
 */
export const where_field_input_types: Map<string, ReturnTypeFunc> = new Map();

/**
 * Map<entity_class_name, ReturnTypeFunc>
 */
export const order_input_types: Map<string, ReturnTypeFunc> = new Map();

/**
 * Map<`${field_name}_OrderInputType`, ReturnTypeFunc>
 */
export const order_field_input_types: Map<string, ReturnTypeFunc> = new Map();

export const decorateField = (fn: () => void, field_name: string, field_type: ReturnTypeFunc, field_options?: FieldOptions) => {
  fn.prototype[field_name] = GqlField(field_type, {
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
      entity_class_name: prototype['name'],
      name: property_key,
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
        entity_class_name: prototype['name'],
        name: prototype['name'],
        options: options,
      });
    }

    return GqlObjectType(prototype['name'], options)(prototype);
  };
}

export function Query(returnTypeFunction: ReturnTypeFunc, options?: Omit<QueryOptions, 'name'>): MethodDecorator {
  return (prototype: any, property_key: string, descriptor: PropertyDescriptor) => {
    if (!gql_queries.has(property_key)) {
      gql_queries.set(property_key, {
        resolver_name: prototype.constructor['name'],
        name: property_key,
        type_function: returnTypeFunction,
        options,
      });
    }

    return GqlQuery(returnTypeFunction, options)(prototype, property_key, descriptor);
  };
}

export function Mutation(returnTypeFunction: ReturnTypeFunc, options?: Omit<MutationOptions, 'name'>): MethodDecorator {
  return (prototype: any, property_key: string, descriptor: PropertyDescriptor) => {
    if (!gql_mutations.has(property_key)) {
      gql_mutations.set(property_key, {
        resolver_name: prototype.constructor['name'],
        name: property_key,
        type_function: returnTypeFunction,
        options,
      });
    }

    return GqlMutation(returnTypeFunction, options)(prototype, property_key, descriptor);
  };
}

export function ResolveField(returnTypeFunction: ReturnTypeFunc, options?: Omit<ResolveFieldOptions, 'name'>): MethodDecorator {
  return (prototype: any, property_key: string, descriptor: PropertyDescriptor) => {
    if (!gql_resolve_fields.has(property_key)) {
      gql_resolve_fields.set(property_key, {
        resolver_name: prototype.constructor['name'],
        name: property_key,
        type_function: returnTypeFunction,
        options,
      });
    }

    return GqlResolveField(returnTypeFunction, options)(prototype, property_key, descriptor);
  };
}

export function registerEnumType<T extends object = any>(enumRef: T, options: EnumOptions<T>) {
  if (!gql_enums.has(options.name)) {
    gql_enums.set(options.name, {
      name: options.name,
      type_function: () => enumRef,
    });
  }

  return gqlRegisterEnumType(enumRef, options);
}
