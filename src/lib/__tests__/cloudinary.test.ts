/**
 * Tests for src/lib/cloudinary.ts
 * Covers: validateFile (pure logic), uploadToCloudinary (fetch mock),
 *         uploadMultipleToCloudinary (parallel uploads)
 */

// Save original env
const originalEnv = { ...process.env };

beforeEach(() => {
  jest.clearAllMocks();
  // Set required env vars
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test-cloud";
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = "test-preset";
});

afterEach(() => {
  process.env = { ...originalEnv };
});

// We need to dynamically import to pick up env changes
// But validateFile is a pure function, so we can test it directly

describe("validateFile", () => {
  let validateFile: typeof import("../cloudinary").validateFile;

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = "test-preset";
    const mod = await import("../cloudinary");
    validateFile = mod.validateFile;
  });

  // Helper to create a File-like object
  function makeFile(name: string, size: number, type: string): File {
    const buffer = new ArrayBuffer(size);
    return new File([buffer], name, { type });
  }

  it("accepts valid JPEG under size limit", () => {
    const file = makeFile("photo.jpg", 1024 * 1024, "image/jpeg"); // 1 MB
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("accepts valid PNG under default limit", () => {
    const file = makeFile("icon.png", 5 * 1024 * 1024, "image/png"); // 5 MB
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts valid WebP format", () => {
    const file = makeFile("image.webp", 100, "image/webp");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts PDF format (default allowed)", () => {
    const file = makeFile("doc.pdf", 100, "application/pdf");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("rejects file exceeding default 10MB limit", () => {
    const file = makeFile("huge.jpg", 11 * 1024 * 1024, "image/jpeg"); // 11 MB
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10MB");
  });

  it("rejects file exceeding custom size limit", () => {
    const file = makeFile("medium.jpg", 3 * 1024 * 1024, "image/jpeg"); // 3 MB
    const result = validateFile(file, 2); // 2 MB limit
    expect(result.valid).toBe(false);
    expect(result.error).toContain("2MB");
  });

  it("accepts file at exact boundary of size limit", () => {
    const file = makeFile("exact.jpg", 10 * 1024 * 1024, "image/jpeg"); // exactly 10 MB
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("rejects disallowed MIME type", () => {
    const file = makeFile("script.exe", 100, "application/x-executable");
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not allowed");
    expect(result.error).toContain("image/jpeg");
  });

  it("rejects SVG by default", () => {
    const file = makeFile("logo.svg", 100, "image/svg+xml");
    const result = validateFile(file);
    expect(result.valid).toBe(false);
  });

  it("accepts custom allowed types", () => {
    const file = makeFile("video.mp4", 100, "video/mp4");
    const result = validateFile(file, 10, ["video/mp4", "video/webm"]);
    expect(result.valid).toBe(true);
  });

  it("rejects type not in custom allowed list", () => {
    const file = makeFile("photo.jpg", 100, "image/jpeg");
    const result = validateFile(file, 10, ["video/mp4"]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("video/mp4");
  });

  it("accepts zero-byte file (only type check)", () => {
    const file = makeFile("empty.png", 0, "image/png");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("rejects GIF by default", () => {
    const file = makeFile("anim.gif", 100, "image/gif");
    const result = validateFile(file);
    expect(result.valid).toBe(false);
  });
});

describe("uploadToCloudinary", () => {
  let uploadToCloudinary: typeof import("../cloudinary").uploadToCloudinary;

  beforeEach(async () => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = "test-preset";
    const mod = await import("../cloudinary");
    uploadToCloudinary = mod.uploadToCloudinary;
  });

  function makeFile(name: string, size: number, type: string): File {
    return new File([new ArrayBuffer(size)], name, { type });
  }

  it("throws when cloud name is missing", async () => {
    jest.resetModules();
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = "test-preset";
    const mod = await import("../cloudinary");
    const file = makeFile("test.jpg", 100, "image/jpeg");
    await expect(mod.uploadToCloudinary(file)).rejects.toThrow(
      "Cloudinary configuration missing"
    );
  });

  it("throws when upload preset is missing", async () => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test-cloud";
    delete process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const mod = await import("../cloudinary");
    const file = makeFile("test.jpg", 100, "image/jpeg");
    await expect(mod.uploadToCloudinary(file)).rejects.toThrow(
      "Cloudinary configuration missing"
    );
  });

  it("calls Cloudinary API with correct URL and FormData", async () => {
    const mockResp = {
      ok: true,
      json: () =>
        Promise.resolve({
          url: "http://res.cloudinary.com/test.jpg",
          secure_url: "https://res.cloudinary.com/test.jpg",
          public_id: "folder/test",
          format: "jpg",
          width: 800,
          height: 600,
          bytes: 12345,
          original_filename: "test",
        }),
    };
    (global as any).fetch = jest.fn().mockResolvedValueOnce(mockResp);

    const file = makeFile("test.jpg", 100, "image/jpeg");
    const result = await uploadToCloudinary(file);

    expect(result.secureUrl).toBe("https://res.cloudinary.com/test.jpg");
    expect(result.publicId).toBe("folder/test");
    expect(result.format).toBe("jpg");
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.bytes).toBe(12345);
    expect(result.originalFilename).toBe("test");

    const calledUrl = (global as any).fetch.mock.calls[0][0];
    expect(calledUrl).toContain("test-cloud");
    expect(calledUrl).toContain("/auto/upload");
  });

  it("includes folder in FormData when specified", async () => {
    const mockResp = {
      ok: true,
      json: () =>
        Promise.resolve({
          url: "u",
          secure_url: "su",
          public_id: "p",
          format: "jpg",
          bytes: 1,
          original_filename: "t",
        }),
    };
    (global as any).fetch = jest.fn().mockResolvedValueOnce(mockResp);

    const file = makeFile("test.jpg", 100, "image/jpeg");
    await uploadToCloudinary(file, { folder: "avatars" });

    const formData: FormData = (global as any).fetch.mock.calls[0][1].body;
    expect(formData.get("folder")).toBe("avatars");
  });

  it("includes tags in FormData when specified", async () => {
    const mockResp = {
      ok: true,
      json: () =>
        Promise.resolve({
          url: "u",
          secure_url: "su",
          public_id: "p",
          format: "jpg",
          bytes: 1,
          original_filename: "t",
        }),
    };
    (global as any).fetch = jest.fn().mockResolvedValueOnce(mockResp);

    const file = makeFile("test.jpg", 100, "image/jpeg");
    await uploadToCloudinary(file, { tags: ["profile", "user123"] });

    const formData: FormData = (global as any).fetch.mock.calls[0][1].body;
    expect(formData.get("tags")).toBe("profile,user123");
  });

  it("throws on non-OK response", async () => {
    const mockResp = {
      ok: false,
      json: () =>
        Promise.resolve({
          error: { message: "Upload failed: invalid preset" },
        }),
    };
    (global as any).fetch = jest.fn().mockResolvedValueOnce(mockResp);

    const file = makeFile("test.jpg", 100, "image/jpeg");
    await expect(uploadToCloudinary(file)).rejects.toThrow(
      "Upload failed: invalid preset"
    );
  });

  it("throws generic message when error response has no message", async () => {
    const mockResp = {
      ok: false,
      json: () => Promise.resolve({}),
    };
    (global as any).fetch = jest.fn().mockResolvedValueOnce(mockResp);

    const file = makeFile("photo.jpg", 100, "image/jpeg");
    await expect(uploadToCloudinary(file)).rejects.toThrow(
      "Failed to upload photo.jpg"
    );
  });
});

describe("uploadMultipleToCloudinary", () => {
  let uploadMultipleToCloudinary: typeof import("../cloudinary").uploadMultipleToCloudinary;

  beforeEach(async () => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = "test-preset";
    const mod = await import("../cloudinary");
    uploadMultipleToCloudinary = mod.uploadMultipleToCloudinary;
  });

  function makeFile(name: string): File {
    return new File([new ArrayBuffer(10)], name, { type: "image/jpeg" });
  }

  it("uploads multiple files in parallel", async () => {
    const baseResp = {
      url: "u",
      secure_url: "su",
      public_id: "p",
      format: "jpg",
      bytes: 1,
      original_filename: "t",
    };
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ...baseResp, public_id: "a" }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ...baseResp, public_id: "b" }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ...baseResp, public_id: "c" }) });

    const files = [makeFile("a.jpg"), makeFile("b.jpg"), makeFile("c.jpg")];
    const results = await uploadMultipleToCloudinary(files);

    expect(results).toHaveLength(3);
    expect(results[0].publicId).toBe("a");
    expect(results[1].publicId).toBe("b");
    expect(results[2].publicId).toBe("c");
    expect((global as any).fetch).toHaveBeenCalledTimes(3);
  });

  it("returns empty array for empty input", async () => {
    const results = await uploadMultipleToCloudinary([]);
    expect(results).toEqual([]);
  });
});
