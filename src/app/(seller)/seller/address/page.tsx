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
import { MapPin, Plus, Edit, Trash, Star } from "lucide-react";
import { GoogleMapsPicker } from "@/components/ui/google-maps-picker";
import {
  getRegions,
  getCitiesByRegion,
  getBarangaysByCity,
  type Region,
  type City,
  type Barangay,
} from "@/lib/locations";

interface AddressFormData {
  id?: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  barangay: string;
  barangayCode: string;
  city: string;
  cityCode: string;
  region: string;
  regionCode: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// Sample addresses for demonstration
const SAMPLE_ADDRESSES: AddressFormData[] = [
  {
    id: "1",
    name: "Main Store",
    contactPerson: "Juan Dela Cruz",
    phone: "09123456789",
    address: "123 Main Street",
    barangay: "Diliman",
    barangayCode: "QC_DILIMAN",
    city: "Quezon City",
    cityCode: "QUEZON_CITY",
    region: "National Capital Region",
    regionCode: "NCR",
    province: "Metro Manila",
    postalCode: "1100",
    isDefault: true,
  },
  {
    id: "2",
    name: "Warehouse",
    contactPerson: "Maria Santos",
    phone: "09987654321",
    address: "456 Warehouse Road",
    barangay: "Balibago",
    barangayCode: "AC_BALIBAGO",
    city: "Angeles City",
    cityCode: "ANGELES_CITY",
    region: "Central Luzon",
    regionCode: "REGION_III",
    province: "Pampanga",
    postalCode: "2009",
    isDefault: false,
  },
];

const EMPTY_ADDRESS: AddressFormData = {
  name: "",
  contactPerson: "",
  phone: "",
  address: "",
  barangay: "",
  barangayCode: "",
  city: "",
  cityCode: "",
  region: "",
  regionCode: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

export default function AddressManagement() {
  const [addresses, setAddresses] =
    useState<AddressFormData[]>(SAMPLE_ADDRESSES);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] =
    useState<AddressFormData>(EMPTY_ADDRESS);

  // Cascading dropdown states
  const [regions] = useState<Region[]>(getRegions());
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [availableBarangays, setAvailableBarangays] = useState<Barangay[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  // Reset cascading states
  const resetLocationStates = () => {
    setSelectedRegion("");
    setSelectedCity("");
    setAvailableCities([]);
    setAvailableBarangays([]);
  };

  // Handle region change
  const handleRegionChange = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setSelectedCity("");
    setAvailableBarangays([]);

    const cities = getCitiesByRegion(regionCode);
    setAvailableCities(cities);

    const selectedRegionData = regions.find((r) => r.code === regionCode);

    setCurrentAddress((prev) => ({
      ...prev,
      region: selectedRegionData?.name || "",
      regionCode: regionCode,
      city: "",
      cityCode: "",
      barangay: "",
      barangayCode: "",
      province: "",
    }));
  };

  // Handle city change
  const handleCityChange = (cityCode: string) => {
    setSelectedCity(cityCode);
    setAvailableBarangays([]);

    const barangays = getBarangaysByCity(selectedRegion, cityCode);
    setAvailableBarangays(barangays);

    const selectedCityData = availableCities.find((c) => c.code === cityCode);

    setCurrentAddress((prev) => ({
      ...prev,
      city: selectedCityData?.name || "",
      cityCode: cityCode,
      province: selectedCityData?.provinceName || prev.province,
      postalCode: selectedCityData?.postalCode || prev.postalCode,
      barangay: "",
      barangayCode: "",
    }));
  };

  // Handle barangay change
  const handleBarangayChange = (barangayCode: string) => {
    const selectedBarangayData = availableBarangays.find(
      (b) => b.code === barangayCode
    );
    setCurrentAddress((prev) => ({
      ...prev,
      barangay: selectedBarangayData?.name || "",
      barangayCode: barangayCode,
    }));
  };

  // Dialog handlers
  const handleAddAddress = () => {
    setCurrentAddress(EMPTY_ADDRESS);
    resetLocationStates();
    setIsAddDialogOpen(true);
  };

  const handleEditAddress = (address: AddressFormData) => {
    setCurrentAddress(address);

    // Initialize cascading states
    const initialRegionCode = address.regionCode;
    const initialCityCode = address.cityCode;

    setSelectedRegion(initialRegionCode);
    setSelectedCity(initialCityCode);

    if (initialRegionCode) {
      const cities = getCitiesByRegion(initialRegionCode);
      setAvailableCities(cities);

      if (initialCityCode) {
        const barangays = getBarangaysByCity(
          initialRegionCode,
          initialCityCode
        );
        setAvailableBarangays(barangays);
      }
    }

    setIsEditDialogOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentAddress.id) {
      // Edit existing address
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === currentAddress.id ? currentAddress : addr
        )
      );
      setIsEditDialogOpen(false);
    } else {
      // Add new address
      const newAddress = {
        ...currentAddress,
        id: Date.now().toString(),
      };
      setAddresses((prev) => [...prev, newAddress]);
      setIsAddDialogOpen(false);
    }

    setCurrentAddress(EMPTY_ADDRESS);
    resetLocationStates();
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  // Address Form Fields Component
  const AddressFormFields = ({ isEdit }: { isEdit: boolean }) => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? "edit-name" : "name"}>Address Name</Label>
          <Input
            id={isEdit ? "edit-name" : "name"}
            placeholder="e.g., Main Store, Warehouse"
            value={currentAddress.name}
            onChange={(e) =>
              setCurrentAddress({ ...currentAddress, name: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor={isEdit ? "edit-contactPerson" : "contactPerson"}>
            Contact Person
          </Label>
          <Input
            id={isEdit ? "edit-contactPerson" : "contactPerson"}
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

        <div className="col-span-1 md:col-span-2">
          <Label htmlFor={isEdit ? "edit-phone" : "phone"}>Phone Number</Label>
          <Input
            id={isEdit ? "edit-phone" : "phone"}
            placeholder="e.g., 09123456789"
            value={currentAddress.phone}
            onChange={(e) =>
              setCurrentAddress({ ...currentAddress, phone: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor={isEdit ? "edit-address" : "address"}>
            Street Address
          </Label>
          <Textarea
            id={isEdit ? "edit-address" : "address"}
            placeholder="House/Unit number, street name"
            value={currentAddress.address}
            onChange={(e) =>
              setCurrentAddress({ ...currentAddress, address: e.target.value })
            }
            required
          />
        </div>

        {/* Google Maps Picker only in Add Dialog */}
        {!isEdit && (
          <div>
            <Label>Location on Map (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Use the interactive map to select your exact location
            </p>
            <GoogleMapsPicker
              onLocationSelect={(location) => {
                setCurrentAddress((prev) => ({
                  ...prev,
                  address: location.address,
                  barangay: location.barangay,
                  city: location.city,
                  province: location.province,
                }));
              }}
            />
          </div>
        )}

        {/* Cascading Location Selects */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={isEdit ? "edit-region" : "region"}>Region</Label>
            <Select
              value={selectedRegion}
              onValueChange={handleRegionChange}
              required
            >
              <SelectTrigger id={isEdit ? "edit-region" : "region"}>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={isEdit ? "edit-city" : "city"}>
              City/Municipality
            </Label>
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
              disabled={!selectedRegion}
              required
            >
              <SelectTrigger id={isEdit ? "edit-city" : "city"}>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={isEdit ? "edit-barangay" : "barangay"}>
              Barangay
            </Label>
            <Select
              value={currentAddress.barangayCode}
              onValueChange={handleBarangayChange}
              disabled={!selectedCity}
              required
            >
              <SelectTrigger id={isEdit ? "edit-barangay" : "barangay"}>
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
                {availableBarangays.map((barangay) => (
                  <SelectItem key={barangay.code} value={barangay.code}>
                    {barangay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={isEdit ? "edit-postalCode" : "postalCode"}>
              Postal Code
            </Label>
            <Input
              id={isEdit ? "edit-postalCode" : "postalCode"}
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

        {/* Province display (read-only) */}
        <div>
          <Label htmlFor={isEdit ? "edit-province" : "province"}>
            Province
          </Label>
          <Input
            id={isEdit ? "edit-province" : "province"}
            placeholder="Province (Auto-filled)"
            value={currentAddress.province}
            readOnly
            className="bg-muted cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Address Management</h1>
        <Button
          onClick={handleAddAddress}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={address.isDefault ? "border-2 border-[#6A994E]" : ""}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {address.name}
                    {address.isDefault && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
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
                          onClick={() => handleDeleteAddress(address.id!)}
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
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {address.address}
                    {address.barangay && `, ${address.barangay}`},
                    {address.city && ` ${address.city}`},
                    {address.province && ` ${address.province}`}
                    {address.postalCode && ` ${address.postalCode}`}
                  </span>
                </p>
                <p className="text-muted-foreground">Phone: {address.phone}</p>
              </div>

              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-primary border-primary hover:bg-primary/5"
                  onClick={() => handleSetDefaultAddress(address.id!)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Add a new address for your store or warehouse.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAddress}>
            <AddressFormFields isEdit={false} />
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
              >
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your address information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAddress}>
            <AddressFormFields isEdit={true} />
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
              >
                Update Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
