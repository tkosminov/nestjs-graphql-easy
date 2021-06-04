import { GraphQLModule } from '@nestjs/graphql';

import { GraphqlOptions } from './graphql.options';

export default GraphQLModule.forRootAsync({
  imports: [],
  useClass: GraphqlOptions,
  inject: [],
});
