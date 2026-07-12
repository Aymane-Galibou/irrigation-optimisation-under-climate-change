"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const backendPath = process.env.NEXT_PUBLIC_BACKEND_URL;

interface responsePython {
  status: string;
  fetched: boolean;
  aiModel: string;
}

export default function page() {
  const [connected, setconnected] = useState<boolean>(false);
  const [dataPython, setdataPython] = useState<responsePython | null>(null);
  const [status, setStatus] = useState<"connected" | "disconnected">(
    "disconnected",
  );

  const getPython = async () => {
    const response = await fetch(`${backendPath}/python`);
    const data: responsePython = await response.json();
    setconnected(data.fetched);
    setdataPython(data);
  };

  useEffect(() => {
    getPython();
    const socket = io(backendPath, {
      path: "/ws/socket.io/",
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));
  }, []);
  return (
    <div
      className={"flex items-center justify-center bg-blue-950 min-h-screen"}
    >
      <div className="max-w-5xl w-full bg-gray-400 flex flex-wrap justify-center p-3 rounded-2xl gap-5">
        <div className="bg-white p-4 rounded-2xl max-w-110 w-full">
          <div className="flex items-center gap-3">
            <h1>Fast Api Status</h1>
            <span
              className={`${connected ? "bg-green-500" : "bg-red-500"} w-5 h-5 rounded-full animate-pulse`}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl max-w-110 w-full">
          <div className="flex items-center gap-3">
            <h1>The Socket Statuts : {status} </h1>
                        <span
              className={`${status === "connected" ? "bg-green-500" : "bg-red-500"} w-5 h-5 rounded-full animate-pulse`}
            />
          </div>
        </div>

                <div className="bg-white p-4 rounded-2xl max-w-110 w-full">
          <div className="flex items-center gap-3">
            <h1>Python Ai Model {dataPython?.aiModel} </h1>
            <span 
              className={`${dataPython?.aiModel ? "bg-orange-600" : "bg-black"} w-5 h-5 rounded-full animate-pulse`}

            />
          </div>
        </div>
      </div>
    </div>
  );
}
