import { describe, expect, it } from "vitest";

import { makeUsersRepo } from "~/domain/test/fakes";

import { listUsers } from "./list-users";

describe("domain/users/listUsers", () => {
  it("lista resumos via repo", async () => {
    const createdAt = new Date("2026-02-23T00:00:00.000Z");
    const { repo: usersRepo } = makeUsersRepo({
      users: [
        { id: "u1", username: "alice", isAdmin: true, createdAt },
        { id: "u2", username: "bob", isAdmin: false, createdAt },
      ],
    });

    const list = await listUsers({ usersRepo });
    expect(list).toHaveLength(2);
    expect(list.map((u) => u.username)).toEqual(["alice", "bob"]);
  });
});
