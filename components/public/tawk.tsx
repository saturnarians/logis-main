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

      customStyle={{
        visibility: {
          desktop: {
            position: 'br', // 'br' stands for Bottom Right. Options: 'br', 'bl', 'cr', 'cl'
            xOffset: 20,    // Margin from the right side of the screen (in pixels)
            yOffset: 20     // Margin from the bottom of the screen (in pixels)
          },
          mobile: {
            position: 'br',
            xOffset: 10,
            yOffset: 10
          }}
        }
      }
    />
  );
}

export default TawkMessenger;