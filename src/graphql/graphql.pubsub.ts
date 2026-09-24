import { Module } from '@nestjs/common';

import { PubSub } from 'graphql-subscriptions';

@Module({
  providers: [
    {
      provide: PubSub,
      useFactory: () => new PubSub(),
    },
  ],
  exports: [PubSub],
})
export class GraphQLPubSubModule {}
