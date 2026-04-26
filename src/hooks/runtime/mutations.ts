import { useMutation } from '@tanstack/react-query';
import { useRuntimeSnapshot } from '@/lib/xoreinClientProvider';
import {
  sendChannelMessage,
  sendDmMessage,
  editMessage,
  deleteMessage,
  createServer,
  joinServerByInvite,
  createChannel,
  createIdentity,
  restoreIdentity,
  getIdentityBackup,
  joinVoiceChannel,
  leaveVoiceChannel,
  setVoiceMuted,
} from '@/lib/xoreinControl';

export function useSendChannelMessage() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ channelId, content }: { channelId: string; content: string }) =>
      sendChannelMessage(snapshot, channelId, content),
  });
}

export function useSendDmMessage() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ dmId, content }: { dmId: string; content: string }) =>
      sendDmMessage(snapshot, dmId, content),
  });
}

export function useEditMessage() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(snapshot, messageId, content),
  });
}

export function useDeleteMessage() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ messageId }: { messageId: string }) =>
      deleteMessage(snapshot, messageId),
  });
}

export function useCreateServer() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      createServer(snapshot, input),
  });
}

export function useJoinServer() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ deeplink }: { deeplink: string }) =>
      joinServerByInvite(snapshot, deeplink),
  });
}

export function useCreateChannel() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ serverId, name, voice }: { serverId: string; name: string; voice?: boolean }) =>
      createChannel(snapshot, serverId, name, voice),
  });
}

export function useCreateIdentity() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ displayName, bio }: { displayName: string; bio?: string }) =>
      createIdentity(snapshot, displayName, bio),
  });
}

export function useRestoreIdentity() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ backup }: { backup: string }) =>
      restoreIdentity(snapshot, backup),
  });
}

export function useBackupIdentity() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: () => getIdentityBackup(snapshot),
  });
}

export function useJoinVoice() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ channelId, muted }: { channelId: string; muted?: boolean }) =>
      joinVoiceChannel(snapshot, channelId, muted),
  });
}

export function useLeaveVoice() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ channelId }: { channelId: string }) =>
      leaveVoiceChannel(snapshot, channelId),
  });
}

export function useMuteVoice() {
  const snapshot = useRuntimeSnapshot();
  return useMutation({
    mutationFn: ({ channelId, muted }: { channelId: string; muted: boolean }) =>
      setVoiceMuted(snapshot, channelId, muted),
  });
}
