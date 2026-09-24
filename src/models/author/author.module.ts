import { Module } from '@nestjs/common';

import { GraphQLPubSubModule } from '../../graphql/graphql.pubsub.js';

import { AuthorResolver } from './author.resolver.js';

@Module({
  imports: [GraphQLPubSubModule],
  providers: [AuthorResolver],
})
export class AuthorModule {}
