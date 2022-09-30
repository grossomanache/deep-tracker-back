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
import { schemaRemover } from "./utils/schemaRemover";

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
        reply.send(renderGraphiQL());
        reply.send(
          renderGraphiQL({
            endpoint: "/graphql",
          })
        );
        return;
      }

      const { query: queryParams } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        contextFactory: () => contextFactory(req),
        query: queryParams,
      });

      console.log(result);

      if (origin && schemaRemover(origin) === host) {
        sendResult(result, reply.raw);
      } else {
        //sendResult(result, reply);
        reply.send(result.payload);
      }
    },
  });

  const port = 1 * process.env.PORT || 3000;
  server.listen({ port }).then((url) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

main();
