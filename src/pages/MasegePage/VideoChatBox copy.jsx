// import React, { useEffect, useRef, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getAuth } from 'firebase/auth';
// import { ref, onValue, set, push, remove } from 'firebase/database';
// import { getFirestore, doc, getDoc } from 'firebase/firestore';
// import { realtimeDB } from '../../firebase';
// import { generateChatId } from '../../utils/GenerateChatId';
// import ChatBox from './ChatBox';

// const servers = {
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
// };

// const VideoChatBox = () => {
//     const [remoteStream, setRemoteStream] = useState(null);
//     const [chatOpen, setChatOpen] = useState(false);
//     const [handRaised, setHandRaised] = useState(false);
//     const [micOn, setMicOn] = useState(true);
//     const [camOn, setCamOn] = useState(true);
//     const [callStarted, setCallStarted] = useState(false);

//     const localVideoRef = useRef();
//     const remoteVideoRef = useRef();
//     const peerConnection = useRef(null);
//     const localStream = useRef(null);

//     const { id: otherId } = useParams();
//     const navigate = useNavigate();
//     const auth = getAuth();
//     const currentUser = auth.currentUser;

//     const myId = currentUser?.uid;
//     const chatId = myId && otherId ? generateChatId(myId, otherId) : null;

//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged((user) => {
//             if (!user) navigate('/');
//         });
//         return () => unsubscribe();
//     }, []);

//     useEffect(() => {
//         const init = async () => {
//             if (!myId || !otherId) return;

//             try {
//                 localStream.current = await navigator.mediaDevices.getUserMedia({
//                     video: true,
//                     audio: true,
//                 });

//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = localStream.current;
//                 }

//                 peerConnection.current = new RTCPeerConnection(servers);

//                 localStream.current.getTracks().forEach((track) => {
//                     peerConnection.current.addTrack(track, localStream.current);
//                 });

//                 peerConnection.current.ontrack = (event) => {
//                     const [stream] = event.streams;
//                     if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
//                         remoteVideoRef.current.srcObject = stream;
//                         setRemoteStream(stream);
//                     }
//                 };

//                 peerConnection.current.onicecandidate = (event) => {
//                     if (event.candidate) {
//                         const myIceRef = ref(realtimeDB, `videoChats/${chatId}/iceCandidates/${myId}`);
//                         push(myIceRef, event.candidate.toJSON());
//                     }
//                 };

//                 const otherIceRef = ref(realtimeDB, `videoChats/${chatId}/iceCandidates/${otherId}`);
//                 onValue(otherIceRef, (snapshot) => {
//                     snapshot.forEach((child) => {
//                         const candidate = new RTCIceCandidate(child.val());
//                         peerConnection.current.addIceCandidate(candidate);
//                     });
//                 });

//                 const signalRef = ref(realtimeDB, `videoChats/${chatId}/signals`);
//                 onValue(signalRef, async (snapshot) => {
//                     const data = snapshot.val();
//                     if (!data) return;

//                     if (data.offer && data.offer.sender !== myId) {
//                         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
//                         const answer = await peerConnection.current.createAnswer();
//                         await peerConnection.current.setLocalDescription(answer);
//                         await set(signalRef, {
//                             ...data,
//                             answer: { ...answer, sender: myId, receiver: otherId },
//                         });
//                         setCallStarted(true);
//                     } else if (data.answer && data.answer.sender !== myId) {
//                         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
//                         setCallStarted(true);
//                     }
//                 });
//             } catch (err) {
//                 console.error('Error initializing video chat:', err);
//             }
//         };

//         init();

//         const handRef = ref(realtimeDB, `videoChats/${chatId}/handRaise/${otherId}`);
//         onValue(handRef, async (snapshot) => {
//             const data = snapshot.val();
//             if (data?.raised) {
//                 const userName = await fetchUserName(otherId);
//                 alert(`${userName} has raised their hand ✋`);
//             }
//         });

//         return () => {
//             if (callStarted) {
//                 endCall();
//             }
//         };
//     }, [myId, otherId]);

//     const fetchUserName = async (uid) => {
//         const db = getFirestore();
//         const userDoc = doc(db, 'mockUsers', uid);
//         const userSnapshot = await getDoc(userDoc);
//         if (userSnapshot.exists()) {
//             return userSnapshot.data().name || 'Unknown User';
//         } else {
//             return 'Unknown User';
//         }
//     };

//     const startCall = async () => {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         const signalRef = ref(realtimeDB, `videoChats/${chatId}/signals`);
//         await set(signalRef, {
//             offer: { ...offer, sender: myId, receiver: otherId },
//         });
//         setCallStarted(true);
//     };

//     const endCall = async () => {
//         try {
//             if (localStream.current) {
//                 localStream.current.getTracks().forEach((track) => track.stop());
//                 localStream.current = null;
//             }

//             if (peerConnection.current) {
//                 peerConnection.current.close();
//                 peerConnection.current = null;
//             }

//             if (localVideoRef.current) localVideoRef.current.srcObject = null;
//             if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//             if (chatId) {
//                 await remove(ref(realtimeDB, `videoChats/${chatId}/signals`));
//                 await remove(ref(realtimeDB, `videoChats/${chatId}/iceCandidates`));
//                 await remove(ref(realtimeDB, `videoChats/${chatId}/handRaise`));
//             }

//             setCallStarted(false);
//             setMicOn(true);
//             setCamOn(true);
//             setHandRaised(false);
//             setRemoteStream(null);
//             setChatOpen(false);

//             navigate('/interviewers');
//         } catch (err) {
//             console.error('Error ending call:', err);
//         }
//     };

//     const toggleMic = () => {
//         const audioTrack = localStream.current?.getTracks().find((t) => t.kind === 'audio');
//         if (audioTrack) {
//             audioTrack.enabled = !audioTrack.enabled;
//             setMicOn(audioTrack.enabled);
//         }
//     };

//     const toggleCam = () => {
//         const videoTrack = localStream.current?.getTracks().find((t) => t.kind === 'video');
//         if (videoTrack) {
//             videoTrack.enabled = !videoTrack.enabled;
//             setCamOn(videoTrack.enabled);
//         }
//     };

//     const toggleHand = async () => {
//         const uid = currentUser?.uid;
//         if (!uid) return;

//         const handRef = ref(realtimeDB, `videoChats/${chatId}/handRaise/${uid}`);
//         const newStatus = !handRaised;
//         setHandRaised(newStatus);

//         const userName = await fetchUserName(uid);

//         await set(handRef, {
//             userId: uid,
//             name: userName,
//             raised: newStatus,
//         });
//     };

//     const toggleScreenShare = async () => {
//         try {
//             const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//             const screenTrack = screenStream.getVideoTracks()[0];
//             const sender = peerConnection.current?.getSenders().find((s) => s.track?.kind === 'video');

//             if (sender) {
//                 sender.replaceTrack(screenTrack);
//             }

//             if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = screenStream;
//             }

//             screenTrack.onended = async () => {
//                 const videoTrack = localStream.current?.getTracks().find((track) => track.kind === 'video');
//                 if (videoTrack && sender) {
//                     sender.replaceTrack(videoTrack);
//                     localVideoRef.current.srcObject = localStream.current;
//                 }
//             };
//         } catch (err) {
//             console.error('Error sharing screen:', err);
//         }
//     };

//     return (
//         <div className="relative w-full h-screen flex flex-col bg-white overflow-hidden">
//             <div className="flex justify-between items-center px-6 py-2 border-b bg-gray-100 shadow-sm">
//                 <h2 className="text-lg font-semibold">Project Review Meeting</h2>
//                 <span className="text-sm text-gray-600">00:32:15</span>
//             </div>

//             <div className="flex flex-1 overflow-hidden">
//                 <div className="flex-1 flex flex-col items-center justify-center relative bg-gray-50">
//                     <video
//                         ref={remoteVideoRef}
//                         autoPlay
//                         playsInline
//                         className="w-[600px] h-[400px] bg-black rounded-lg shadow-lg object-cover"
//                     />

//                     <div className="absolute bottom-4 flex gap-3 bg-white/80 px-4 py-2 rounded-xl shadow-lg">
//                         <video ref={localVideoRef} autoPlay muted playsInline className="w-20 h-14 rounded bg-black" />
//                         <div className="w-20 h-14 bg-gray-300 rounded flex items-center justify-center text-xs">Sarah</div>
//                         <div className="w-20 h-14 bg-gray-300 rounded flex items-center justify-center text-xs">Michael</div>
//                         <div className="w-20 h-14 bg-gray-300 rounded flex items-center justify-center text-xs">David</div>
//                     </div>
//                 </div>

//                 {chatOpen && (
//                     <div className="w-[350px] border-l flex flex-col bg-white shadow-xl">
//                         <div className="flex items-center justify-between px-4 py-2 border-b">
//                             <span className="font-medium">Chat</span>
//                             <span className="text-sm text-gray-500">Participants (6)</span>
//                         </div>
//                         <div className="flex-1 overflow-y-auto">
//                             <ChatBox interviewId={otherId} />
//                         </div>
//                         <div className="p-2 border-t">
//                             <input
//                                 type="text"
//                                 placeholder="Type a message..."
//                                 className="w-full px-3 py-2 text-sm border rounded focus:outline-none"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <div className="flex justify-center gap-3 py-3 border-t bg-gray-100">
//                 {!callStarted && (
//                     <button onClick={startCall} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm">
//                         Start Call
//                     </button>
//                 )}
//                 <button onClick={endCall} className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm">End Call</button>
//                 <button onClick={toggleMic} className="px-4 py-2 bg-gray-700 text-white rounded-lg">
//                     {micOn ? 'Mute Mic 🔇' : 'Unmute Mic 🎙️'}
//                 </button>
//                 <button onClick={toggleCam} className="px-4 py-2 bg-gray-700 text-white rounded-lg">
//                     {camOn ? 'Turn Off Cam 📷' : 'Turn On Cam 🎥'}
//                 </button>
//                 <button onClick={toggleHand} className="px-4 py-2 bg-yellow-500 text-black rounded-lg">
//                     {handRaised ? 'Lower Hand ✋' : 'Raise Hand ✋'}
//                 </button>
//                 <button onClick={toggleScreenShare} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
//                     Share Screen 🖥️
//                 </button>
//                 <button onClick={() => setChatOpen((prev) => !prev)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
//                     {chatOpen ? 'Close Chat 💬' : 'Open Chat 💬'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default VideoChatBox;
