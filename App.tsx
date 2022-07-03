import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useState, useEffect } from "react";
import Socket from "socket.io-client";

interface Message {
  content: string;
  author: string;
}
interface Embed {
  title: string;
  titlelink: string;
  description: string;
  image: string;
}

export default function App() {
  // connect to socket.io localhost:4000
  const socket = useMemo(() => Socket("https://message.edubeyond.dev"), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  useEffect(() => {
    socket.on("message", (msg: string) => {
      const tmp = JSON.parse(msg);
      setMessages((prev) => [...prev, tmp]);
    });
    return () => {
      socket.disconnect();
    }
  }, [socket]);

  return (
    <View style={styles.container}>
      <View style={styles.messages}>
        {messages.map((message, index) => (
          <Text key={index} style={{ color: "white" }}>
            {message.content}
          </Text>
        ))}
      </View>

      <TextInput
        // refocus on input after message is sent
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          color: "white",
          backgroundColor: "black",
        }}
        onChangeText={(text) => setMessage(text)}
        value={message}
        onSubmitEditing={() => {
          setMessage("");
          socket.emit("message", JSON.stringify({ content: message, author: socket.id }));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
    justifyContent: "center",
    color: "#fff",
  },
  messages: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 10,
  },

});
