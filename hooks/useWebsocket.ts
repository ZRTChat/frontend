import {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';

type Props = {
  userId: number;
  enabled: boolean;
  onConnected?: () => void;
};

type Message = {
  content: string;
  senderId: string;
  userId: string;
  date: Date;
};

const useWebSockets = ({userId, enabled, onConnected}: Props) => {
  const ref = useRef<SocketIOClient.Socket>();
  const [messages, setMessages] = useState<Message[]>([]);

  const send = (msg: string, senderId: number) => {
    ref.current!.emit('message', {
      content: msg,
      senderId: senderId,
      userId,
      date: new Date(),
    });
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = io('localhost:4000');

    socket.emit('joinRoom', userId);

    socket.emit('message', (msg: Message) => {
      setMessages((prev) => prev.concat(msg));
    });

    socket.on('disconnect', () => {
      console.log('disconnected');
    });

    socket.on('connect', () => {
      if (onConnected) {
        onConnected();
      }
    });

    socket.on('reconnect', () => {
      socket.emit('joinRoom', userId);
    });

    ref.current = socket;

    return () => socket.disconnect();
  }, [enabled, userId]);

  return {
    send,
    messages,
  };
};

export default useWebSockets;