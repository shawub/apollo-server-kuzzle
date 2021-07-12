import { KuzzleRequest } from 'kuzzle';
import {
  runHttpQuery,
  GraphQLOptions,
  convertNodeHttpToRequest,
  HttpQueryRequest,
  PlaygroundRenderPageOptions,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-types';
import { IncomingMessage } from 'http';
import { renderPlaygroundPage } from '@apollographql/graphql-playground-html/dist/render-playground-page';

export type GraphqlHandler = (
  request: KuzzleRequest
) => Promise<string | undefined>;

// interface takes a kuzzle request and
// returns graphql options or function to resolve them
export interface KuzzleGraphQLOptionsFunction {
  (request?: KuzzleRequest): ValueOrPromise<GraphQLOptions>;
}

export function kuzzlePlaygroundHandler(
  request: KuzzleRequest,
  playgroundOptions: PlaygroundRenderPageOptions = {}
) {
  const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
    endpoint: request.context.connection.misc.path,
    ...playgroundOptions,
  };

  const playground = renderPlaygroundPage(playgroundRenderPageOptions);

  request.response.result = playground;

  request.response.configure({
    format: 'raw',
    headers: {
      'content-type': 'text/html; charset=UTF-8',
    },
  });

  return playground;
}

export function kuzzleGraphqlHandler(
  options: GraphQLOptions | KuzzleGraphQLOptionsFunction
): GraphqlHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }
  const graphqlHandler = async (request: KuzzleRequest) => {
    // console.log(request);
    // TODO TODO TODO
    // assumes a POST
    // handle gets and ws protocol ?
    const query = request.input.body;
    const incomingMessage = {
      headers: request.input.headers,
      url: '/graphql',
    };

    try {
      const { graphqlResponse } = await runHttpQuery([request], {
        method: 'POST',
        options,
        query,
        request: convertNodeHttpToRequest(incomingMessage as IncomingMessage),
      } as HttpQueryRequest);
      // set raw to remove kuzzle headers, i.e. when the request is not via kuzzle sdk
      // this is to support graphql clients consumption
      const format = request.input?.volatile?.sdkInstanceId
        ? 'standard'
        : 'raw';
      request.response.result = graphqlResponse;
      request.response.configure({
        // headers: ...responseInit.headers,
        format,
      });
      return graphqlResponse;
      // console.log(request.response.result);
    } catch (error) {
      request.setError(error);
      return undefined;
    }
  };

  return graphqlHandler;
}
