/**
 * Priority Delivery Component
 * Allows customers to add express delivery fee for faster driver assignment
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Crown } from 'lucide-react';

interface PriorityOption {
  value: string;
  label: string;
  description: string;
  estimatedTime: string;
  icon: React.ReactNode;
}

const priorityOptions: PriorityOption[] = [
  {
    value: '0',
    label: 'Standard',
    description: 'Normal driver assignment',
    estimatedTime: '5-15 minutes',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    value: '50',
    label: 'Express (+₱50)',
    description: '15-20% faster assignment',
    estimatedTime: '2-5 minutes',
    icon: <Zap className="h-5 w-5 text-orange-500" />,
  },
  {
    value: '75',
    label: 'Priority (+₱75)',
    description: '30% faster assignment',
    estimatedTime: '1-3 minutes',
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
  },
  {
    value: '100',
    label: 'VIP (+₱100)',
    description: 'Fastest assignment',
    estimatedTime: '1-2 minutes',
    icon: <Crown className="h-5 w-5 text-purple-500" />,
  },
];

interface PriorityDeliveryProps {
  orderId?: string;
  currentTotal: number;
  onPrioritySelected?: (fee: number) => void;
  disabled?: boolean;
}

export default function PriorityDelivery({
  orderId,
  currentTotal,
  onPrioritySelected,
  disabled = false,
}: PriorityDeliveryProps) {
  const [selectedPriority, setSelectedPriority] = useState<string>('0');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedOption = priorityOptions.find(
    (opt) => opt.value === selectedPriority
  );
  const priorityFee = parseFloat(selectedPriority);
  const newTotal = currentTotal + priorityFee;

  const handleApplyPriority = async () => {
    if (priorityFee === 0) {
      // No priority selected
      onPrioritySelected?.(0);
      return;
    }

    if (!orderId) {
      setError('Order ID is required to add priority fee');
      return;
    }

    setIsApplying(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/lalamove/priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          priorityFee: selectedPriority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add priority fee');
      }

      setSuccess(true);
      onPrioritySelected?.(priorityFee);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      console.error('[Priority] Error:', err);
      setError(err.message || 'Failed to add priority delivery');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Priority Delivery
        </CardTitle>
        <CardDescription>
          Get your order delivered faster with priority driver assignment
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedPriority}
          onValueChange={setSelectedPriority}
          disabled={disabled || isApplying || success}
        >
          <div className="space-y-3">
            {priorityOptions.map((option) => (
              <div
                key={option.value}
                className={`relative flex items-start space-x-3 rounded-lg border p-4 transition-all ${
                  selectedPriority === option.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                    : 'border-gray-200 hover:border-gray-300'
                } ${disabled || isApplying || success ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`priority-${option.value}`}
                  className="mt-1"
                  disabled={disabled || isApplying || success}
                />
                <Label
                  htmlFor={`priority-${option.value}`}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span className="font-semibold">{option.label}</span>
                    {option.value !== '0' && (
                      <Badge variant="outline" className="ml-auto">
                        {option.estimatedTime}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* Price Summary */}
        <div className="space-y-2 rounded-lg bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span>Base Delivery Fee:</span>
            <span>₱{currentTotal.toFixed(2)}</span>
          </div>
          {priorityFee > 0 && (
            <div className="flex justify-between text-sm text-orange-600">
              <span>Priority Fee:</span>
              <span>+₱{priorityFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>New Total:</span>
            <span className={priorityFee > 0 ? 'text-orange-600' : ''}>
              ₱{newTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Apply Button */}
        {orderId && (
          <Button
            onClick={handleApplyPriority}
            disabled={disabled || isApplying || success || priorityFee === 0}
            className="w-full"
            size="lg"
          >
            {isApplying ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Applying...
              </>
            ) : success ? (
              <>
                <span className="mr-2">✓</span>
                Priority Added!
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                {priorityFee > 0
                  ? `Add ${selectedOption?.label}`
                  : 'Select Priority Level'}
              </>
            )}
          </Button>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
            ✓ Priority delivery added! Your order will be prioritized.
          </div>
        )}

        {/* Info Note */}
        <p className="text-xs text-muted-foreground">
          ℹ️ Priority fee must be added before driver accepts the order. Once a
          driver is assigned, this option is no longer available.
        </p>
      </CardContent>
    </Card>
  );
}
