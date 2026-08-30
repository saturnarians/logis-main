'use client';

import React from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { AICopilotModal } from '@/components/dashboard/AICopilotModal';
import { TalkToAIFloatingButton } from '@/components/common/TalkToAIFloatingButton';

export const GlobalCopilotHost: React.FC = () => {
  const { isCopilotOpen, setIsCopilotOpen } = useLogistics();

  return (
    <>
      <TalkToAIFloatingButton />
      <AICopilotModal isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </>
  );
};
