import { objectType, extendType, nonNull, list, inputObjectType } from "nexus";
import { resolve } from "path";
import { listenerCount } from "process";
import { NexusGenObjects } from "../../nexus-typegen";

export const Metric = objectType({
  name: "Metric",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.int("value");
  },
});

export const MetricInputType = inputObjectType({
  name: "MetricInputType",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.int("value");
  },
});

export const Log = objectType({
  name: "Log",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.dateTime("date");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field("metric", { type: Metric });
  },
});

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("logs", { type: Log });
    t.nonNull.int("count");
    t.id("id");
  },
});

export const LogMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Log",
      args: { metrics: list(nonNull("MetricInputType")) },

      async resolve(parent, args, context) {
        const { metrics } = args;
        const { currentUser } = context;

        if (!currentUser) {
          throw new Error("Cannot post without logging in.");
        }

        const newLog = await context.prisma.log.create({
          data: { postedBy: { connect: { id: currentUser.id } } },
        });

        if (metrics) {
          metrics.forEach(metric => {
            const loggedMetric
          context.prisma.metric.create({data: })
        });}

        console.log(newLog);
        return newLog;
      },
    });
  },
});
