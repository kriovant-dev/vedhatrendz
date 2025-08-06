export interface DeliveryDateInfo {
  minDate: Date;
  maxDate?: Date;
  displayText: string;
  shortText: string;
}

export const calculateDeliveryDates = (
  minDays: number | null,
  maxDays: number | null = null,
  baseDate: Date = new Date()
): DeliveryDateInfo | null => {
  if (!minDays) return null;

  const minDate = new Date(baseDate);
  minDate.setDate(baseDate.getDate() + minDays);

  const maxDate = maxDays ? new Date(baseDate) : undefined;
  if (maxDate && maxDays) {
    maxDate.setDate(baseDate.getDate() + maxDays);
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long'
    });
  };

  let displayText: string;
  let shortText: string;

  if (maxDate && maxDays && maxDays !== minDays) {
    // Range delivery (e.g., "2-3 days")
    displayText = `Will be delivered between ${formatDate(minDate)} (${formatDayName(minDate)}) and ${formatDate(maxDate)} (${formatDayName(maxDate)})`;
    shortText = `${minDays}-${maxDays} days`;
  } else {
    // Single day delivery (e.g., "4 days")
    displayText = `Will be delivered on ${formatDate(minDate)} (${formatDayName(minDate)})`;
    shortText = `${minDays} days`;
  }

  return {
    minDate,
    maxDate,
    displayText,
    shortText
  };
};

export const getDeliveryText = (
  minDays: number | null,
  maxDays: number | null = null,
  format: 'full' | 'short' = 'full'
): string => {
  const deliveryInfo = calculateDeliveryDates(minDays, maxDays);
  if (!deliveryInfo) return 'Delivery information not available';
  
  return format === 'full' ? deliveryInfo.displayText : deliveryInfo.shortText;
};
