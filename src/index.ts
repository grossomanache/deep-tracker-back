import "graphql-import-node";
import { execute, parse } from "graphql";
import { schema } from "./schema";
import fastify from "fastify";
import {
  getGraphQLParameters,
  sendResult,
  processRequest,
  Request,
  renderGraphiQL,
  shouldRenderGraphiQL,
} from "graphql-helix";

async function main() {
  const server = fastify();

  server.route({
    method: ["POST", "GET"],
    url: "/graphql",
    handler: async (req, reply) => {
      const { headers, method, query, body } = req;
      const request: Request = {
        headers,
        method,
        query,
        body,
      };

      if (shouldRenderGraphiQL(request)) {
        reply.header("Content-Type", "text/html");
        reply.send(
          renderGraphiQL({
            endpoint: "/graphql",
          })
        );

        return;
      }

      const {
        operationName,
        query: queryParams,
        variables,
      } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        query: queryParams,
        variables,
      });

      sendResult(result, reply.raw);
    },
  });
  server.listen({ port: 3000, host: "0.0.0.0" }, () => {
    console.log(`Server is running on http://localhost:3000/`);
  });
}

main();
