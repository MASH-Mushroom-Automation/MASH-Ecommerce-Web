"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Plus, Edit, Trash, Info, MapPin, Clock } from "lucide-react";

// Sample handover center data
// This would be replaced with API data in production
const HANDOVER_CENTERS = [
  {
    id: "1",
    name: "MASH Makati Hub",
    address: "123 Ayala Avenue, Makati City",
    operatingHours: "9:00 AM - 6:00 PM",
    daysOpen: "Monday - Saturday",
    contactNumber: "09123456789",
    isActive: true,
  },
  {
    id: "2",
    name: "MASH BGC Center",
    address: "456 Bonifacio High Street, Taguig City",
    operatingHours: "10:00 AM - 7:00 PM",
    daysOpen: "Monday - Sunday",
    contactNumber: "09987654321",
    isActive: true,
  },
  {
    id: "3",
    name: "MASH Quezon City Hub",
    address: "789 Katipunan Avenue, Quezon City",
    operatingHours: "9:00 AM - 5:00 PM",
    daysOpen: "Monday - Friday",
    contactNumber: "09123498765",
    isActive: false,
  },
];

interface HandoverCenterFormData {
  id?: string;
  name: string;
  address: string;
  operatingHours: string;
  daysOpen: string;
  contactNumber: string;
  isActive: boolean;
}

export default function HandoverCenterPickup() {
  const [handoverCenters, setHandoverCenters] = useState(HANDOVER_CENTERS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<HandoverCenterFormData>({
    name: "",
    address: "",
    operatingHours: "",
    daysOpen: "",
    contactNumber: "",
    isActive: true,
  });

  const handleAddCenter = () => {
    // Reset form
    setCurrentCenter({
      name: "",
      address: "",
      operatingHours: "",
      daysOpen: "",
      contactNumber: "",
      isActive: true,
    });
    setIsAddDialogOpen(true);
  };

  const handleEditCenter = (center: HandoverCenterFormData) => {
    setCurrentCenter({
      ...center,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real application, you would send this data to your API
    console.log("Handover center data to submit:", currentCenter);

    // Mock implementation to update the UI
    if (currentCenter.id) {
      // Edit existing center
      setHandoverCenters((centers) =>
        centers.map((c) =>
          c.id === currentCenter.id
            ? { ...currentCenter, id: currentCenter.id! }
            : c
        )
      );
    } else {
      // Add new center
      const newCenter = {
        ...currentCenter,
        id: `${handoverCenters.length + 1}`,
      };
      setHandoverCenters([...handoverCenters, newCenter]);
    }

    // Close dialogs
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleDeleteCenter = (id: string) => {
    // In a real application, you would send a delete request to your API

    // Mock implementation to update the UI
    setHandoverCenters((centers) => centers.filter((c) => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    // In a real application, you would send this update to your API

    // Mock implementation to update the UI
    setHandoverCenters((centers) =>
      centers.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Handover Center Pickup
        </h1>
        <Button
          onClick={handleAddCenter}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Handover Center
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold">Handover Centers for Easy Pickup</p>
          <p className="mt-1">
            Configure handover centers where customers can pick up their orders.
            This can be your store locations or partner pickup points.
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Centers</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Centers</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {handoverCenters
              .filter((c) => c.isActive)
              .map((center) => (
                <HandoverCenterCard
                  key={center.id}
                  center={center}
                  onEdit={() => handleEditCenter(center)}
                  onDelete={() => handleDeleteCenter(center.id)}
                  onToggleActive={() => handleToggleActive(center.id)}
                />
              ))}
            {handoverCenters.filter((c) => c.isActive).length === 0 && (
              <div className="col-span-2 text-center py-12 bg-muted rounded-lg border border-dashed border-border">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No Active Handover Centers
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add a handover center to allow customers to pick up their
                  orders.
                </p>
                <Button
                  onClick={handleAddCenter}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Handover Center
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {handoverCenters
              .filter((c) => !c.isActive)
              .map((center) => (
                <HandoverCenterCard
                  key={center.id}
                  center={center}
                  onEdit={() => handleEditCenter(center)}
                  onDelete={() => handleDeleteCenter(center.id)}
                  onToggleActive={() => handleToggleActive(center.id)}
                />
              ))}
            {handoverCenters.filter((c) => !c.isActive).length === 0 && (
              <div className="col-span-2 text-center py-12 bg-muted rounded-lg border border-dashed border-border">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No Inactive Handover Centers
                </h3>
                <p className="text-muted-foreground">
                  All your handover centers are currently active.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Handover Center Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Handover Center</DialogTitle>
            <DialogDescription>
              Create a new pickup location for your customers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCenter}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Center Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., MASH Makati Hub"
                    value={currentCenter.name}
                    onChange={(e) =>
                      setCurrentCenter({
                        ...currentCenter,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Full address"
                    value={currentCenter.address}
                    onChange={(e) =>
                      setCurrentCenter({
                        ...currentCenter,
                        address: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    placeholder="e.g., 9:00 AM - 6:00 PM"
                    value={currentCenter.operatingHours}
                    onChange={(e) =>
                      setCurrentCenter({
                        ...currentCenter,
                        operatingHours: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="daysOpen">Days Open</Label>
                  <Select
                    value={currentCenter.daysOpen}
                    onValueChange={(daysOpen) =>
                      setCurrentCenter({ ...currentCenter, daysOpen })
                    }
                    required
                  >
                    <SelectTrigger id="daysOpen">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday - Friday">
                        Monday - Friday
                      </SelectItem>
                      <SelectItem value="Monday - Saturday">
                        Monday - Saturday
                      </SelectItem>
                      <SelectItem value="Monday - Sunday">
                        Monday - Sunday
                      </SelectItem>
                      <SelectItem value="Weekends Only">
                        Weekends Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    placeholder="e.g., 09123456789"
                    value={currentCenter.contactNumber}
                    onChange={(e) =>
                      setCurrentCenter({
                        ...currentCenter,
                        contactNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={currentCenter.isActive}
                    onCheckedChange={(checked) =>
                      setCurrentCenter({ ...currentCenter, isActive: checked })
                    }
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
              >
                Save Center
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Handover Center Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Handover Center</DialogTitle>
            <DialogDescription>
              Update your handover center information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCenter}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-name">Center Name</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., MASH Makati Hub"
                    value={currentCenter.name}
                    onChange={(e) =>
                      setCurrentCenter({
                        ...currentCenter,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    placeholder="Full address"
                    value={currentCenter.address}
                    onChange={(e) =>
                      setCurrentCenter({
                        ...currentCenter,
                        address: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-operatingHours">Operating Hours</Label>
                  <Input
                    id="edit-operatingHours"
                    placeholder="e.g., 9:00 AM - 6:00 PM"
                    value={currentCenter.operatingHours}
                    onChange={(e) =>
                      setCurrentCenter({
                        ...currentCenter,
                        operatingHours: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-daysOpen">Days Open</Label>
                  <Select
                    value={currentCenter.daysOpen}
                    onValueChange={(daysOpen) =>
                      setCurrentCenter({ ...currentCenter, daysOpen })
                    }
                    required
                  >
                    <SelectTrigger id="edit-daysOpen">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday - Friday">
                        Monday - Friday
                      </SelectItem>
                      <SelectItem value="Monday - Saturday">
                        Monday - Saturday
                      </SelectItem>
                      <SelectItem value="Monday - Sunday">
                        Monday - Sunday
                      </SelectItem>
                      <SelectItem value="Weekends Only">
                        Weekends Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-contactNumber">Contact Number</Label>
                  <Input
                    id="edit-contactNumber"
                    placeholder="e.g., 09123456789"
                    value={currentCenter.contactNumber}
                    onChange={(e) =>
                      setCurrentCenter({
                        ...currentCenter,
                        contactNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-isActive">Active</Label>
                  <Switch
                    id="edit-isActive"
                    checked={currentCenter.isActive}
                    onCheckedChange={(checked) =>
                      setCurrentCenter({ ...currentCenter, isActive: checked })
                    }
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
              >
                Update Center
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Integration Comment */}
      {/* 
        API Integration Points:
        1. Fetch handover centers from backend: 
           - GET /api/seller/handover-centers
        2. Add new handover center:
           - POST /api/seller/handover-centers with center data
        3. Update handover center:
           - PUT /api/seller/handover-centers/:id with updated data
        4. Delete handover center:
           - DELETE /api/seller/handover-centers/:id
        5. Toggle center active status:
           - PUT /api/seller/handover-centers/:id/toggle-status
      */}
    </div>
  );
}

interface HandoverCenterCardProps {
  center: {
    id: string;
    name: string;
    address: string;
    operatingHours: string;
    daysOpen: string;
    contactNumber: string;
    isActive: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function HandoverCenterCard({
  center,
  onEdit,
  onDelete,
  onToggleActive,
}: HandoverCenterCardProps) {
  return (
    <Card className={center.isActive ? "" : "bg-muted"}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{center.name}</CardTitle>
            <CardDescription>{center.contactNumber}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Handover Center</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this handover center? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={onDelete}
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
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm">{center.address}</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm">{center.operatingHours}</p>
              <p className="text-xs text-muted-foreground">{center.daysOpen}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              center.isActive ? "bg-green-600 dark:bg-green-500" : "bg-muted-foreground"
            }`}
          ></div>
          <span
            className={`text-sm ${
              center.isActive ? "text-green-700 dark:text-green-600" : "text-muted-foreground"
            }`}
          >
            {center.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onToggleActive}>
          {center.isActive ? "Deactivate" : "Activate"}
        </Button>
      </CardFooter>
    </Card>
  );
}
