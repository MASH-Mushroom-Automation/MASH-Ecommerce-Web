"use client";

import { Receipt, MapPin, Zap, CircleDot, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeliveryQuote {
  baseFare: number;
  distanceSurcharge?: number;
  priorityFee?: number;
  stopFee?: number;
  total: number;
  currency?: string;
  distance?: { value: number; unit: string };
}

interface DeliveryQuoteBreakdownProps {
  quote: DeliveryQuote | null;
  className?: string;
}

function formatCurrency(amount: number, currency = "PHP"): string {
  if (currency === "PHP") {
    return `₱${amount.toFixed(2)}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
}

interface LineItemProps {
  icon: React.ReactNode;
  label: string;
  amount: number;
  currency?: string;
}

function LineItem({ icon, label, amount, currency }: LineItemProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium">{formatCurrency(amount, currency)}</span>
    </div>
  );
}

export default function DeliveryQuoteBreakdown({
  quote,
  className,
}: DeliveryQuoteBreakdownProps) {
  if (!quote) {
    return (
      <div className={cn("rounded-lg border border-dashed border-gray-200 p-4 text-center", className)}>
        <Calculator className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm text-gray-400">No delivery quote available</p>
      </div>
    );
  }

  const currency = quote.currency || "PHP";

  return (
    <div className={cn("rounded-lg border border-emerald-100 bg-emerald-50/30 p-4", className)}>
      <div className="mb-3 flex items-center gap-2">
        <Receipt className="h-4 w-4 text-emerald-600" />
        <h4 className="text-sm font-semibold text-emerald-800">Delivery Cost Breakdown</h4>
      </div>

      <div className="space-y-0.5">
        <LineItem
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Base fare"
          amount={quote.baseFare}
          currency={currency}
        />

        {quote.distanceSurcharge != null && quote.distanceSurcharge > 0 && (
          <LineItem
            icon={<MapPin className="h-3.5 w-3.5" />}
            label={
              quote.distance
                ? `Distance surcharge (${quote.distance.value} ${quote.distance.unit})`
                : "Distance surcharge"
            }
            amount={quote.distanceSurcharge}
            currency={currency}
          />
        )}

        {quote.priorityFee != null && quote.priorityFee > 0 && (
          <LineItem
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Priority fee"
            amount={quote.priorityFee}
            currency={currency}
          />
        )}

        {quote.stopFee != null && quote.stopFee > 0 && (
          <LineItem
            icon={<CircleDot className="h-3.5 w-3.5" />}
            label="Additional stop fee"
            amount={quote.stopFee}
            currency={currency}
          />
        )}
      </div>

      <div className="mt-3 border-t border-emerald-200 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-800">Total</span>
          <span className="text-base font-bold text-emerald-700">
            {formatCurrency(quote.total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
