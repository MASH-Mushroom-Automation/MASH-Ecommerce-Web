/**
 * Constants Tests (COV-003)
 * Tests: DEFAULT_AVATAR value
 */

import { DEFAULT_AVATAR } from "../constants";

describe("Constants", () => {
  it("should export DEFAULT_AVATAR as a string", () => {
    expect(typeof DEFAULT_AVATAR).toBe("string");
  });

  it("should have a valid avatar path", () => {
    expect(DEFAULT_AVATAR).toBe("/profile_placeholder.png");
  });
});
