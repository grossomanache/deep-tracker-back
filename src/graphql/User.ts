import { objectType } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.nonNull.string("surname");
    t.nonNull.string("email");
    t.nonNull.string("password");
    t.nonNull.list.nonNull.field("logs", {
      type: "Log",
      resolve(parent, args, context) {
        return context.prisma.user
          .findUnique({ where: { id: parent.id } })
          .logs();
      },
    });
  },
});
