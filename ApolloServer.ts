import {
  ApolloServerBase,
  GraphQLOptions,
  // processFileUploads,
} from 'apollo-server-core';
import { KuzzleRequest } from 'kuzzle';
import { kuzzleGraphqlHandler, kuzzlePlaygroundHandler } from './kuzzleApollo';

export class ApolloServer extends ApolloServerBase {
  // Prepares and returns an async function that
  // is used to handle GraphQL requests.
  public async createHandler() {
    return async (request: KuzzleRequest) : Promise<string | undefined> => {
      const postHandler = kuzzleGraphqlHandler(() => {
        return this.createGraphQLServerOptions(request);
      });

      return request.context.connection.misc.verb?.toLowerCase() == 'get' ? kuzzlePlaygroundHandler(request) : postHandler(request);
    };
  }

  async createGraphQLServerOptions(
    request: KuzzleRequest
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ request });
  }

  // This integration supports file uploads.
  protected supportsUploads(): boolean {
    return false;
  }

  // This integration supports subscriptions.
  protected supportsSubscriptions(): boolean {
    return false;
  }
}
