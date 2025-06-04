import "./App.css";
import { useState } from "react";
import PomodoroTimer from "./components/PomodoroTimer";

function App() {
  return (
    <main className="min-h-screen bg-yellow-50 flex flex-col items-center py-8">
      <h1 className="text-3xl text-blue-900 font-bold mb-4 font-mono">
        ~Rabbit Break~
      </h1>
      {/* Content Area */}
      <div className="w-full max-w-md h-110 bg-[#FFEED2] rounded-2xl shadow-lg p-4">
        <PomodoroTimer />
      </div>
    </main>
  );
}

export default App;
