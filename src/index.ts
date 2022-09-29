import "graphql-import-node";
import { execute, parse } from "graphql";
import { schema } from "./schema";
import fastify from "fastify";
import cors from "@fastify/cors";
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
import { acceptedCors } from "./utils/corsOptions";

export const prisma = new PrismaClient();

async function main() {
  const server = fastify();

  server.register(cors, acceptedCors);

  server.route({
    method: ["POST", "GET"],
    url: "/graphql",
    handler: async (req, reply) => {
      const {
        headers,
        method,
        query,
        body,
        headers: { host, origin },
      } = req;
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

      if (origin?.replace("http://", "") === host) {
        sendResult(result, reply.raw);
      } else {
        reply.send(result);
      }
    },
  });

  const port = process.env.PORT || 3000;
  server.listen({ port }).then((url) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

main();
