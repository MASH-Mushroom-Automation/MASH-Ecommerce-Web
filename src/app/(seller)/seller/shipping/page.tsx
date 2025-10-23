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
import { Truck, Plus, Edit, Trash, Info } from "lucide-react";

// Sample shipping channel data
// This would be replaced with API data in production
const SHIPPING_CHANNELS = [
  {
    id: "1",
    name: "Standard Shipping",
    type: "Standard",
    price: 120,
    freeShippingThreshold: 1000,
    isActive: true,
  },
  {
    id: "2",
    name: "Express Delivery",
    type: "Express",
    price: 200,
    freeShippingThreshold: 1500,
    isActive: true,
  },
  {
    id: "3",
    name: "Same Day Delivery",
    type: "Same Day",
    price: 300,
    freeShippingThreshold: 2000,
    isActive: false,
  },
];

interface ShippingChannelFormData {
  id?: string;
  name: string;
  type: string;
  price: string;
  freeShippingThreshold: string;
  isActive: boolean;
}

export default function ShippingChannel() {
  const [shippingChannels, setShippingChannels] = useState(SHIPPING_CHANNELS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<ShippingChannelFormData>(
    {
      name: "",
      type: "",
      price: "",
      freeShippingThreshold: "",
      isActive: true,
    }
  );

  const handleAddChannel = () => {
    // Reset form
    setCurrentChannel({
      name: "",
      type: "",
      price: "",
      freeShippingThreshold: "",
      isActive: true,
    });
    setIsAddDialogOpen(true);
  };

  const handleEditChannel = (channel: (typeof SHIPPING_CHANNELS)[0]) => {
    setCurrentChannel({
      ...channel,
      price: channel.price.toString(),
      freeShippingThreshold: channel.freeShippingThreshold.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real application, you would send this data to your API
    console.log("Shipping channel data to submit:", currentChannel);

    // Mock implementation to update the UI
    if (currentChannel.id) {
      // Edit existing channel
      setShippingChannels((channels) =>
        channels.map((ch) =>
          ch.id === currentChannel.id
            ? {
                ...ch,
                ...currentChannel,
                id: currentChannel.id,
                price: parseFloat(String(currentChannel.price)),
                freeShippingThreshold: parseFloat(
                  String(currentChannel.freeShippingThreshold)
                ),
              }
            : ch
        )
      );
    } else {
      // Add new channel
      const newChannel = {
        ...currentChannel,
        id: `${shippingChannels.length + 1}`,
        price: parseFloat(String(currentChannel.price)),
        freeShippingThreshold: parseFloat(
          String(currentChannel.freeShippingThreshold)
        ),
      };
      setShippingChannels([...shippingChannels, newChannel]);
    }

    // Close dialogs
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleDeleteChannel = (id: string) => {
    // In a real application, you would send a delete request to your API

    // Mock implementation to update the UI
    setShippingChannels((channels) => channels.filter((ch) => ch.id !== id));
  };

  const handleToggleActive = (id: string) => {
    // In a real application, you would send this update to your API

    // Mock implementation to update the UI
    setShippingChannels((channels) =>
      channels.map((ch) =>
        ch.id === id ? { ...ch, isActive: !ch.isActive } : ch
      )
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipping Channel</h1>
        <Button
          onClick={handleAddChannel}
          className="bg-[#1E392A] hover:bg-[#1E392A]/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Shipping Channel
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold">Configure Your Shipping Options</p>
          <p className="mt-1">
            Set up shipping channels to define how your products will be
            delivered to customers. You can offer multiple shipping options with
            different prices and delivery times.
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Channels</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shippingChannels
              .filter((ch) => ch.isActive)
              .map((channel) => (
                <ShippingChannelCard
                  key={channel.id}
                  channel={channel}
                  onEdit={() => handleEditChannel(channel)}
                  onDelete={() => handleDeleteChannel(channel.id)}
                  onToggleActive={() => handleToggleActive(channel.id)}
                />
              ))}
            {shippingChannels.filter((ch) => ch.isActive).length === 0 && (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No Active Shipping Channels
                </h3>
                <p className="text-gray-500 mb-4">
                  Add a shipping channel to start offering delivery options to
                  your customers.
                </p>
                <Button
                  onClick={handleAddChannel}
                  className="bg-[#1E392A] hover:bg-[#1E392A]/90"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Shipping Channel
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shippingChannels
              .filter((ch) => !ch.isActive)
              .map((channel) => (
                <ShippingChannelCard
                  key={channel.id}
                  channel={channel}
                  onEdit={() => handleEditChannel(channel)}
                  onDelete={() => handleDeleteChannel(channel.id)}
                  onToggleActive={() => handleToggleActive(channel.id)}
                />
              ))}
            {shippingChannels.filter((ch) => !ch.isActive).length === 0 && (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No Inactive Shipping Channels
                </h3>
                <p className="text-gray-500">
                  All your shipping channels are currently active.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Shipping Channel Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shipping Channel</DialogTitle>
            <DialogDescription>
              Create a new shipping option for your customers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveChannel}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Channel Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Standard Shipping"
                    value={currentChannel.name}
                    onChange={(e) =>
                      setCurrentChannel({
                        ...currentChannel,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Shipping Type</Label>
                  <Select
                    value={currentChannel.type}
                    onValueChange={(type) =>
                      setCurrentChannel({ ...currentChannel, type })
                    }
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Express">Express</SelectItem>
                      <SelectItem value="Same Day">Same Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Shipping Price (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={currentChannel.price}
                    onChange={(e) =>
                      setCurrentChannel({
                        ...currentChannel,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="freeShippingThreshold">
                    Free Shipping Threshold (₱)
                  </Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={currentChannel.freeShippingThreshold}
                    onChange={(e) =>
                      setCurrentChannel({
                        ...currentChannel,
                        freeShippingThreshold: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Orders above this amount will qualify for free shipping. Set
                    to 0 for no free shipping.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={currentChannel.isActive}
                    onCheckedChange={(checked) =>
                      setCurrentChannel({
                        ...currentChannel,
                        isActive: checked,
                      })
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
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
              >
                Save Channel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Shipping Channel Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shipping Channel</DialogTitle>
            <DialogDescription>
              Update your shipping channel information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveChannel}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-name">Channel Name</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., Standard Shipping"
                    value={currentChannel.name}
                    onChange={(e) =>
                      setCurrentChannel({
                        ...currentChannel,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-type">Shipping Type</Label>
                  <Select
                    value={currentChannel.type}
                    onValueChange={(type) =>
                      setCurrentChannel({ ...currentChannel, type })
                    }
                    required
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Express">Express</SelectItem>
                      <SelectItem value="Same Day">Same Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-price">Shipping Price (₱)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={currentChannel.price}
                    onChange={(e) =>
                      setCurrentChannel({
                        ...currentChannel,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-freeShippingThreshold">
                    Free Shipping Threshold (₱)
                  </Label>
                  <Input
                    id="edit-freeShippingThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={currentChannel.freeShippingThreshold}
                    onChange={(e) =>
                      setCurrentChannel({
                        ...currentChannel,
                        freeShippingThreshold: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Orders above this amount will qualify for free shipping. Set
                    to 0 for no free shipping.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-isActive">Active</Label>
                  <Switch
                    id="edit-isActive"
                    checked={currentChannel.isActive}
                    onCheckedChange={(checked) =>
                      setCurrentChannel({
                        ...currentChannel,
                        isActive: checked,
                      })
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
                className="bg-[#1E392A] hover:bg-[#1E392A]/90"
              >
                Update Channel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Integration Comment */}
      {/* 
        API Integration Points:
        1. Fetch shipping channels from backend: 
           - GET /api/seller/shipping-channels
        2. Add new shipping channel:
           - POST /api/seller/shipping-channels with channel data
        3. Update shipping channel:
           - PUT /api/seller/shipping-channels/:id with updated data
        4. Delete shipping channel:
           - DELETE /api/seller/shipping-channels/:id
        5. Toggle channel active status:
           - PUT /api/seller/shipping-channels/:id/toggle-status
      */}
    </div>
  );
}

interface ShippingChannelCardProps {
  channel: {
    id: string;
    name: string;
    type: string;
    price: number;
    freeShippingThreshold: number;
    isActive: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function ShippingChannelCard({
  channel,
  onEdit,
  onDelete,
  onToggleActive,
}: ShippingChannelCardProps) {
  return (
    <Card className={channel.isActive ? "" : "bg-gray-50"}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{channel.name}</CardTitle>
            <CardDescription>{channel.type}</CardDescription>
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
                  className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Shipping Channel</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this shipping channel? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
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
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Shipping Fee:</span>
            <span className="font-medium">₱{channel.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Free Shipping Over:</span>
            <span className="font-medium">
              ₱{channel.freeShippingThreshold.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              channel.isActive ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
          <span
            className={`text-sm ${
              channel.isActive ? "text-green-600" : "text-gray-500"
            }`}
          >
            {channel.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onToggleActive}>
          {channel.isActive ? "Deactivate" : "Activate"}
        </Button>
      </CardFooter>
    </Card>
  );
}
