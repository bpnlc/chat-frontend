import { useState } from "react";
import { useChatStore } from "../store/chatStore";

export default function JoinForm({ onJoin }) {
    const [name, setName] = useState("");
    const setUsername = useChatStore((state) => state.setUsername);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setUsername(name.trim());
        onJoin();
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: "auto", marginTop: 100 }}>
            <h2>Enter your username to join chat</h2>
            <input
                type="text"
                value={name}
                placeholder="Your username"
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />
            <button type="submit" style={{ width: "100%", padding: 8 }}>
                Join
            </button>
        </form>
    );
}
