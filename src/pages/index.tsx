import { useState, useEffect, useRef } from "react";
import SocketIOClient, { Socket } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile, faPaperPlane, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { Permanent_Marker } from "next/font/google";


const graffitiFont = Permanent_Marker({ subsets: ['latin'], weight: '400' });

interface IMsg {
  user: string;
  msg: string;
}

interface IUser {
  id: string;
  name: string;
}


export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null!);
  const chatContainerRef = useRef<HTMLDivElement>(null!);
  const socketRef = useRef<typeof Socket | null>(null);

  const [chat, setChat] = useState<IMsg[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [showEmotePopup, setShowEmotePopup] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsScrolled(!isAtBottom);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      socketRef.current = SocketIOClient(process.env.BASE_URL as string, { path: "/api/socket" });

      socketRef.current.on("connect", () => {
        console.log("SOCKET CONNECTED!", socketRef.current?.id);
        socketRef.current?.emit("userJoined", user);
        setUsers((prevUsers) => [
          ...prevUsers,
          { id: socketRef.current?.id ?? "", name: user }
        ]);
      });

      socketRef.current.on("userJoined", (newUser: IUser) => {
        setUsers((prevUsers) => {
          if (prevUsers.some((u) => u.id === newUser.id)) return prevUsers;
          return [...prevUsers, newUser];
        });
        setSystemMessage(`${newUser.name} has joined the chat.`);
        setTimeout(() => setSystemMessage(""), 3000);
      });

      socketRef.current.on("userLeft", (userId: string) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      });

      socketRef.current.on("users", (updatedUsers: IUser[]) => {
        setUsers(updatedUsers);
      });

      socketRef.current.on("message", (message: IMsg) => {
        if (message.user === "System") {
          setSystemMessage(message.msg);
          setTimeout(() => setSystemMessage(""), 3000);
        } else {
          setChat((chat) => [...chat, message]);
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit("userLeft", socketRef.current.id);
          socketRef.current.disconnect();
        }
      };
    }
  }, [isLoggedIn, user]);

  const sendMessage = async () => {
    if (msg.trim()) {
      const message: IMsg = { user, msg };

      socketRef.current?.emit("message", message);

      try {
        const resp = await fetch(`/api/socket`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(message)
        });

        if (resp.ok) {
          setMsg("");
        } else {
          console.error("Failed to send message to API");
        }
      } catch (error) {
        console.error("Error while sending message:", error);
      } finally {
        setMsg("");
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-base-200">
      {!isLoggedIn ? (
        <div className="flex flex-col justify-center items-center h-full w-full">
          {/* logo */}
          <Image src="/images/logo.png" alt="Logo" width={100} height={100} className="mb-4" />
          <h1 className="text-3xl font-semibold text-white mb-4">Login to Chat</h1>
          <input
            type="text"
            placeholder="Enter your name"
            className="input input-bordered bg-base-300 text-white p-2 rounded mt-4 mb-4 w-60 sm:w-80"
            onChange={(e) => setUser(e.target.value)}
            value={user}
            onKeyPress={(e) => {
              if (e.key === "Enter" && user) setIsLoggedIn(true);
            }}
          />
          <button
            onClick={() => user && setIsLoggedIn(true)}
            className="btn btn-success text-black mt-4 w-60 sm:w-80"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="flex w-full">
          <div className="flex flex-col w-1/4 bg-base-300 p-4 h-screen">
            <div className="flex items-center mb-5">
              {/* Tambahkan logo */}
              <Image src="/images/logo.png" alt="Logo Vercel" width={100} height={100} />
              <h1 className={`${graffitiFont.className} text-success text-xl font-bold`}>AZXchat</h1>
            </div>
            <h4 className="text-xl text-white mb-4">Users</h4>
            <ul className="overflow-y-auto h-full">
              {users
                .filter((user, index, self) => self.findIndex((u) => u.id === user.id) === index)
                .map((u) => (
                  <li
                    key={u.id}
                    className={`text-white p-2 rounded mb-2 ${u.name === user ? "font-semibold bg-base-100" : ""} hover:bg-base-200`}
                  >
                    {u.name}
                  </li>
                ))}
            </ul>
          </div>

          <div className="flex-1 flex flex-col h-screen">
            {/* Chat container */}
            <div className="p-4 bg-base-100">
              {systemMessage && (
                <div className="text-center text-sm text-gray-500 mb-3">
                  {systemMessage}
                </div>
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 bg-base-100"
              ref={chatContainerRef}
              onScroll={handleScroll}
            >
              {chat.map((message, index) => (
                <div key={index} className="flex items-center my-2">
                  <div className="text-sm text-base-400 mr-2">{message.user}:</div>
                  <div className="bg-base-300 p-2 rounded text-white">{message.msg}</div>
                </div>
              ))}
            </div>

            {/* Icon Scroll ke Bawah */}
            {isScrolled && (
              <button onClick={scrollToBottom} className="btn btn-circle btn-success fixed bottom-20 right-11 z-10">
                <FontAwesomeIcon icon={faArrowDown} />
              </button>
            )}

            {/* Input */}
            <div className="p-4 bg-base-200">
              <div className="flex items-center">
                <button className="btn btn-default mr-2" onClick={() => setShowEmotePopup(!showEmotePopup)}>
                  <FontAwesomeIcon icon={faSmile} />
                </button>
                {showEmotePopup && (
                  <div className="absolute bottom-16 bg-base-300 p-2 rounded shadow-lg">
                    <div className="grid grid-cols-6 gap-2">
                      {["😀", "😂", "😍", "😎", "😢", "😡"].map((emote) => (
                        <span
                          key={emote}
                          onClick={() => {
                            setMsg(msg + emote);
                            setShowEmotePopup(false);
                          }}
                          className="cursor-pointer text-xl"
                        >
                          {emote}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type here"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && msg.trim()) {
                      sendMessage(); // Panggil fungsi sendMessage saat "Enter" ditekan
                    }
                  }}
                  className="text-white input input-bordered w-full h-12"
                />
                <button onClick={sendMessage} className="btn btn-success ml-4 p-2 rounded-full">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
