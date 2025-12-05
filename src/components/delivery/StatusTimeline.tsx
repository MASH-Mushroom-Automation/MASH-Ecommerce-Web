'use client';

/**
 * Status Timeline Component
 * Visual progress indicator for delivery status
 * Shows 4 stages: Ordered → Driver Assigned → Picked Up → Delivered
 */

import { CheckCircle2, Circle, Package, Truck, MapPin, PartyPopper } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: 'ASSIGNING_DRIVER' | 'ON_GOING' | 'PICKED_UP' | 'COMPLETED' | 'CANCELED';
}

export default function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  // Define timeline stages
  const stages = [
    {
      id: 'ASSIGNING_DRIVER',
      label: 'Order Placed',
      icon: Package,
      description: 'Finding nearby driver',
    },
    {
      id: 'ON_GOING',
      label: 'Driver Assigned',
      icon: Truck,
      description: 'Driver on the way to pickup',
    },
    {
      id: 'PICKED_UP',
      label: 'Picked Up',
      icon: MapPin,
      description: 'Driver heading to delivery',
    },
    {
      id: 'COMPLETED',
      label: 'Delivered',
      icon: PartyPopper,
      description: 'Package delivered successfully',
    },
  ];

  // Determine which stages are completed
  const getStageStatus = (stageId: string): 'completed' | 'current' | 'pending' => {
    const stageOrder = ['ASSIGNING_DRIVER', 'ON_GOING', 'PICKED_UP', 'COMPLETED'];
    const currentIndex = stageOrder.indexOf(currentStatus);
    const stageIndex = stageOrder.indexOf(stageId);

    if (currentStatus === 'CANCELED') {
      return stageIndex === 0 ? 'completed' : 'pending';
    }

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStageColor = (status: 'completed' | 'current' | 'pending'): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 border-green-600 bg-green-50';
      case 'current':
        return 'text-blue-600 border-blue-600 bg-blue-50';
      case 'pending':
        return 'text-gray-400 border-gray-300 bg-gray-50';
    }
  };

  const getLineColor = (fromIndex: number): string => {
    const stageOrder = ['ASSIGNING_DRIVER', 'ON_GOING', 'PICKED_UP', 'COMPLETED'];
    const currentIndex = stageOrder.indexOf(currentStatus);

    if (currentStatus === 'CANCELED') return 'bg-gray-300';
    if (fromIndex < currentIndex) return 'bg-green-600';
    return 'bg-gray-300';
  };

  return (
    <div className="py-6">
      {/* Desktop Timeline (Horizontal) */}
      <div className="hidden md:flex items-start justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 -z-10" />

        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex flex-col items-center flex-1 relative">
              {/* Icon Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 ${getStageColor(status)}
                `}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : status === 'current' ? (
                  <Icon className="h-6 w-6 animate-pulse" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </div>

              {/* Label & Description */}
              <div className="mt-3 text-center">
                <p
                  className={`
                    text-sm font-semibold
                    ${status === 'pending' ? 'text-gray-400' : 'text-gray-900'}
                  `}
                >
                  {stage.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
              </div>

              {/* Connecting Line */}
              {index < stages.length - 1 && (
                <div
                  className={`
                    absolute top-6 left-1/2 w-full h-0.5 transition-all duration-500
                    ${getLineColor(index)}
                  `}
                  style={{ zIndex: -1 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Timeline (Vertical) */}
      <div className="md:hidden space-y-4">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex items-start space-x-4 relative">
              {/* Icon Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0
                  transition-all duration-300 ${getStageColor(status)}
                `}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : status === 'current' ? (
                  <Icon className="h-5 w-5 animate-pulse" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>

              {/* Label & Description */}
              <div className="flex-1 pt-1">
                <p
                  className={`
                    text-sm font-semibold
                    ${status === 'pending' ? 'text-gray-400' : 'text-gray-900'}
                  `}
                >
                  {stage.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
              </div>

              {/* Connecting Line */}
              {index < stages.length - 1 && (
                <div
                  className={`
                    absolute left-5 top-10 w-0.5 h-8 transition-all duration-500
                    ${getLineColor(index)}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Canceled Status */}
      {currentStatus === 'CANCELED' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">Order Canceled</p>
          <p className="text-xs text-red-600 mt-1">
            This delivery was canceled. Please contact support if you have questions.
          </p>
        </div>
      )}
    </div>
  );
}
