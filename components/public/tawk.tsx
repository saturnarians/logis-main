'use client';

import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

interface TawkMessengerProps {
  propertyId?: string;
  widgetId?: string;
}

export function TawkMessenger({ propertyId, widgetId }: TawkMessengerProps) {
  const propId = propertyId || process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || 'property_id';
  const wId = widgetId || process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || 'default';

  return (
    <TawkMessengerReact
      propertyId={propId}
      widgetId={wId}
    />
  );
}

export default TawkMessenger;