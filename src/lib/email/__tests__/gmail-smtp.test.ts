/**
 * Tests for src/lib/email/gmail-smtp.ts
 * Gmail SMTP transport, singleton creation, connection verification
 */

// Save and restore original env
const savedEmailUser = process.env.EMAIL_USER;
const savedEmailPassword = process.env.EMAIL_PASSWORD;
const savedEmailHost = process.env.EMAIL_HOST;
const savedEmailPort = process.env.EMAIL_PORT;
const savedEmailFrom = process.env.EMAIL_FROM;

afterAll(() => {
  // Restore original env
  if (savedEmailUser !== undefined) process.env.EMAIL_USER = savedEmailUser;
  else delete process.env.EMAIL_USER;
  if (savedEmailPassword !== undefined) process.env.EMAIL_PASSWORD = savedEmailPassword;
  else delete process.env.EMAIL_PASSWORD;
  if (savedEmailHost !== undefined) process.env.EMAIL_HOST = savedEmailHost;
  else delete process.env.EMAIL_HOST;
  if (savedEmailPort !== undefined) process.env.EMAIL_PORT = savedEmailPort;
  else delete process.env.EMAIL_PORT;
  if (savedEmailFrom !== undefined) process.env.EMAIL_FROM = savedEmailFrom;
  else delete process.env.EMAIL_FROM;
});

// ---- GMAIL_CONFIG (uses whatever env is present) ----
describe("GMAIL_CONFIG", () => {
  it("should have default host as smtp.gmail.com when not set", async () => {
    jest.resetModules();
    delete process.env.EMAIL_HOST;
    jest.doMock("nodemailer", () => ({
      createTransport: jest.fn(() => ({ sendMail: jest.fn(), verify: jest.fn() })),
    }));
    const mod = await import("../gmail-smtp");
    expect(mod.GMAIL_CONFIG.host).toBe("smtp.gmail.com");
  });

  it("should have default port as 587 when not set", async () => {
    jest.resetModules();
    delete process.env.EMAIL_PORT;
    jest.doMock("nodemailer", () => ({
      createTransport: jest.fn(() => ({ sendMail: jest.fn(), verify: jest.fn() })),
    }));
    const mod = await import("../gmail-smtp");
    expect(mod.GMAIL_CONFIG.port).toBe(587);
  });

  it("should have a from address", async () => {
    jest.resetModules();
    jest.doMock("nodemailer", () => ({
      createTransport: jest.fn(() => ({ sendMail: jest.fn(), verify: jest.fn() })),
    }));
    const mod = await import("../gmail-smtp");
    expect(mod.GMAIL_CONFIG.from).toBeTruthy();
  });
});

// ---- Unconfigured SMTP ----
describe("Gmail SMTP unconfigured", () => {
  let gmailModule: typeof import("../gmail-smtp");

  beforeEach(async () => {
    jest.resetModules();

    // Clear email env vars
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;

    jest.doMock("nodemailer", () => ({
      createTransport: jest.fn(() => ({ sendMail: jest.fn(), verify: jest.fn() })),
    }));

    gmailModule = await import("../gmail-smtp");
  });

  it("should return false for isGmailConfigured", () => {
    expect(gmailModule.isGmailConfigured()).toBe(false);
  });

  it("should return from address string", () => {
    const from = gmailModule.getFromAddress();
    expect(typeof from).toBe("string");
    expect(from.length).toBeGreaterThan(0);
  });

  it("should return failure when sendRawEmail called", async () => {
    const result = await gmailModule.sendRawEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Gmail SMTP not configured");
  });

  it("should return false for verifyConnection", async () => {
    const result = await gmailModule.verifyConnection();
    expect(result).toBe(false);
  });
});

// ---- Module with configured SMTP ----
describe("Gmail SMTP with configured environment", () => {
  let gmailModule: typeof import("../gmail-smtp");
  let localMockSendMail: jest.Mock;
  let localMockVerify: jest.Mock;
  let localMockCreateTransport: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    // Set env vars BEFORE importing
    process.env.EMAIL_USER = "test@gmail.com";
    process.env.EMAIL_PASSWORD = "test-app-password";
    process.env.EMAIL_HOST = "smtp.gmail.com";
    process.env.EMAIL_PORT = "587";
    process.env.EMAIL_FROM = "Test <test@gmail.com>";

    // Create fresh mocks for configured state
    localMockSendMail = jest.fn();
    localMockVerify = jest.fn();
    localMockCreateTransport = jest.fn(() => ({
      sendMail: localMockSendMail,
      verify: localMockVerify,
    }));

    // Re-mock nodemailer for fresh module
    jest.doMock("nodemailer", () => ({
      createTransport: localMockCreateTransport,
    }));
  });

  afterEach(() => {
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_FROM;
  });

  it("should detect configured SMTP", async () => {
    gmailModule = await import("../gmail-smtp");
    expect(gmailModule.isGmailConfigured()).toBe(true);
  });

  it("should send email successfully", async () => {
    gmailModule = await import("../gmail-smtp");

    localMockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });

    const result = await gmailModule.sendRawEmail({
      to: "customer@example.com",
      subject: "Order Confirmed",
      html: "<h1>Your order is confirmed</h1>",
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("msg-123");
    expect(localMockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        subject: "Order Confirmed",
      })
    );
  });

  it("should handle send failure gracefully", async () => {
    gmailModule = await import("../gmail-smtp");

    localMockSendMail.mockRejectedValueOnce(new Error("SMTP connection failed"));

    const result = await gmailModule.sendRawEmail({
      to: "customer@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("SMTP connection failed");
  });

  it("should strip HTML tags for text fallback", async () => {
    gmailModule = await import("../gmail-smtp");

    localMockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

    await gmailModule.sendRawEmail({
      to: "customer@example.com",
      subject: "Test",
      html: "<p>Hello <strong>World</strong></p>",
    });

    expect(localMockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.not.stringContaining("<p>"),
      })
    );
  });

  it("should verify connection successfully", async () => {
    gmailModule = await import("../gmail-smtp");

    localMockVerify.mockResolvedValueOnce(true);

    const result = await gmailModule.verifyConnection();
    expect(result).toBe(true);
  });

  it("should handle verification failure", async () => {
    gmailModule = await import("../gmail-smtp");

    localMockVerify.mockRejectedValueOnce(new Error("Connection refused"));

    const result = await gmailModule.verifyConnection();
    expect(result).toBe(false);
  });

  it("should create transporter with correct options", async () => {
    gmailModule = await import("../gmail-smtp");

    // Trigger transporter creation by calling sendRawEmail
    localMockSendMail.mockResolvedValueOnce({ messageId: "msg-init" });
    await gmailModule.sendRawEmail({
      to: "test@example.com",
      subject: "Init",
      html: "<p>Init</p>",
    });

    expect(localMockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 587,
        auth: expect.objectContaining({
          user: "test@gmail.com",
          pass: "test-app-password",
        }),
      })
    );
  });
});
