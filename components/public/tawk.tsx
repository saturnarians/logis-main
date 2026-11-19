'use client';

import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

const noop = () => {};

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
      onLoad={noop}
      onBeforeLoad={noop}
      onStatusChange={(status) => {
        console.log('Widget status:', status);
      }}
      onChatMaximized={noop}
      onChatMinimized={noop}
      onChatHidden={noop}
      onChatStarted={noop}
      onChatEnded={noop}
      onPrechatSubmit={noop}
      onOfflineSubmit={noop}
      onChatMessageVisitor={noop}
      onChatMessageAgent={noop}
      onChatMessageSystem={noop}
      onAgentJoinChat={noop}
      onAgentLeaveChat={noop}
      onChatSatisfaction={noop}
      onVisitorNameChanged={noop}
      onFileUpload={noop}
      onTagsUpdated={noop}
      onUnreadCountChanged={noop}
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