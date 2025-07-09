import { useState } from "react";
import JoinForm from "./components/JoinForm";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [joined, setJoined] = useState(false);

  return <div>{joined ? <ChatWindow /> : <JoinForm onJoin={() => setJoined(true)} />}</div>;
}

export default App;
