declare module '@tawk.to/tawk-messenger-react' {
  import type { ComponentType } from 'react';

  export interface TawkMessengerProps {
    propertyId: string;
    widgetId: string;
    onLoad?: () => void;
    onBeforeLoad?: () => void;
    onStatusChange?: (status: string) => void;
    onChatMaximized?: () => void;
    onChatMinimized?: () => void;
    onChatHidden?: () => void;
    onChatStarted?: () => void;
    onChatEnded?: () => void;
    onPrechatSubmit?: (data: unknown) => void;
    onOfflineSubmit?: (data: unknown) => void;
    onChatMessageVisitor?: (data: unknown) => void;
    onChatMessageAgent?: (data: unknown) => void;
    onChatMessageSystem?: (data: unknown) => void;
    onAgentJoinChat?: (data: unknown) => void;
    onAgentLeaveChat?: (data: unknown) => void;
    onChatSatisfaction?: (data: unknown) => void;
    onVisitorNameChanged?: (data: unknown) => void;
    onFileUpload?: (data: unknown) => void;
    onTagsUpdated?: (data: unknown) => void;
    onUnreadCountChanged?: (count: number) => void;
    customStyle?: object;
    embedId?: string;
    basePath?: string;
  }

  const TawkMessengerReact: ComponentType<TawkMessengerProps>;
  export default TawkMessengerReact;
}