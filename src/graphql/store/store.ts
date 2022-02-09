import { Field, FieldOptions, ReturnTypeFunc } from "@nestjs/graphql";

import { getMetadataArgsStorage } from "typeorm";
import { ColumnMetadataArgs } from "typeorm/metadata-args/ColumnMetadataArgs";
import { JoinColumnMetadataArgs } from "typeorm/metadata-args/JoinColumnMetadataArgs";

export const where_input_types: Map<string, ReturnTypeFunc> = new Map();
export const where_field_input_types: Map<string, ReturnTypeFunc> = new Map();

export const order_input_types: Map<string, ReturnTypeFunc> = new Map();
export const order_field_input_types: Map<string, ReturnTypeFunc> = new Map();

export const fk_columns: Map<string, Set<JoinColumnMetadataArgs>> = new Map();
export const table_columns: Map<string, Set<ColumnMetadataArgs>> = new Map();

export const decorateField = (fn: () => void, field_name: string, field_type: ReturnTypeFunc, field_options?: FieldOptions) => {
  fn.prototype[field_name] = Field(field_type, {
    ...field_options,
    nullable: true,
  })(fn.prototype, field_name);
};

export const parseColumns = () => {
  const typeorm_metadata = getMetadataArgsStorage();

  if (!fk_columns.size) {
    typeorm_metadata.joinColumns.forEach((col) => {
      const table = col.target['name'];

      if (!fk_columns.has(table)) {
        fk_columns.set(table, new Set([]));
      }

      fk_columns.get(table).add(col);
    });
  }

  if (!table_columns.size) {
    typeorm_metadata.columns.forEach((col) => {
      const table = col.target['name'];

      if (!table_columns.has(table)) {
        table_columns.set(table, new Set([]));
      }

      if (!(col.options?.type && typeof col.options.type === 'string' && ['json', 'jsonb'].includes(col.options.type))) {
        table_columns.get(table).add(col);
      }
    })
  }
}
