// types.ts
export interface VideoCallProps {
  roomName: string;
  participantName: string;
  onJoin: () => void;
  isLoading: boolean;
}

export interface ParticipantState {
  identity: string;
  name: string;
  isLocal: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export interface RoomState {
  participants: ParticipantState[];
  isConnected: boolean;
  error: string | null;
}
