/**
 * Tests for src/lib/api/addresses.ts
 * Address CRUD operations (currently mock implementations)
 */
import { addressApi, Address, CreateAddressRequest, UpdateAddressRequest } from "../addresses";

describe("addressApi", () => {
  describe("getAll", () => {
    it("returns a successful response with empty array", async () => {
      const result = await addressApi.getAll();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toBe("Addresses fetched successfully");
    });
  });

  describe("getById", () => {
    it("returns not found for any ID (mock)", async () => {
      const result = await addressApi.getById("123");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Address not found");
    });

    it("returns an empty Address object as data", async () => {
      const result = await addressApi.getById("nonexistent");
      expect(result.data).toBeDefined();
    });
  });

  describe("create", () => {
    const newAddress: CreateAddressRequest = {
      name: "John Doe",
      phone: "+639123456789",
      address: "123 Main St",
      city: "Quezon City",
      postalCode: "1100",
      barangay: "Diliman",
      isDefault: true,
    };

    it("returns success with created address", async () => {
      const result = await addressApi.create(newAddress);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Address created successfully");
    });

    it("returns address with generated ID", async () => {
      const result = await addressApi.create(newAddress);
      expect(result.data.id).toBeDefined();
      expect(result.data.id.length).toBeGreaterThan(0);
    });

    it("includes all input fields in created address", async () => {
      const result = await addressApi.create(newAddress);
      expect(result.data.name).toBe("John Doe");
      expect(result.data.phone).toBe("+639123456789");
      expect(result.data.address).toBe("123 Main St");
      expect(result.data.city).toBe("Quezon City");
      expect(result.data.postalCode).toBe("1100");
      expect(result.data.barangay).toBe("Diliman");
    });

    it("sets isDefault from request data", async () => {
      const result = await addressApi.create(newAddress);
      expect(result.data.isDefault).toBe(true);
    });

    it("defaults isDefault to false when not provided", async () => {
      const { isDefault, ...noDefault } = newAddress;
      const result = await addressApi.create(noDefault);
      expect(result.data.isDefault).toBe(false);
    });

    it("includes timestamps on created address", async () => {
      const result = await addressApi.create(newAddress);
      expect(result.data.createdAt).toBeDefined();
      expect(result.data.updatedAt).toBeDefined();
    });
  });

  describe("update", () => {
    const updateData: UpdateAddressRequest = {
      id: "addr-1",
      name: "Jane Doe",
      phone: "+639987654321",
      address: "456 Oak Ave",
      city: "Makati",
      postalCode: "1200",
      isDefault: false,
    };

    it("returns success with updated address", async () => {
      const result = await addressApi.update(updateData);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Address updated successfully");
    });

    it("preserves the address ID", async () => {
      const result = await addressApi.update(updateData);
      expect(result.data.id).toBe("addr-1");
    });

    it("includes updated fields", async () => {
      const result = await addressApi.update(updateData);
      expect(result.data.name).toBe("Jane Doe");
      expect(result.data.city).toBe("Makati");
    });

    it("includes updatedAt timestamp", async () => {
      const result = await addressApi.update(updateData);
      expect(result.data.updatedAt).toBeDefined();
    });
  });

  describe("delete", () => {
    it("returns success for any ID", async () => {
      const result = await addressApi.delete("addr-1");
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Address deleted successfully");
    });
  });

  describe("setDefault", () => {
    it("returns success for any ID", async () => {
      const result = await addressApi.setDefault("addr-1");
      expect(result.success).toBe(true);
      expect(result.message).toBe("Default address updated successfully");
    });
  });
});
