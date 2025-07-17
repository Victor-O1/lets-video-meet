// "use client";

// import { useState, useCallback, useEffect } from "react";
// import {
//   Room,
//   RoomEvent,
//   RemoteParticipant,
//   LocalParticipant,
//   Participant,
//   Track,
//   VideoTrack,
//   AudioTrack,
//   ConnectionState,
//   ParticipantEvent,
//   TrackPublication,
//   RemoteTrackPublication,
//   LocalTrackPublication,
//   VideoPresets,
//   AudioPresets,
// } from "livekit-client";
// import { toast } from "sonner";
// import {
//   Video,
//   VideoOff,
//   Mic,
//   MicOff,
//   Phone,
//   PhoneOff,
//   Settings,
//   Copy,
//   Users,
//   Share,
//   Monitor,
//   MonitorOff,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";

// interface VideoCallProps {
//   initialRoom?: string;
//   initialName?: string;
// }

// interface ParticipantInfo {
//   identity: string;
//   name: string;
//   isLocal: boolean;
//   videoTrack?: VideoTrack;
//   audioTrack?: AudioTrack;
//   isVideoEnabled: boolean;
//   isAudioEnabled: boolean;
// }

// export default function VideoCall({
//   initialRoom = "",
//   initialName = "",
// }: VideoCallProps) {
//   // State management
//   const [roomName, setRoomName] = useState<string>(initialRoom);
//   const [participantName, setParticipantName] = useState<string>(initialName);
//   const [isJoined, setIsJoined] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [room, setRoom] = useState<Room | null>(null);
//   const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
//   const [localParticipant, setLocalParticipant] =
//     useState<LocalParticipant | null>(null);
//   const [connectionState, setConnectionState] = useState<ConnectionState>(
//     ConnectionState.Disconnected
//   );
//   const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
//   const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
//   const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

//   // Helper function to get video track from participant
//   const getVideoTrack = (participant: Participant): VideoTrack | undefined => {
//     const videoPublication = participant.videoTrackPublications
//       .values()
//       .next().value;
//     return videoPublication?.track as VideoTrack;
//   };

//   // Helper function to get audio track from participant
//   const getAudioTrack = (participant: Participant): AudioTrack | undefined => {
//     const audioPublication = participant.audioTrackPublications
//       .values()
//       .next().value;
//     return audioPublication?.track as AudioTrack;
//   };

//   // Join room function
//   const joinRoom = useCallback(async () => {
//     if (!roomName.trim() || !participantName.trim()) {
//       toast.error("Please enter both room name and participant name");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Create room instance
//       const newRoom = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//         videoCaptureDefaults: {
//           resolution: VideoPresets.h720.resolution, // Add .resolution property
//           frameRate: 30,
//           facingMode: "user",
//         },
//         publishDefaults: {
//           videoEncoding: {
//             maxBitrate: 1_500_000,
//             maxFramerate: 30,
//           },
//           audioPreset: AudioPresets.speech,
//           videoSimulcastLayers: [
//             VideoPresets.h360,
//             VideoPresets.h540,
//             VideoPresets.h720,
//           ],
//         },
//       });

//       // Get token from your API
//       const response = await fetch("/api/token", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           room: roomName, // Change to "room"
//           username: participantName, // Change to "username"
//         }),
//       });
//       console.log("Response:", response);

//       if (!response.ok) {
//         throw new Error("Failed to get access token");
//       }

//       const { token } = await response.json();

//       // Set up event listeners
//       newRoom.on(RoomEvent.Connected, () => {
//         setConnectionState(ConnectionState.Connected);
//         setIsJoined(true);
//         toast.success("Successfully joined the room!");
//       });

//       newRoom.on(RoomEvent.Disconnected, () => {
//         setConnectionState(ConnectionState.Disconnected);
//         setIsJoined(false);
//         toast.info("Disconnected from room");
//       });

//       newRoom.on(
//         RoomEvent.ParticipantConnected,
//         (participant: RemoteParticipant) => {
//           toast.success(
//             `${participant.name || participant.identity} joined the room`
//           );
//           updateParticipants(newRoom);
//         }
//       );

//       newRoom.on(
//         RoomEvent.ParticipantDisconnected,
//         (participant: RemoteParticipant) => {
//           toast.info(
//             `${participant.name || participant.identity} left the room`
//           );
//           updateParticipants(newRoom);
//         }
//       );

//       newRoom.on(RoomEvent.TrackSubscribed, () => {
//         updateParticipants(newRoom);
//       });

//       newRoom.on(RoomEvent.TrackUnsubscribed, () => {
//         updateParticipants(newRoom);
//       });

//       newRoom.on(RoomEvent.LocalTrackPublished, () => {
//         updateParticipants(newRoom);
//       });

//       newRoom.on(RoomEvent.LocalTrackUnpublished, () => {
//         updateParticipants(newRoom);
//       });

//       newRoom.on(RoomEvent.TrackMuted, () => {
//         updateParticipants(newRoom);
//       });

//       newRoom.on(RoomEvent.TrackUnmuted, () => {
//         updateParticipants(newRoom);
//       });

//       // Connect to room
//       await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

//       setRoom(newRoom);
//       setLocalParticipant(newRoom.localParticipant);
//       updateParticipants(newRoom);

//       // Enable camera and microphone
//       await newRoom.localParticipant.enableCameraAndMicrophone();
//     } catch (error) {
//       console.error("Error joining room:", error);
//       toast.error("Failed to join room. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [roomName, participantName]);

//   // Update participants function
//   const updateParticipants = useCallback((room: Room) => {
//     const allParticipants: ParticipantInfo[] = [];

//     // Add local participant
//     const localPart = room.localParticipant;
//     allParticipants.push({
//       identity: localPart.identity,
//       name: localPart.name || localPart.identity,
//       isLocal: true,
//       videoTrack: getVideoTrack(localPart),
//       audioTrack: getAudioTrack(localPart),
//       isVideoEnabled: localPart.isCameraEnabled,
//       isAudioEnabled: localPart.isMicrophoneEnabled,
//     });

//     // Add remote participants
//     room.remoteParticipants.forEach((participant) => {
//       allParticipants.push({
//         identity: participant.identity,
//         name: participant.name || participant.identity,
//         isLocal: false,
//         videoTrack: getVideoTrack(participant),
//         audioTrack: getAudioTrack(participant),
//         isVideoEnabled: participant.isCameraEnabled,
//         isAudioEnabled: participant.isMicrophoneEnabled,
//       });
//     });

//     setParticipants(allParticipants);
//   }, []);

//   // Toggle video function
//   const toggleVideo = useCallback(async () => {
//     if (!localParticipant) return;

//     try {
//       await localParticipant.setCameraEnabled(!isVideoEnabled);
//       setIsVideoEnabled(!isVideoEnabled);
//       toast.success(isVideoEnabled ? "Camera turned off" : "Camera turned on");
//     } catch (error) {
//       toast.error("Failed to toggle camera");
//     }
//   }, [localParticipant, isVideoEnabled]);

//   // Toggle audio function
//   const toggleAudio = useCallback(async () => {
//     if (!localParticipant) return;

//     try {
//       await localParticipant.setMicrophoneEnabled(!isAudioEnabled);
//       setIsAudioEnabled(!isAudioEnabled);
//       toast.success(isAudioEnabled ? "Microphone muted" : "Microphone unmuted");
//     } catch (error) {
//       toast.error("Failed to toggle microphone");
//     }
//   }, [localParticipant, isAudioEnabled]);

//   // Toggle screen share function
//   const toggleScreenShare = useCallback(async () => {
//     if (!localParticipant) return;

//     try {
//       if (isScreenSharing) {
//         await localParticipant.setScreenShareEnabled(false);
//         setIsScreenSharing(false);
//         toast.success("Screen sharing stopped");
//       } else {
//         await localParticipant.setScreenShareEnabled(true);
//         setIsScreenSharing(true);
//         toast.success("Screen sharing started");
//       }
//     } catch (error) {
//       toast.error("Failed to toggle screen sharing");
//     }
//   }, [localParticipant, isScreenSharing]);

//   // Leave room function
//   const leaveRoom = useCallback(async () => {
//     if (room) {
//       await room.disconnect();
//       setRoom(null);
//       setLocalParticipant(null);
//       setParticipants([]);
//       setIsJoined(false);
//       setIsVideoEnabled(true);
//       setIsAudioEnabled(true);
//       setIsScreenSharing(false);
//       toast.success("Left the room");
//     }
//   }, [room]);

//   // Copy room link function
//   const copyRoomLink = useCallback(() => {
//     const roomLink = `${window.location.origin}?room=${encodeURIComponent(
//       roomName
//     )}`;
//     navigator.clipboard.writeText(roomLink);
//     toast.success("Room link copied to clipboard!");
//   }, [roomName]);

//   // Video component for participants
//   const VideoComponent = ({
//     participant,
//   }: {
//     participant: ParticipantInfo;
//   }) => {
//     const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
//       null
//     );

//     useEffect(() => {
//       if (videoElement && participant.videoTrack) {
//         participant.videoTrack.attach(videoElement);
//         return () => {
//           participant.videoTrack?.detach(videoElement);
//         };
//       }
//     }, [videoElement, participant.videoTrack]);

//     return (
//       <div className="relative group">
//         <Card className="overflow-hidden bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
//           <CardContent className="p-0">
//             <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
//               {participant.videoTrack && participant.isVideoEnabled ? (
//                 <video
//                   ref={setVideoElement}
//                   className="w-full h-full object-cover"
//                   autoPlay
//                   playsInline
//                   muted={participant.isLocal}
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center">
//                   <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
//                     {participant.name.charAt(0).toUpperCase()}
//                   </div>
//                 </div>
//               )}

//               {/* Participant info overlay */}
//               <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Badge
//                     variant={participant.isLocal ? "default" : "secondary"}
//                     className="text-xs"
//                   >
//                     {participant.name}
//                     {participant.isLocal && " (You)"}
//                   </Badge>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   {!participant.isAudioEnabled && (
//                     <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
//                       <MicOff className="w-3 h-3 text-white" />
//                     </div>
//                   )}
//                   {!participant.isVideoEnabled && (
//                     <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
//                       <VideoOff className="w-3 h-3 text-white" />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (room) {
//         room.disconnect();
//       }
//     };
//   }, [room]);

//   // Join screen
//   if (!isJoined) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
//             <CardHeader className="text-center">
//               <CardTitle className="text-3xl font-bold text-white mb-2">
//                 Join Video Call
//               </CardTitle>
//               <p className="text-slate-300">
//                 Enter your details to join the conversation
//               </p>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-slate-200">
//                   Room Name
//                 </label>
//                 <Input
//                   type="text"
//                   placeholder="Enter room name"
//                   value={roomName}
//                   onChange={(e) => setRoomName(e.target.value)}
//                   className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-slate-200">
//                   Your Name
//                 </label>
//                 <Input
//                   type="text"
//                   placeholder="Enter your name"
//                   value={participantName}
//                   onChange={(e) => setParticipantName(e.target.value)}
//                   className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
//                 />
//               </div>

//               <Button
//                 onClick={joinRoom}
//                 disabled={
//                   isLoading || !roomName.trim() || !participantName.trim()
//                 }
//                 className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Joining...
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <Video className="w-5 h-5" />
//                     Join Room
//                   </div>
//                 )}
//               </Button>

//               {roomName && (
//                 <div className="pt-4 border-t border-white/20">
//                   <Button
//                     onClick={copyRoomLink}
//                     variant="outline"
//                     className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
//                   >
//                     <Copy className="w-4 h-4 mr-2" />
//                     Copy Room Link
//                   </Button>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   // Video call interface
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Header */}
//       <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <h1 className="text-xl font-bold text-white">{roomName}</h1>
//             <Badge variant="outline" className="border-white/20 text-white">
//               <Users className="w-4 h-4 mr-1" />
//               {participants.length} participant
//               {participants.length !== 1 ? "s" : ""}
//             </Badge>
//           </div>

//           <div className="flex items-center gap-2">
//             <Button
//               onClick={copyRoomLink}
//               variant="outline"
//               size="sm"
//               className="border-white/20 text-white hover:bg-white/10"
//             >
//               <Copy className="w-4 h-4 mr-1" />
//               Copy Link
//             </Button>
//             <Button
//               onClick={leaveRoom}
//               variant="destructive"
//               size="sm"
//               className="bg-red-600 hover:bg-red-700"
//             >
//               <PhoneOff className="w-4 h-4 mr-1" />
//               Leave
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Video Grid */}
//       <div className="flex-1 p-4">
//         <div
//           className={`grid gap-4 h-full ${
//             participants.length === 1
//               ? "grid-cols-1"
//               : participants.length === 2
//               ? "grid-cols-2"
//               : participants.length <= 4
//               ? "grid-cols-2"
//               : "grid-cols-3"
//           }`}
//         >
//           {participants.map((participant) => (
//             <VideoComponent
//               key={participant.identity}
//               participant={participant}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Control Bar */}
//       <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-4">
//         <div className="flex items-center justify-center gap-4">
//           <Button
//             onClick={toggleAudio}
//             variant={isAudioEnabled ? "default" : "destructive"}
//             size="lg"
//             className="rounded-full w-12 h-12 p-0"
//           >
//             {isAudioEnabled ? (
//               <Mic className="w-6 h-6" />
//             ) : (
//               <MicOff className="w-6 h-6" />
//             )}
//           </Button>

//           <Button
//             onClick={toggleVideo}
//             variant={isVideoEnabled ? "default" : "destructive"}
//             size="lg"
//             className="rounded-full w-12 h-12 p-0"
//           >
//             {isVideoEnabled ? (
//               <Video className="w-6 h-6" />
//             ) : (
//               <VideoOff className="w-6 h-6" />
//             )}
//           </Button>

//           <Button
//             onClick={toggleScreenShare}
//             variant={isScreenSharing ? "default" : "outline"}
//             size="lg"
//             className="rounded-full w-12 h-12 p-0"
//           >
//             {isScreenSharing ? (
//               <MonitorOff className="w-6 h-6" />
//             ) : (
//               <Monitor className="w-6 h-6" />
//             )}
//           </Button>

//           <Button
//             onClick={leaveRoom}
//             variant="destructive"
//             size="lg"
//             className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
//           >
//             <PhoneOff className="w-6 h-6" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  Participant,
  Track,
  VideoTrack,
  AudioTrack,
  ConnectionState,
  ParticipantEvent,
  TrackPublication,
  RemoteTrackPublication,
  LocalTrackPublication,
  VideoPresets,
  AudioPresets,
} from "livekit-client";
import { toast } from "sonner";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
  Copy,
  Users,
  Share,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface VideoCallProps {
  initialRoom?: string;
  initialName?: string;
}

interface ParticipantInfo {
  identity: string;
  name: string;
  isLocal: boolean;
  videoTrack?: VideoTrack;
  audioTrack?: AudioTrack;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export default function VideoCallApp({
  initialRoom = "",
  initialName = "",
}: VideoCallProps) {
  // State management
  const [roomName, setRoomName] = useState<string>(initialRoom);
  const [participantName, setParticipantName] = useState<string>(initialName);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  // Helper function to get video track from participant
  const getVideoTrack = (participant: Participant): VideoTrack | undefined => {
    const videoPublication = participant.videoTrackPublications
      .values()
      .next().value;
    return videoPublication?.track as VideoTrack;
  };

  // Helper function to get audio track from participant
  const getAudioTrack = (participant: Participant): AudioTrack | undefined => {
    const audioPublication = participant.audioTrackPublications
      .values()
      .next().value;
    return audioPublication?.track as AudioTrack;
  };

  // Check audio devices
  const checkAudioDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );

      if (audioInputs.length === 0) {
        toast.error("No microphone found");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking audio devices:", error);
      toast.error("Cannot access audio devices");
      return false;
    }
  }, []);

  // Check browser support
  const checkBrowserSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Your browser does not support video calls");
      return false;
    }
    return true;
  }, []);

  // Join room function
  const joinRoom = useCallback(async () => {
    if (!roomName.trim() || !participantName.trim()) {
      toast.error("Please enter both room name and participant name");
      return;
    }

    // Check browser support
    if (!checkBrowserSupport()) {
      return;
    }

    setIsLoading(true);

    try {
      // Check for audio permissions first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permissionError) {
        toast.error("Please allow microphone access to join the call");
        setIsLoading(false);
        return;
      }

      // Check audio devices
      const hasAudioDevices = await checkAudioDevices();
      if (!hasAudioDevices) {
        setIsLoading(false);
        return;
      }

      // Create room instance
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
          frameRate: 30,
          facingMode: "user",
        },
        publishDefaults: {
          videoEncoding: {
            maxBitrate: 1_500_000,
            maxFramerate: 30,
          },
          audioPreset: AudioPresets.speech,
          videoSimulcastLayers: [
            VideoPresets.h360,
            VideoPresets.h540,
            VideoPresets.h720,
          ],
        },
      });

      // Get token from your API
      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room: roomName,
          username: participantName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get access token");
      }

      const { token } = await response.json();

      // Set up event listeners
      newRoom.on(RoomEvent.Connected, async () => {
        setConnectionState(ConnectionState.Connected);
        setIsJoined(true);
        toast.success("Successfully joined the room!");

        // Enable audio and video after connection
        try {
          await newRoom.localParticipant.enableCameraAndMicrophone();
          setIsAudioEnabled(true);
          setIsVideoEnabled(true);
        } catch (error) {
          console.error("Failed to enable camera/microphone:", error);
          toast.error("Failed to enable camera or microphone");
        }
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setConnectionState(ConnectionState.Disconnected);
        setIsJoined(false);
        toast.info("Disconnected from room");
      });

      newRoom.on(
        RoomEvent.ParticipantConnected,
        (participant: RemoteParticipant) => {
          toast.success(
            `${participant.name || participant.identity} joined the room`
          );
          updateParticipants(newRoom);
        }
      );

      newRoom.on(
        RoomEvent.ParticipantDisconnected,
        (participant: RemoteParticipant) => {
          toast.info(
            `${participant.name || participant.identity} left the room`
          );
          updateParticipants(newRoom);
        }
      );

      newRoom.on(RoomEvent.TrackSubscribed, () => {
        updateParticipants(newRoom);
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, () => {
        updateParticipants(newRoom);
      });

      newRoom.on(RoomEvent.LocalTrackPublished, () => {
        updateParticipants(newRoom);
      });

      newRoom.on(RoomEvent.LocalTrackUnpublished, () => {
        updateParticipants(newRoom);
      });

      newRoom.on(RoomEvent.TrackMuted, () => {
        updateParticipants(newRoom);
      });

      newRoom.on(RoomEvent.TrackUnmuted, () => {
        updateParticipants(newRoom);
      });

      // Connect to room
      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

      setRoom(newRoom);
      setLocalParticipant(newRoom.localParticipant);
      updateParticipants(newRoom);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [roomName, participantName, checkBrowserSupport, checkAudioDevices]);

  // Update participants function
  const updateParticipants = useCallback((room: Room) => {
    const allParticipants: ParticipantInfo[] = [];

    // Add local participant
    const localPart = room.localParticipant;
    allParticipants.push({
      identity: localPart.identity,
      name: localPart.name || localPart.identity,
      isLocal: true,
      videoTrack: getVideoTrack(localPart),
      audioTrack: getAudioTrack(localPart),
      isVideoEnabled: localPart.isCameraEnabled,
      isAudioEnabled: localPart.isMicrophoneEnabled,
    });

    // Add remote participants
    room.remoteParticipants.forEach((participant) => {
      allParticipants.push({
        identity: participant.identity,
        name: participant.name || participant.identity,
        isLocal: false,
        videoTrack: getVideoTrack(participant),
        audioTrack: getAudioTrack(participant),
        isVideoEnabled: participant.isCameraEnabled,
        isAudioEnabled: participant.isMicrophoneEnabled,
      });
    });

    setParticipants(allParticipants);
  }, []);

  // Toggle video function
  const toggleVideo = useCallback(async () => {
    if (!localParticipant) return;

    try {
      const newVideoState = !isVideoEnabled;
      await localParticipant.setCameraEnabled(newVideoState);
      setIsVideoEnabled(newVideoState);

      // Force update participants to reflect the change
      if (room) {
        updateParticipants(room);
      }

      toast.success(newVideoState ? "Camera turned on" : "Camera turned off");
    } catch (error) {
      console.error("Failed to toggle camera:", error);
      toast.error("Failed to toggle camera");
    }
  }, [localParticipant, isVideoEnabled, room, updateParticipants]);

  // Toggle audio function
  const toggleAudio = useCallback(async () => {
    if (!localParticipant) return;

    try {
      const newAudioState = !isAudioEnabled;
      await localParticipant.setMicrophoneEnabled(newAudioState);
      setIsAudioEnabled(newAudioState);

      // Force update participants to reflect the change
      if (room) {
        updateParticipants(room);
      }

      toast.success(newAudioState ? "Microphone unmuted" : "Microphone muted");
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
      toast.error("Failed to toggle microphone");
    }
  }, [localParticipant, isAudioEnabled, room, updateParticipants]);

  // Toggle screen share function
  const toggleScreenShare = useCallback(async () => {
    if (!localParticipant) return;

    try {
      if (isScreenSharing) {
        await localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
        toast.success("Screen sharing stopped");
      } else {
        await localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      }
    } catch (error) {
      console.error("Failed to toggle screen sharing:", error);
      toast.error("Failed to toggle screen sharing");
    }
  }, [localParticipant, isScreenSharing]);

  // Leave room function
  const leaveRoom = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setLocalParticipant(null);
      setParticipants([]);
      setIsJoined(false);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      setIsScreenSharing(false);
      toast.success("Left the room");
    }
  }, [room]);

  // Copy room link function
  const copyRoomLink = useCallback(() => {
    const roomLink = `${window.location.origin}?room=${encodeURIComponent(
      roomName
    )}`;
    navigator.clipboard.writeText(roomLink);
    toast.success("Room link copied to clipboard!");
  }, [roomName]);

  // Video component for participants
  const VideoComponent = ({
    participant,
  }: {
    participant: ParticipantInfo;
  }) => {
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
      null
    );
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
      null
    );

    useEffect(() => {
      if (videoElement && participant.videoTrack) {
        participant.videoTrack.attach(videoElement);
        return () => {
          participant.videoTrack?.detach(videoElement);
        };
      }
    }, [videoElement, participant.videoTrack]);

    // Add audio track attachment for remote participants
    useEffect(() => {
      if (audioElement && participant.audioTrack && !participant.isLocal) {
        participant.audioTrack.attach(audioElement);
        return () => {
          participant.audioTrack?.detach(audioElement);
        };
      }
    }, [audioElement, participant.audioTrack, participant.isLocal]);

    return (
      <div className="relative group">
        <Card className="overflow-hidden bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-0">
            <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
              {participant.videoTrack && participant.isVideoEnabled ? (
                <video
                  ref={setVideoElement}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted={participant.isLocal}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              {/* Audio element for remote participants */}
              {!participant.isLocal && (
                <audio
                  ref={setAudioElement}
                  autoPlay
                  playsInline
                  style={{ display: "none" }}
                />
              )}

              {/* Participant info overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={participant.isLocal ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {participant.name}
                    {participant.isLocal && " (You)"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {!participant.isAudioEnabled && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {!participant.isVideoEnabled && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <VideoOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  // Join screen
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Join Video Call
              </CardTitle>
              <p className="text-slate-300">
                Enter your details to join the conversation
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Room Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <Button
                onClick={joinRoom}
                disabled={
                  isLoading || !roomName.trim() || !participantName.trim()
                }
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Joining...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Join Room
                  </div>
                )}
              </Button>

              {roomName && (
                <div className="pt-4 border-t border-white/20">
                  <Button
                    onClick={copyRoomLink}
                    variant="outline"
                    className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Room Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Video call interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">{roomName}</h1>
            <Badge variant="outline" className="border-white/20 text-white">
              <Users className="w-4 h-4 mr-1" />
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={copyRoomLink}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Link
            </Button>
            <Button
              onClick={leaveRoom}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-4 h-4 mr-1" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div
          className={`grid gap-4 h-full ${
            participants.length === 1
              ? "grid-cols-1"
              : participants.length === 2
              ? "grid-cols-2"
              : participants.length <= 4
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {participants.map((participant) => (
            <VideoComponent
              key={participant.identity}
              participant={participant}
            />
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={toggleScreenShare}
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            {isScreenSharing ? (
              <MonitorOff className="w-6 h-6" />
            ) : (
              <Monitor className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={leaveRoom}
            variant="destructive"
            size="lg"
            className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
