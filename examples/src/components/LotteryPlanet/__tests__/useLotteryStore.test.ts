import { describe, expect, it } from "vitest";
import { generateUsers, useLotteryStore } from "../useLotteryStore";

describe("useLotteryStore", () => {
  it("generates users and selects winners", () => {
    const users = generateUsers(50);
    useLotteryStore.getState().setUsers(users);
    const selected = useLotteryStore.getState().selectWinners(3);
    expect(selected.length).toBe(3);
    // winners should be from users
    selected.forEach((w) => {
      expect(users.find((u) => u.id === w.id)).toBeTruthy();
    });
  });

  it("caches and retrieves textures", () => {
    const store = useLotteryStore.getState();
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    store.setCachedTexture(1234, canvas);
    const got = store.getCachedTexture(1234);
    expect(got).toBe(canvas);
  });
});
