import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { getMetadataArgsStorage } from 'typeorm';
import { plural, singular } from 'pluralize';

import { Loader } from '../loaders/decorator.loader';

export const GenerateQueryResolvers = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  classType: Function,
): any => {
  return (t: any) => {
    const entityMeta = getMetadataArgsStorage();
    const entity = classType();

    const relations = entityMeta.relations.filter(
      (x) => typeof x.target === 'function' && x.target.name === entity.name,
    );

    const extend = (base: any) => {
      @Resolver(() => entity)
      class Extended extends base {
        constructor() {
          super();

          relations.forEach((r) => {
            if (Extended.prototype[r.propertyName]) {
              return;
            } else if (r.relationType === 'many-to-one') {
              const target = Extended.prototype;
              const key = r.propertyName;
              let desc: any = {
                value: async function (relationEntity, loader) {
                  return await loader[key].load(relationEntity[key + '_id']);
                },
              };

              Reflect.metadata('design:returntype', Promise)(target, key);
              Reflect.metadata('design:paramtypes', [entity, Object, Object])(
                target,
                key,
              );
              Reflect.metadata('design:type', Function)(target, key);
              Parent()(target, key, 0);
              desc = ResolveField(() => entity)(target, key, desc) || desc;

              Object.defineProperty(target, key, desc);
            } else if (r.relationType === 'one-to-many') {
              const target = Extended.prototype;
              const key = r.propertyName;
              let desc: any = {
                value: async function (relationEntity, loader) {
                  return await loader[key].load(relationEntity['id']);
                },
              };

              Reflect.metadata('design:returntype', Promise)(target, key);
              Reflect.metadata('design:paramtypes', [entity, Object, Object])(
                target,
                key,
              );
              Reflect.metadata('design:type', Function)(target, key);
              Loader([key, `${entity.name}_id`.toLowerCase()])(target, key, 1);
              Parent()(target, key, 0);
              desc =
                ResolveField(() => entity, { name: key })(target, key, desc) ||
                desc;

              Object.defineProperty(target, key, desc);
            }
          });

          if (!Extended.prototype[plural(entity.name).toLowerCase()]) {
            const target = Extended.prototype;
            const key = plural(entity.name).toLowerCase();
            let desc: any = {
              value: async function (_relationEntity, loader) {
                return loader;
              },
            };

            Reflect.metadata('design:returntype', Promise)(target, key);
            Reflect.metadata('design:paramtypes', [Object, Object])(
              target,
              key,
            );
            Reflect.metadata('design:type', Function)(target, key);
            Loader(entity)(target, key, 1);
            desc =
              Query(() => [entity], { name: key })(target, key, desc) || desc;

            Object.defineProperty(target, key, desc);
          }

          if (!Extended.prototype[singular(entity.name).toLowerCase()]) {
            // loadMany for root queries
            const target = Extended.prototype;
            const key = singular(entity.name).toLowerCase();
            let desc: any = {
              value: async function (_relationEntity, loader) {
                return loader;
              },
            };

            Reflect.metadata('design:returntype', Promise)(target, key);
            Reflect.metadata('design:paramtypes', [Object, Object])(
              target,
              key,
            );
            Reflect.metadata('design:type', Function)(target, key);
            Loader(entity)(target, key, 2);
            desc =
              Query(() => entity, { name: key })(target, key, desc) || desc;

            Object.defineProperty(target, key, desc);
          }
        }
      }

      Object.defineProperty(Extended, 'name', {
        value: entity.name,
      });

      return Extended;
    };

    return extend(t as any);
  };
};
