import * as firebaseExports from "@/lib/firebase/index";
jest.mock("firebase/app", () => ({}));
jest.mock("firebase/auth", () => ({}));
jest.mock("firebase/firestore", () => ({}));
describe("firebase/index barrel", () => {
  it("should have defined exports", () => {
    expect(firebaseExports).toBeDefined();
    expect(typeof firebaseExports.firebaseApp).toBe("object");
  });
});