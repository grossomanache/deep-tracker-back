import { Request } from "express";
import { decodeAuthHeader } from "./utils/auth";
import { prisma } from "./index";
import { PrismaClient } from "@prisma/client";

export type GraphQLContext = { prisma: PrismaClient };

export async function contextFactory(): Promise<GraphQLContext> {
  return { prisma };
}
