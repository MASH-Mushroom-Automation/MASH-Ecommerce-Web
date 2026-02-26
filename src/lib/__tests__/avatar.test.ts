/**
 * Tests for src/lib/avatar.ts
 * Avatar URL generation with priority chain and DiceBear integration - pure logic
 */
import {
  getDiceBearAvatar,
  getProfileAvatar,
  isDiceBearAvatar,
  getUserInitials,
  type AvatarUser,
} from "../avatar";

const FALLBACK = "/profile_placeholder.png";
const DICEBEAR_BASE = "https://api.dicebear.com/9.x/bottts-neutral/svg";

describe("getDiceBearAvatar", () => {
  it("generates a DiceBear URL with the given seed", () => {
    const url = getDiceBearAvatar("john");
    expect(url).toContain(DICEBEAR_BASE);
    expect(url).toContain("seed=john");
  });

  it("lowercases and replaces spaces with dashes in seed", () => {
    const url = getDiceBearAvatar("John Doe");
    expect(url).toContain("seed=john-doe");
  });

  it("returns fallback for empty seed", () => {
    expect(getDiceBearAvatar("")).toBe(FALLBACK);
  });

  it("encodes special characters in seed", () => {
    const url = getDiceBearAvatar("user@name");
    expect(url).toContain("seed=user%40name");
  });

  it("accepts custom style parameter", () => {
    const url = getDiceBearAvatar("test", "avataaars");
    expect(url).toContain("/avataaars/svg");
  });

  it("collapses multiple spaces into single dash", () => {
    const url = getDiceBearAvatar("John   Doe");
    expect(url).toContain("seed=john-doe");
  });
});

describe("getProfileAvatar", () => {
  it("returns fallback for null user", () => {
    expect(getProfileAvatar(null)).toBe(FALLBACK);
  });

  it("returns fallback for undefined user", () => {
    expect(getProfileAvatar(undefined)).toBe(FALLBACK);
  });

  // Priority 1: photoURL
  it("returns photoURL when available (Google OAuth)", () => {
    const user: AvatarUser = { photoURL: "https://google.com/photo.jpg" };
    expect(getProfileAvatar(user)).toBe("https://google.com/photo.jpg");
  });

  // Priority 2: imageUrl
  it("returns imageUrl from backend when photoURL is missing", () => {
    const user: AvatarUser = {
      imageUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=test",
    };
    expect(getProfileAvatar(user)).toBe(user.imageUrl);
  });

  // Priority 3: valid avatar URL
  it("returns avatar field when it is a valid URL", () => {
    const user: AvatarUser = { avatar: "https://example.com/avatar.png" };
    expect(getProfileAvatar(user)).toBe("https://example.com/avatar.png");
  });

  it("skips avatar field when it equals fallback", () => {
    const user: AvatarUser = { avatar: FALLBACK, username: "test" };
    expect(getProfileAvatar(user)).toContain("seed=test");
  });

  it("skips avatar field when it is not a valid URL (relative path)", () => {
    const user: AvatarUser = { avatar: "/some/local/path.png", username: "test" };
    expect(getProfileAvatar(user)).toContain("seed=test");
  });

  it("accepts data: URLs as valid avatar", () => {
    const user: AvatarUser = { avatar: "data:image/png;base64,abc123" };
    expect(getProfileAvatar(user)).toBe("data:image/png;base64,abc123");
  });

  // Priority 4: username
  it("generates DiceBear from username when higher priorities missing", () => {
    const user: AvatarUser = { username: "mashuser" };
    const url = getProfileAvatar(user);
    expect(url).toContain(DICEBEAR_BASE);
    expect(url).toContain("seed=mashuser");
  });

  // Priority 5: displayName
  it("generates DiceBear from displayName when username missing", () => {
    const user: AvatarUser = { displayName: "Jane Doe" };
    const url = getProfileAvatar(user);
    expect(url).toContain("seed=jane-doe");
  });

  // Priority 5b: firstName + lastName
  it("generates DiceBear from firstName + lastName", () => {
    const user: AvatarUser = { firstName: "Juan", lastName: "Cruz" };
    const url = getProfileAvatar(user);
    expect(url).toContain("seed=juan-cruz");
  });

  it("uses firstName only when lastName missing", () => {
    const user: AvatarUser = { firstName: "Juan" };
    const url = getProfileAvatar(user);
    expect(url).toContain("seed=juan");
  });

  // Priority 6: email prefix
  it("generates DiceBear from email prefix", () => {
    const user: AvatarUser = { email: "buyer@mashmarket.app" };
    const url = getProfileAvatar(user);
    expect(url).toContain("seed=buyer");
  });

  // Priority 7: user id
  it("generates DiceBear from user id as last resort", () => {
    const user: AvatarUser = { id: "firebase-uid-123" };
    const url = getProfileAvatar(user);
    expect(url).toContain("seed=firebase-uid-123");
  });

  // Priority chain: higher takes precedence
  it("prefers photoURL over all other fields", () => {
    const user: AvatarUser = {
      photoURL: "https://google.com/photo.jpg",
      imageUrl: "https://dicebear.com/other",
      username: "user1",
      email: "user@test.com",
    };
    expect(getProfileAvatar(user)).toBe("https://google.com/photo.jpg");
  });

  it("prefers imageUrl over username/email", () => {
    const user: AvatarUser = {
      imageUrl: "https://api.dicebear.com/seed=backend",
      username: "user1",
    };
    expect(getProfileAvatar(user)).toBe("https://api.dicebear.com/seed=backend");
  });

  // Edge: empty user object
  it("returns fallback for user with no avatar-related fields", () => {
    const user: AvatarUser = {};
    expect(getProfileAvatar(user)).toBe(FALLBACK);
  });

  // Edge: null/empty strings
  it("skips null photoURL and falls through", () => {
    const user: AvatarUser = { photoURL: null, username: "fallback" };
    expect(getProfileAvatar(user)).toContain("seed=fallback");
  });
});

describe("isDiceBearAvatar", () => {
  it("returns true for DiceBear URLs", () => {
    expect(isDiceBearAvatar("https://api.dicebear.com/9.x/bottts-neutral/svg?seed=test")).toBe(true);
  });

  it("returns true for data: URLs", () => {
    expect(isDiceBearAvatar("data:image/svg+xml;base64,abc")).toBe(true);
  });

  it("returns false for regular URLs", () => {
    expect(isDiceBearAvatar("https://example.com/photo.jpg")).toBe(false);
  });

  it("returns false for relative paths", () => {
    expect(isDiceBearAvatar("/profile_placeholder.png")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isDiceBearAvatar("")).toBe(false);
  });
});

describe("getUserInitials", () => {
  it("returns initials from firstName and lastName", () => {
    const user: AvatarUser = { firstName: "John", lastName: "Doe" };
    expect(getUserInitials(user)).toBe("JD");
  });

  it("returns single initial from firstName only", () => {
    const user: AvatarUser = { firstName: "John" };
    // firstInitial = 'J', lastInitial = '' (no lastName, no displayName split)
    expect(getUserInitials(user)).toBe("J");
  });

  it("uses displayName when firstName/lastName missing", () => {
    const user: AvatarUser = { displayName: "Jane Smith" };
    // firstInitial = displayName[0] = 'J', lastInitial = displayName.split(' ')[1][0] = 'S'
    expect(getUserInitials(user)).toBe("JS");
  });

  it("uses displayName single word (one initial)", () => {
    const user: AvatarUser = { displayName: "Madonna" };
    expect(getUserInitials(user)).toBe("M");
  });

  it("falls back to email initial", () => {
    const user: AvatarUser = { email: "buyer@mash.com" };
    expect(getUserInitials(user)).toBe("B");
  });

  it("returns 'U' for null user", () => {
    expect(getUserInitials(null)).toBe("U");
  });

  it("returns 'U' for undefined user", () => {
    expect(getUserInitials(undefined)).toBe("U");
  });

  it("returns 'U' for empty user object", () => {
    const user: AvatarUser = {};
    expect(getUserInitials(user)).toBe("U");
  });

  it("uppercases initials", () => {
    const user: AvatarUser = { firstName: "john", lastName: "doe" };
    expect(getUserInitials(user)).toBe("JD");
  });
});
