"use client";

import { useState } from "react";
import SellerDashboardLayout from "@/components/seller/SellerLayout";
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
import { Plus } from "lucide-react";

export default function AddNewProductPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  return (
    <SellerDashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

          <div className="space-y-6">
            {/* Product Images */}
            <div>
              <Label className="text-sm font-semibold">
                Product Images <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-start space-x-4">
                <button className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Add Photo</span>
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="text-red-500">*</span> 1:1 Image
                  </p>
                </div>
              </div>
            </div>

            {/* Product Videos */}
            <div>
              <Label className="text-sm font-semibold">
                Product Videos <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-start space-x-4">
                <button className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Add Video</span>
                </button>
                <div className="flex-1 text-xs text-gray-500 space-y-1">
                  <p>
                    • Size: Max 30Mb, resolution should not exceed 1280x1280p
                  </p>
                  <p>• Duration: 10s-60s</p>
                  <p>• Format: MP4</p>
                  <p>
                    • Note: You can publish this listing while the video is
                    being processed.
                  </p>
                  <p>
                    Video will be shown in listing once successfully processed.
                  </p>
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <Label htmlFor="productName" className="text-sm font-semibold">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="Brand Name + Product Type + Key Features (Materials, Coors, Size model)"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="category" className="text-sm font-semibold">
                  Category <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-gray-500">0/3000</span>
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Please select a Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresh">Fresh Mushrooms</SelectItem>
                  <SelectItem value="dried">Dried Mushrooms</SelectItem>
                  <SelectItem value="processed">Processed Products</SelectItem>
                  <SelectItem value="growing">Growing Kits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                Product Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Please enter product description characters or add images"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-32"
              />
            </div>
          </div>
        </div>

        {/* Filling Suggestion Sidebar */}
        <div className="bg-[#1E392A] text-white rounded-lg shadow-sm p-6 h-fit sticky top-24">
          <h3 className="text-lg font-semibold mb-4">Filling Suggestion</h3>
          <ul className="space-y-3 text-sm">
            <li>Add at least 3 images</li>
            <li>Add video</li>
            <li>Add characters for name to 25-100</li>
            <li>Add at least 100 characters or 1 image for description</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-4 bg-white p-6 rounded-lg shadow-sm">
        <Button variant="outline" className="px-8">
          Save
        </Button>
        <Button className="px-8 bg-[#1E392A] hover:bg-[#1E392A]/90">
          Publish
        </Button>
      </div>
    </SellerDashboardLayout>
  );
}
