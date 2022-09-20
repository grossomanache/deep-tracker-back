import { objectType } from "nexus";

export const Log = objectType({
  name: "Log",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull;
  },
});
