"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  Loader2,
  Info,
} from "lucide-react";
import { useFirebaseOrder } from "@/hooks/useFirebaseOrders";
import { FirebaseOrdersService } from "@/lib/firebase/orders";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { LALAMOVE_VEHICLES, calculateEstimate } from "@/lib/lalamove/vehicle-types";
import { useAuth } from "@/contexts/AuthContext";
import LalamoveTrackingTimeline from "@/components/seller/LalamoveTrackingTimeline";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

// MASH Pickup Location
const MASH_PICKUP_LOCATION = {
  lat: 14.6760,
  lng: 121.0437,
  address: "MASH Farm, Quezon City, Metro Manila",
};

// Status configuration
const STATUS_CONFIG = {
  pending_approval: {
    label: "Pending Approval",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  processing: {
    label: "Processing",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    icon: Package,
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50 border-cyan-200",
    icon: MapPin,
  },
  shipped: {
    label: "Shipped",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 border-indigo-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "text-gray-700",
    bgColor: "bg-gray-50 border-gray-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: XCircle,
  },
} as const;

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = params.id as string;

  const { order, loading, error } = useFirebaseOrder(orderId);
  const [actioning, setActioning] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("sedan");
  const [mapLoaded, setMapLoaded] = useState(false);
  const riderMarkerRef = useRef<any>(null); // Store rider marker reference

  // Load Google Maps Script
  useEffect(() => {
    // Check if Google Maps is already loaded
    if ((window as any).google?.maps) {
      setMapLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    
    if (existingScript) {
      existingScript.addEventListener("load", () => setMapLoaded(true));
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Google Maps");
      toast.error("Failed to load map");
    };
    document.head.appendChild(script);
  }, []);

  // Initialize map when order and script are loaded
  useEffect(() => {
    if (!mapLoaded || !order || order.deliveryMethod !== "lalamove") return;

    const initMap = () => {
      const mapElement = document.getElementById("order-map");
      if (!mapElement || !(window as any).google) return;

      const google = (window as any).google;
      const pickup = MASH_PICKUP_LOCATION;
      const dropoff = order.deliveryAddress;

      if (!dropoff?.lat || !dropoff?.lng) return;

      // Initialize map
      const map = new google.maps.Map(mapElement, {
        zoom: 12,
        center: { lat: pickup.lat, lng: pickup.lng },
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
      });

      // Pickup marker
      new google.maps.Marker({
        position: { lat: pickup.lat, lng: pickup.lng },
        map: map,
        title: "Pickup: MASH Farm",
        label: {
          text: "P",
          color: "white",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 3,
          scale: 12,
        },
      });

      // Dropoff marker
      new google.maps.Marker({
        position: { lat: dropoff.lat, lng: dropoff.lng },
        map: map,
        title: `Delivery: ${dropoff.address}`,
        label: {
          text: "D",
          color: "white",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 3,
          scale: 12,
        },
      });

      // Draw route
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#3b82f6",
          strokeWeight: 4,
          strokeOpacity: 0.7,
        },
      });

      directionsService.route(
        {
          origin: { lat: pickup.lat, lng: pickup.lng },
          destination: { lat: dropoff.lat, lng: dropoff.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result);
          }
        }
      );

      // Store map reference for rider marker updates
      (window as any).lalamoveOrderMap = map;
    };

    initMap();
  }, [mapLoaded, order]);

  // Update rider marker when tracking data changes
  useEffect(() => {
    if (!mapLoaded || !order?.lalamoveTracking?.driver?.coordinates) return;

    const google = (window as any).google;
    const map = (window as any).lalamoveOrderMap;
    if (!google || !map) return;

    const riderCoords = order.lalamoveTracking.driver.coordinates;

    // Create or update rider marker
    if (!riderMarkerRef.current) {
      riderMarkerRef.current = new google.maps.Marker({
        position: { lat: riderCoords.lat, lng: riderCoords.lng },
        map: map,
        title: `Rider: ${order.lalamoveTracking.driver.name}`,
        label: {
          text: "R",
          color: "white",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#f97316", // Orange
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 3,
          scale: 12,
        },
        animation: google.maps.Animation.DROP,
      });
    } else {
      // Smoothly animate marker to new position
      riderMarkerRef.current.setPosition({
        lat: riderCoords.lat,
        lng: riderCoords.lng,
      });
    }

    // Auto-center map on rider (optional - can be toggled)
    if (order.lalamoveTracking.status === "ON_GOING" || order.lalamoveTracking.status === "PICKED_UP") {
      map.panTo({ lat: riderCoords.lat, lng: riderCoords.lng });
    }
  }, [mapLoaded, order?.lalamoveTracking?.driver?.coordinates]);

  const handleApproveOrder = async () => {
    if (!order) return;
    setActioning(true);
    try {
      await FirebaseOrdersService.updateOrderStatus(
        order.id,
        "approved",
        user?.id || "seller-admin"
      );
      toast.success("Order approved successfully");
    } catch (error) {
      toast.error("Failed to approve order");
      console.error(error);
    } finally {
      setActioning(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!order) return;
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    setActioning(true);
    try {
      await FirebaseOrdersService.rejectOrder(order.id, user?.id || "seller-admin", reason);
      toast.success("Order rejected");
    } catch (error) {
      toast.error("Failed to reject order");
      console.error(error);
    } finally {
      setActioning(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    setActioning(true);
    try {
      await FirebaseOrdersService.updateOrderStatus(
        order.id,
        newStatus as any,
        user?.id || "seller-admin"
      );
      toast.success(`Order status updated to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      toast.error("Failed to update order status");
      console.error(error);
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Order not found</h3>
                <p className="text-sm">{error || "The order you're looking for doesn't exist."}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/seller/orders")}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig.icon;

  // Calculate estimated cost for selected vehicle
  const estimatedDistance = 10; // Default estimate for delivery
  const estimatedCost = calculateEstimate(selectedVehicle, estimatedDistance);
  const selectedVehicleData = LALAMOVE_VEHICLES.find((v) => v.id === selectedVehicle);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/seller/orders")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>
        <Badge
          variant="secondary"
          className={`${statusConfig.color} ${statusConfig.bgColor} px-4 py-2 text-base`}
        >
          <StatusIcon className="h-4 w-4 mr-2" />
          {statusConfig.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-lg border bg-muted/20">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted border">
                      <img
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Qty: <span className="font-medium text-foreground">{item.quantity}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Price: <span className="font-medium text-foreground">₱{item.price.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-foreground">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₱{order.subtotal.toLocaleString()}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">₱{order.deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₱{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          {order.deliveryMethod === "lalamove" && order.deliveryAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Lalamove Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Map */}
                <div className="w-full h-[400px] rounded-lg overflow-hidden border bg-muted relative">
                  <div id="order-map" className="w-full h-full"></div>
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Route Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      Pickup Location
                    </div>
                    <p className="text-sm text-muted-foreground pl-5">
                      {MASH_PICKUP_LOCATION.address}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      Delivery Address
                    </div>
                    <p className="text-sm text-muted-foreground pl-5">
                      {order.deliveryAddress.address}
                    </p>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">Select Vehicle Type</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LALAMOVE_VEHICLES.map((vehicle) => {
                      const isSelected = selectedVehicle === vehicle.id;
                      const estimate = calculateEstimate(vehicle.id, estimatedDistance);

                      return (
                        <TooltipProvider key={vehicle.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setSelectedVehicle(vehicle.id)}
                                className={`
                                  relative p-4 rounded-lg border-2 text-left transition-all
                                  ${
                                    isSelected
                                      ? "border-primary bg-primary/5 shadow-md"
                                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                                  }
                                `}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-3xl">{vehicle.image}</span>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-sm truncate">
                                      {vehicle.name}
                                    </h5>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Up to {vehicle.weightLimit}kg
                                    </p>
                                    <p className="text-sm font-bold text-primary mt-2">
                                      ~₱{estimate.toLocaleString()}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-2 text-xs">
                                <p className="font-semibold">{vehicle.name}</p>
                                <p>{vehicle.description}</p>
                                <div className="space-y-1 pt-2 border-t">
                                  <p><span className="font-medium">Base Fare:</span> ₱{vehicle.baseFare}</p>
                                  <p><span className="font-medium">Per KM:</span> {vehicle.pricePerKm}</p>
                                  <p><span className="font-medium">Add Stop:</span> ₱{vehicle.addStopFee}</p>
                                  <p><span className="font-medium">Weight Limit:</span> {vehicle.weightLimit}kg</p>
                                  <p><span className="font-medium">Size Limit:</span> {vehicle.sizeLimit}</p>
                                  {vehicle.longDistanceFare && (
                                    <p className="pt-1 border-t">
                                      <span className="font-medium">Long Distance:</span> {vehicle.longDistanceFare}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>

                  {selectedVehicleData && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="font-medium">{selectedVehicleData.name} - Estimated ₱{estimatedCost.toLocaleString()}</p>
                          <p className="text-xs">{selectedVehicleData.description}</p>
                          <p className="text-xs italic mt-2">{selectedVehicleData.surcharge}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lalamove Real-Time Tracking Timeline */}
          {order.deliveryMethod === "lalamove" && order.lalamoveTracking && (
            <LalamoveTrackingTimeline
              tracking={order.lalamoveTracking}
              onRefresh={async () => {
                // TODO: Implement refresh from Lalamove API
                console.log("Refresh tracking data");
              }}
            />
          )}

          {/* Pickup Information */}
          {order.deliveryMethod === "pickup" && order.pickupLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pickup Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{order.pickupLocation.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((entry, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        {idx < order.statusHistory!.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm">
                          {entry.status.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(entry.timestamp.toDate(), "MMM dd, yyyy 'at' hh:mm a")}
                        </p>
                        {entry.note && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No timeline available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Actions */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {order.userName}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${order.userEmail}`} className="text-primary hover:underline">
                    {order.userEmail}
                  </a>
                </p>
              </div>
              <Separator />
              {order.userPhone && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${order.userPhone}`} className="text-primary hover:underline">
                      {order.userPhone}
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === "pending_approval" && (
                <>
                  <Button
                    onClick={handleApproveOrder}
                    disabled={actioning}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {actioning ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve Order
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRejectOrder}
                    disabled={actioning}
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {actioning ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject Order
                  </Button>
                </>
              )}

              {order.status === "approved" && (
                <Button
                  onClick={() => handleUpdateStatus("processing")}
                  disabled={actioning}
                  className="w-full"
                >
                  {actioning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  Mark as Processing
                </Button>
              )}

              {order.status === "processing" && (
                <Button
                  onClick={() =>
                    handleUpdateStatus(
                      order.deliveryMethod === "pickup" ? "ready_for_pickup" : "shipped"
                    )
                  }
                  disabled={actioning}
                  className="w-full"
                >
                  {actioning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : order.deliveryMethod === "pickup" ? (
                    <MapPin className="h-4 w-4 mr-2" />
                  ) : (
                    <Truck className="h-4 w-4 mr-2" />
                  )}
                  {order.deliveryMethod === "pickup" ? "Ready for Pickup" : "Mark as Shipped"}
                </Button>
              )}

              {(order.status === "shipped" || order.status === "ready_for_pickup") && (
                <Button
                  onClick={() => handleUpdateStatus("delivered")}
                  disabled={actioning}
                  className="w-full"
                >
                  {actioning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark as Delivered
                </Button>
              )}

              {order.status === "delivered" && (
                <Button
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={actioning}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {actioning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Complete Order
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Method</p>
                <p className="font-medium uppercase">{order.paymentMethod.replace("_", " ")}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    order.paymentStatus === "paid"
                      ? "default"
                      : order.paymentStatus === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-mono text-xs">{order.id}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-muted-foreground">Placed On</p>
                <p className="font-medium">
                  {format(order.createdAt?.toDate() || new Date(), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
              {order.updatedAt && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {format(order.updatedAt.toDate(), "MMM dd, yyyy 'at' hh:mm a")}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
