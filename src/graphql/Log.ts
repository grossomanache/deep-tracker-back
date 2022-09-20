import { objectType, extendType, nonNull } from "nexus";
import { resolve } from "path";
import { NexusGenObjects } from "../../nexus-typegen";

export const Metric = objectType({
  name: "Metric",
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
    t.nonNull.list.nonNull.field("links", { type: Log });
    t.nonNull.int("count");
    t.id("id");
  },
});
