import fastify, { FastifyInstance } from "fastify";
import getPort, { portNumbers } from "get-port";
import { GraphQLClient } from "graphql-request";

type TestContext = {
  client: GraphQLClient;
};
export function createTestContext(): TestContext {
  let ctx = {} as TestContext;
  const graphqlCtx = graphqlTestContext();
  beforeEach(async () => {
    const client = await graphqlCtx.before();
    Object.assign(ctx, {
      client,
    });
  });
  afterEach(async () => {
    await graphqlCtx.after();
  });
  return ctx;
}
function graphqlTestContext() {
  const server = fastify();
  return {
    async before() {
      const port = await getPort({ port: portNumbers(4000, 6000) });
      server.listen({ port });
      return new GraphQLClient(`http://localhost:${port}`);
    },
    async after() {
      server.close();
    },
  };
}
