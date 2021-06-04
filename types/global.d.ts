interface ICorsSettings {
  readonly allowedOrigins: string[];
  readonly allowedUrls: string[];
  readonly allowedMethods: string[];
  readonly allowedCredentials: boolean;
  readonly allowedHeaders: string[];
}

interface IAppSettings {
  readonly port: number;
  readonly wssPort: number;
  readonly wssUseRedis: boolean;
  readonly wssPingInterval: number;
  readonly wssPingTimeout: number;
  readonly bodyLimit: string;
  readonly bodyParameterLimit: number;
}

interface IGraphqlSettings {
  readonly playground: boolean;
  readonly debug: boolean;
  readonly introspection: boolean;
  readonly installSubscriptionHandlers: boolean;
}
