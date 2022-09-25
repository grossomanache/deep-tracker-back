import { objectType, extendType, nonNull, list, inputObjectType } from "nexus";
import { Prisma, prisma } from "@prisma/client";
import { resolve } from "path";
import { listenerCount } from "process";
import { NexusGenObjects } from "../../nexus-typegen";
import { GraphQLContext } from "../context";
import {
  arg,
  enumType,
  intArg,
  NexusObjectTypeDef,
  stringArg,
} from "nexus/dist/core";

export const Metric = objectType({
  name: "Metric",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.dateTime("date");
    t.nonNull.string("name");
    t.nonNull.int("value");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.metric
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
  },
});

export const Metrics = objectType({
  name: "Metrics",
  definition(t) {
    t.nonNull.list.nonNull.field("metrics", { type: Metric });
  },
});

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("metrics", { type: Metric });
    t.nonNull.int("count");
    t.id("id");
  },
});

export const MetricInputType = inputObjectType({
  name: "MetricInputType",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.int("value");
  },
});

export const MetricQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        filterByName: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(MetricOrderByInput)) }),
      },
      async resolve(parent, args, context, info) {
        const { filterByName } = args;
        const { currentUser } = context;

        if (!currentUser) {
          throw new Error("Cannot retrieve metrics without logging in.");
        }

        const where = {
          postedBy: currentUser,
          name: { contains: filterByName ?? "" },
        };

        const metrics = await context.prisma.metric.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.MetricOrderByWithRelationInput>
            | undefined,
        });
        const count = await context.prisma.metric.count({ where });
        const id = `main-feed:${JSON.stringify(args)}`;

        return {
          metrics,
          count,
          id,
        };
      },
    });
  },
});

export const MetricMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Metrics",
      args: { metrics: list(nonNull("MetricInputType")) },

      resolve(parent, args, context: GraphQLContext) {
        const { metrics } = args;
        const { currentUser } = context;

        if (!currentUser) {
          throw new Error("Cannot post without logging in.");
        }

        const newMetrics: Prisma.Prisma__MetricClient<any>[] = [];

        if (metrics) {
          metrics.forEach((metric) => {
            const { name, value } = metric;
            const createdMetric = context.prisma.metric.create({
              data: {
                name,
                value,
                postedBy: { connect: { id: currentUser.id } },
              },
            });
            newMetrics.push(createdMetric);
          });
        }

        return { metrics: newMetrics };
      },
    });
    t.nonNull.field("deleteMetric", {
      type: "Metric",
      args: { id: nonNull(intArg()) },
      async resolve(parent, args, context) {
        const { id } = args;
        const { currentUser } = context;

        if (!currentUser) {
          throw new Error("Cannot delete without logging in.");
        }

        const metricToBeDeleted = await context.prisma.metric.findUnique({
          where: { id },
        });

        if (!metricToBeDeleted) {
          throw new Error("Metric id to be deleted doesn't exist");
        }

        if (metricToBeDeleted.postedById !== currentUser.id) {
          throw new Error("Metric doesn't correspond to logged in user");
        }

        const deletedMetric = context.prisma.metric.delete({
          where: { id },
        });

        return deletedMetric;
      },
    });
  },
});

export const MetricOrderByInput = inputObjectType({
  name: "MetricOrderByInput",
  definition(t) {
    t.field("name", { type: Sort });
    t.field("date", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});
