import "graphql-import-node";
import { execute, parse } from "graphql";
import { schema } from "./schema";
import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { contextFactory } from "./context";
import {
  getGraphQLParameters,
  sendResult,
  processRequest,
  Request,
  renderGraphiQL,
  shouldRenderGraphiQL,
} from "graphql-helix";

export const prisma = new PrismaClient();

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
        contextFactory: () => contextFactory(req),
        query: queryParams,
        variables,
      });

      sendResult(result, reply.raw);
    },
  });

  const port = process.env.PORT || 3000;
  server.listen({ port, host: "0.0.0.0" }, () => {
    console.log(`Server is running on http://localhost:3000/`);
  });
}

main();
