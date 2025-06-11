document.addEventListener('DOMContentLoaded', () => {
  const socket   = io();
  const roomId   = location.pathname.split('/').pop();

  // 비디오 엘리먼트 참조
  const vids = {
    local: document.getElementById('video-local'),
    peer1: document.getElementById('video-1'),
    peer2: document.getElementById('video-2'),
    peer3: document.getElementById('video-3'),
  };

  let localStream;
  const peers = {}; // { socketId: SimplePeer }

  // 1) 내 카메라/마이크 접근
  navigator.mediaDevices.getUserMedia({ video:true, audio:true })
    .then(stream => {
      localStream = stream;
      vids.local.srcObject = stream;

      // 방에 참가했음을 서버에 알림
      socket.emit('join-room', roomId);
    })
    .catch(err => console.error('getUserMedia error:', err));

  // 2) 새 유저가 들어왔을 때 (initiator 역할)
  socket.on('user-connected', socketId => {
    console.log('User connected:', socketId);
    // peer 인스턴스 생성
    const peer = new SimplePeer({
      initiator: true,
      stream: localStream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });
    setupPeer(socketId, peer);
  });

  // 3) 시그널 받기
  socket.on('signal', ({ from, data }) => {
    console.log('Signal from', from);
    // 이미 만든 peer가 없으면 생성
    if (!peers[from]) {
      const peer = new SimplePeer({
        initiator: false,
        stream: localStream,
        config: { iceServers: [{ urls:'stun:stun.l.google.com:19302' }] }
      });
      setupPeer(from, peer);
    }
    peers[from].signal(data);
  });

  // 4) 유저 나갔을 때
  socket.on('user-disconnected', socketId => {
    console.log('User disconnected:', socketId);
    if (peers[socketId]) {
      peers[socketId].destroy();
      delete peers[socketId];
      // 비디오 화면 지우기
      Object.values(vids).forEach(v => {
        if (v.dataset.peerId === socketId) {
          v.srcObject = null;
          delete v.dataset.peerId;
        }
      });
    }
  });

  // 공통: peer 인스턴스 셋업
  function setupPeer(socketId, peer) {
    peers[socketId] = peer;

    peer.on('signal', data => {
      socket.emit('signal', { roomId, to: socketId, data });
    });

    peer.on('stream', remoteStream => {
      // 빈 비디오 요소 찾아서 채우기
      const empty = Object.values(vids).find(v => !v.srcObject && v !== vids.local);
      if (empty) {
        empty.srcObject = remoteStream;
        empty.dataset.peerId = socketId; // 누가 연결했는지 태그
      }
    });
  }

  // 5) 방 나가기
  document.getElementById('btn-leave').addEventListener('click', () => {
    socket.disconnect();
    Object.values(peers).forEach(p => p.destroy());
    window.location.href = '/rooms';
  });
});
