"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Plus, Edit, Trash } from "lucide-react";

// Sample address data
// This would be replaced with API data in production
const SAMPLE_ADDRESSES = [
  {
    id: "1",
    name: "Main Store",
    contactPerson: "John Doe",
    phone: "09123456789",
    address: "123 Mushroom St.",
    barangay: "San Lorenzo",
    city: "Makati City",
    region: "Metro Manila",
    province: "Metro Manila",
    postalCode: "1234",
    isDefault: true,
  },
  {
    id: "2",
    name: "Warehouse",
    contactPerson: "Jane Smith",
    phone: "09987654321",
    address: "456 Fungi Ave.",
    barangay: "Poblacion",
    city: "Taguig City",
    region: "Metro Manila",
    province: "Metro Manila",
    postalCode: "1634",
    isDefault: false,
  },
];

// Sample regions and provinces
const REGIONS = ["Metro Manila", "Calabarzon", "Central Luzon", "Bicol Region"];
const PROVINCES = {
  "Metro Manila": ["Metro Manila"],
  Calabarzon: ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal"],
  "Central Luzon": [
    "Aurora",
    "Bataan",
    "Bulacan",
    "Nueva Ecija",
    "Pampanga",
    "Tarlac",
    "Zambales",
  ],
  "Bicol Region": [
    "Albay",
    "Camarines Norte",
    "Camarines Sur",
    "Catanduanes",
    "Masbate",
    "Sorsogon",
  ],
};

interface AddressFormData {
  id?: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  barangay: string;
  city: string;
  region: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressManagement() {
  const [addresses, setAddresses] = useState(SAMPLE_ADDRESSES);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<AddressFormData>({
    name: "",
    contactPerson: "",
    phone: "",
    address: "",
    barangay: "",
    city: "",
    region: "",
    province: "",
    postalCode: "",
    isDefault: false,
  });
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const handleAddAddress = () => {
    // Reset form
    setCurrentAddress({
      name: "",
      contactPerson: "",
      phone: "",
      address: "",
      barangay: "",
      city: "",
      region: "",
      province: "",
      postalCode: "",
      isDefault: false,
    });
    setSelectedRegion("");
    setIsAddDialogOpen(true);
  };

  const handleEditAddress = (address: AddressFormData) => {
    setCurrentAddress({
      ...address,
      region: address.province === "Metro Manila" ? "Metro Manila" : "", // Assuming region based on province
    });
    setSelectedRegion(
      address.province === "Metro Manila" ? "Metro Manila" : ""
    );
    setIsEditDialogOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real application, you would send this data to your API
    console.log("Address data to submit:", currentAddress);

    // Mock implementation to update the UI
    if (currentAddress.id) {
      // Edit existing address
      setAddresses(
        addresses.map((addr) =>
          addr.id === currentAddress.id
            ? {
                ...currentAddress,
                id: currentAddress.id!,
                province: currentAddress.province,
              }
            : addr
        )
      );
    } else {
      // Add new address
      const newAddress = {
        ...currentAddress,
        id: `${addresses.length + 1}`,
        province: currentAddress.province,
      };
      setAddresses([...addresses, newAddress]);
    }

    // Close dialogs
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    // In a real application, you would send a delete request to your API

    // Mock implementation to update the UI
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    // In a real application, you would send this update to your API

    // Mock implementation to update the UI
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setCurrentAddress({
      ...currentAddress,
      region,
      province: "", // Reset province when region changes
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Address Management</h1>
        <Button
          onClick={handleAddAddress}
          className="bg-[#1E392A] hover:bg-[#1E392A]/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={address.isDefault ? "border-[#6A994E]" : ""}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {address.name}
                    {address.isDefault && (
                      <span className="text-xs bg-[#6A994E] text-white px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{address.contactPerson}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditAddress(address)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this address? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {address.address}, {address.barangay}, {address.city},{" "}
                    {address.province} {address.postalCode}
                  </span>
                </p>
                <p className="text-gray-500">Phone: {address.phone}</p>
              </div>

              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-[#1E392A] border-[#1E392A]"
                  onClick={() => handleSetDefaultAddress(address.id)}
                >
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Add a new address for your store or warehouse.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAddress}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Address Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Store, Warehouse"
                    value={currentAddress.name}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Full name"
                    value={currentAddress.contactPerson}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        contactPerson: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="e.g., 09123456789"
                    value={currentAddress.phone}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Textarea
                    id="address"
                    placeholder="House/Unit number, street name"
                    value={currentAddress.address}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        address: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input
                      id="barangay"
                      placeholder="Barangay"
                      value={currentAddress.barangay}
                      onChange={(e) =>
                        setCurrentAddress({
                          ...currentAddress,
                          barangay: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City/Municipality</Label>
                    <Input
                      id="city"
                      placeholder="City/Municipality"
                      value={currentAddress.city}
                      onChange={(e) =>
                        setCurrentAddress({
                          ...currentAddress,
                          city: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={selectedRegion}
                      onValueChange={handleRegionChange}
                    >
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Select
                      value={currentAddress.province}
                      onValueChange={(province) =>
                        setCurrentAddress({ ...currentAddress, province })
                      }
                      disabled={!selectedRegion}
                    >
                      <SelectTrigger id="province">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRegion &&
                          PROVINCES[
                            selectedRegion as keyof typeof PROVINCES
                          ]?.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="e.g., 1234"
                    value={currentAddress.postalCode}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        postalCode: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
              >
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your address information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAddress}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-name">Address Name</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., Main Store, Warehouse"
                    value={currentAddress.name}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-contactPerson">Contact Person</Label>
                  <Input
                    id="edit-contactPerson"
                    placeholder="Full name"
                    value={currentAddress.contactPerson}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        contactPerson: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    placeholder="e.g., 09123456789"
                    value={currentAddress.phone}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-address">Street Address</Label>
                  <Textarea
                    id="edit-address"
                    placeholder="House/Unit number, street name"
                    value={currentAddress.address}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        address: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-barangay">Barangay</Label>
                    <Input
                      id="edit-barangay"
                      placeholder="Barangay"
                      value={currentAddress.barangay}
                      onChange={(e) =>
                        setCurrentAddress({
                          ...currentAddress,
                          barangay: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-city">City/Municipality</Label>
                    <Input
                      id="edit-city"
                      placeholder="City/Municipality"
                      value={currentAddress.city}
                      onChange={(e) =>
                        setCurrentAddress({
                          ...currentAddress,
                          city: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-region">Region</Label>
                    <Select
                      value={selectedRegion}
                      onValueChange={handleRegionChange}
                    >
                      <SelectTrigger id="edit-region">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-province">Province</Label>
                    <Select
                      value={currentAddress.province}
                      onValueChange={(province) =>
                        setCurrentAddress({ ...currentAddress, province })
                      }
                      disabled={!selectedRegion}
                    >
                      <SelectTrigger id="edit-province">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRegion &&
                          PROVINCES[
                            selectedRegion as keyof typeof PROVINCES
                          ]?.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-postalCode">Postal Code</Label>
                  <Input
                    id="edit-postalCode"
                    placeholder="e.g., 1234"
                    value={currentAddress.postalCode}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        postalCode: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
              >
                Update Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Integration Comment */}
      {/* 
        API Integration Points:
        1. Fetch addresses from backend: 
           - GET /api/seller/addresses
        2. Add new address:
           - POST /api/seller/addresses with address data
        3. Update address:
           - PUT /api/seller/addresses/:id with updated data
        4. Delete address:
           - DELETE /api/seller/addresses/:id
        5. Set default address:
           - PUT /api/seller/addresses/:id/default
      */}
    </div>
  );
}
