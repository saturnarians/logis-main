declare module '@tawk.to/tawk-messenger-react' {
  import { ComponentType } from 'react';

  export interface TawkMessengerProps {
    propertyId: string;
    widgetId: string;
    onLoad?: () => void;
    onBeforeLoaded?: () => void;
    onStatusChange?: (status: string) => void;
    onChatMessageVisitor?: (message: string) => void;
    onChatMessageServer?: (message: string) => void;
    onChatMessageSystem?: (message: string) => void;
    onAgentJoinChat?: (data: any) => void;
    onAgentLeaveChat?: (data: any) => void;
    onChatMinimized?: () => void;
    onChatMaximized?: () => void;
    onChatStarted?: () => void;
    onChatEnded?: () => void;
    [key: string]: any;
  }

  const TawkMessengerReact: ComponentType<TawkMessengerProps>;
  export default TawkMessengerReact;
}