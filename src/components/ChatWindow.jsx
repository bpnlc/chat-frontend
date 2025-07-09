import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);// ... other imports ...

export default function ChatWindow() {
    const username = useChatStore((state) => state.username);
    const messages = useChatStore((state) => state.messages);
    const addMessage = useChatStore((state) => state.addMessage);

    const [message, setMessage] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeout = useRef(null);
    const messagesEndRef = useRef(null);

    // Use ref to hold latest username for socket listeners
    const usernameRef = useRef(username);
    useEffect(() => {
        usernameRef.current = username;
    }, [username]);

    // Effect #1: Register user when username changes
    useEffect(() => {
        if (!username) return;
        socket.emit("register_user", username);
    }, [username]);

    // Effect #2: Socket event listeners (run once)
    useEffect(() => {
        socket.on("receive_message", (msg) => {
            addMessage(msg);
        });

        socket.on("user_joined", (user) => {
            setNotifications((prev) => {
                if (prev.includes(`${user} joined the chat`)) return prev;
                return [...prev, `${user} joined the chat`];
            });
            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n !== `${user} joined the chat`));
            }, 5000);
        });


        socket.on("user_left", (user) => {
            setNotifications((prev) => [...prev, `${user} left the chat`]);
            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n !== `${user} left the chat`));
            }, 5000);
        });

        socket.on("user_typing", (user) => {
            if (user === usernameRef.current) return;
            setTypingUsers((prev) => {
                if (!prev.includes(user)) return [...prev, user];
                return prev;
            });
        });

        socket.on("user_stop_typing", (user) => {
            setTypingUsers((prev) => prev.filter((u) => u !== user));
        });

        return () => {
            socket.off("receive_message");
            socket.off("user_joined");
            socket.off("user_left");
            socket.off("user_typing");
            socket.off("user_stop_typing");
        };
    }, []);

    const handleTyping = (e) => {
        setMessage(e.target.value);

        console.log("Typing handler, username:", username);

        if (!typingTimeout.current) {
            console.log("➡️ emitting typing event");
            socket.emit("typing", username);
        }

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            console.log("➡️ emitting stop_typing event");
            socket.emit("stop_typing", username);
            typingTimeout.current = null;
        }, 1000);
    };



    const sendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const msgData = {
            user: username,
            text: message.trim(),
            time: new Date().toLocaleTimeString(),
        };

        socket.emit("send_message", msgData);
        setMessage("");
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
            <h2 className="text-3xl font-semibold mb-4 text-center text-indigo-700">Chat Room</h2>

            {/* Notifications */}
            <div className="mb-2">
                {notifications.map((note, idx) => (
                    <div
                        key={idx}
                        className="bg-yellow-100 text-yellow-800 p-2 rounded mb-1 text-sm font-medium select-none"
                    >
                        {note}
                    </div>
                ))}
            </div>

            {/* Messages */}
            <div
                className="flex-grow overflow-y-auto border border-gray-300 rounded p-4 space-y-3 bg-gray-50"
            >
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`max-w-[70%] p-3 rounded-lg break-words ${msg.user === username
                            ? "bg-indigo-500 text-white ml-auto text-right"
                            : "bg-white text-gray-900"
                            }`}
                    >
                        <div className="font-semibold">{msg.user}</div>
                        <div>{msg.text}</div>
                        <div className="text-xs text-gray-300 mt-1">{msg.time}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator */}
            <div className="min-h-[24px] italic text-gray-500 mt-2">
                {typingUsers.length > 0 &&
                    `${typingUsers.join(", ")} ${typingUsers.length === 1 ? "is" : "are"} typing...`}
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} className="flex gap-2 mt-3">
                <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    placeholder="Type your message..."
                    className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded font-semibold transition"
                >
                    Send
                </button>
            </form>
            {/* <div className="my-4 space-x-2">
                <button
                    onClick={() => {
                        console.log("Manual typing emit:", username);
                        socket.emit("typing", username);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Emit typing
                </button>

                <button
                    onClick={() => {
                        console.log("Manual stop_typing emit:", username);
                        socket.emit("stop_typing", username);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Emit stop_typing
                </button>
            </div> */}
        </div>
    );
}
