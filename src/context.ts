import { Request } from "express";
import { decodeAuthHeader } from "./utils/auth";
import { prisma } from "./index";
import { PrismaClient, User } from "@prisma/client";
import { FastifyRequest } from "fastify";

export type GraphQLContext = { prisma: PrismaClient; currentUser: User | null };

export async function contextFactory(
  request: FastifyRequest
): Promise<GraphQLContext> {
  return { prisma, currentUser: authenticateUser(prisma, request) };
}
