# Apollo Kuzzle Middleware Integration

Apollo Server is designed to run as standalone, or deployed in any supporting node.js [framework](https://www.apollographql.com/docs/apollo-server/integrations/middleware/).

This package provides an integration for Kuzzle [middleware](https://kuzzle.io/products/by-product/middleware/).

## Kuzzle

To add a graphql endpoint to kuzzle, implement a [plugin](https://docs.kuzzle.io/core/2/guides/develop-on-kuzzle/external-plugins/)

```ts
import { ApolloServer } from 'apollo-server-kuzzle';
import { JSONObject, PluginContext, Plugin, KuzzleRequest } from 'kuzzle';

export class MyPlugin extends Plugin {
  constructor() {
    super({ kuzzleVersion: '>=2.8.0 <3' });
  }

  async init(config: JSONObject, context: PluginContext): Promise<void> {
    this.config = config;
    this.context = context;
    // define types and resolvers
    const typeDefs = gql`
      type Query {
        hello: String
      }
    `;

    const resolvers = {
      Query: {
        hello: () => 'Hello world!',
      },
    };
    // instantiate `server`
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    // create a request handler
    const handler = await apolloServer.createHandler();

    // install myApi controller
    this.api = {
      myApi: {
        actions: {
          graphql: {
            handler,
            http: [
              {
                verb: 'post',
                path: '/gapqhl',
              },
            ],
          },
        },
      },
    };
  }
}
```

Then install the plugin in the kuzzle app.

```ts
app.plugin.use(new MyPlugin());
```
