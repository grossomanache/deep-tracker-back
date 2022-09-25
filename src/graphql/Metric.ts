import { objectType, extendType, nonNull, list, inputObjectType } from "nexus";
import { Prisma, prisma } from "@prisma/client";
import { resolve } from "path";
import { listenerCount } from "process";
import { NexusGenObjects } from "../../nexus-typegen";
import { GraphQLContext } from "../context";
import { enumType, NexusObjectTypeDef } from "nexus/dist/core";

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
  definition(t) {},
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
  },
});

export const MetricOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("name", { type: Sort });
    t.field("date", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});
