import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';

import { GraphqlOptions } from './graphql.options';

export default GraphQLModule.forRootAsync({
  imports: [],
  useClass: GraphqlOptions,
  inject: [],
  driver: ApolloDriver,
});
