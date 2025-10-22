"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, X, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  grower: string;
}

export function CartDropdown() {
  // Mock cart items - replace with global state management later
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Fresh White Oyster Mushrooms",
      price: 120,
      unit: "250g",
      quantity: 2,
      image: "/placeholder.png",
      grower: "FungiFreshFarms",
    },
    {
      id: "2",
      name: "Vibrant Pink Oyster Mushrooms",
      price: 140,
      unit: "250g",
      quantity: 1,
      image: "/placeholder.png",
      grower: "FungiFreshFarms",
    },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative flex items-center hover:text-[#6A994E] transition-colors group">
          <ShoppingCart size={24} className="group-hover:text-[#6A994E]" />
          <span className="text-sm ml-1 hidden sm:block">Cart</span>
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[#6A994E] text-white text-xs">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        {/* Dark Green Header */}
        <div className="bg-[#1E392A] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-white" />
            <SheetTitle className="text-lg font-semibold text-white">
              My Cart
            </SheetTitle>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 bg-white">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Add some delicious fresh mushrooms to get started!
            </p>
            <Link href="/catalog">
              <Button className="bg-[#1E392A] hover:bg-[#1E392A]/90 px-6">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items - White Background */}
            <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Delete Button - Top Right */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-0 right-0 p-1 hover:bg-red-50 rounded transition-colors z-10"
                      aria-label="Remove item"
                    >
                      <X className="h-5 w-5 text-red-500" />
                    </button>

                    <div className="flex gap-4">
                      {/* Product Image - Larger rounded square */}
                      <Link
                        href={`/product/${item.id}`}
                        className="flex-shrink-0"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={120}
                          height={120}
                          className="w-[120px] h-[120px] rounded-lg object-cover"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <Link href={`/product/${item.id}`}>
                          <h4 className="font-semibold text-base text-gray-900 hover:text-[#1E392A] mb-2 pr-6 leading-snug">
                            {item.name}
                          </h4>
                        </Link>

                        <p className="text-sm text-[#6A994E] mb-3">
                          Sold by: @{item.grower}
                        </p>

                        {/* Price and Quantity Row */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col">
                            <p className="text-lg font-bold text-gray-900">
                              ₱{item.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4 text-gray-700" />
                            </button>
                            <span className="text-base font-medium min-w-[24px] text-center text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4 text-gray-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Footer - White Background */}
            <div className="bg-white border-t border-gray-200 px-6 py-6 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-base text-gray-900">
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>

              {/* Buttons - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Clear Cart Button */}
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-medium"
                >
                  Clear Cart
                </Button>

                {/* Checkout Button */}
                <Link href="/checkout" className="block">
                  <Button className="w-full h-12 bg-[#1E392A] hover:bg-[#1E392A]/90 text-white font-medium">
                    Proceed to checkout
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
