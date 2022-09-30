import "graphql-import-node";
import { execute, parse, responsePathAsArray } from "graphql";
import { schema } from "./schema";
import fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { contextFactory, GraphQLContext } from "./context";
import {
  getGraphQLParameters,
  sendResult,
  processRequest,
  Request,
  renderGraphiQL,
  shouldRenderGraphiQL,
  sendResponseResult,
  sendPushResult,
  sendMultipartResponseResult,
  Result,
  ProcessRequestResult,
  Response,
  MultipartResponse,
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

      const {
        query: queryParams,
        variables,
        operationName,
      } = getGraphQLParameters(request);

      const result: ProcessRequestResult<GraphQLContext, any> =
        await processRequest({
          request,
          schema,
          operationName,
          contextFactory: () => contextFactory(req),
          query: queryParams,
          variables,
        });

      //sendResult(result, reply);
      reply.code(200).send(result.payload);
    },
  });

  const port = process.env.PORT || 3000;
  server.listen({ port }).then((url) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

main();
