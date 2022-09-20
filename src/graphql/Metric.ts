import { objectType } from "nexus";

export const Metric = objectType({
  name: "Metric",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.int("value");
  },
});
