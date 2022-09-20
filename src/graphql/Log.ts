import { objectType } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";
import { Metric } from "./Metric";

export const Log = objectType({
  name: "Log",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.dateTime("date");
    t.nonNull.string("newfield");
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
