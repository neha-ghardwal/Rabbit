import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import useSound from "use-sound";
import beepSfx from "../assets/sound.mp3";
import rabbitIdle from "../assets/LoadingRabbit.png";
import rabbitHappy from "../assets/completeRabbit.png";
import progressRabbit from "../assets/Progress.png";

export default function PomodoroTimer() {
  // 60 min focus, 5 min break (in seconds). Adjust WORK_DURATION for testing.
  const WORK_DURATION = 60 * 60; // e.g. 6 seconds for quick demo
  const BREAK_DURATION = 50 * 60; // 5 minutes

  // ─── State ──────────────────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const intervalRef = useRef(null);
  const [play] = useSound(beepSfx, { volume: 0.5 });

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  // Format secondsLeft as MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ─── Timer Effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    // If we’re on the summary screen, stop any interval.
    if (showSummary) {
      clearInterval(intervalRef.current);
      return;
    }

    if (isRunning) {
      // If there’s no existing interval, create one.
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setSecondsLeft((prev) => prev - 1);
        }, 1000);
      }
    } else {
      // Paused or first load: clear interval
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup on unmount or when dependencies change
    return () => clearInterval(intervalRef.current);
  }, [isRunning, showSummary]);

  // ─── When Timer Hits Zero ────────────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft < 0 && !showSummary) {
      // Time’s up: play beep + confetti + pause
      play();
      setShowConfetti(true);
      setIsRunning(false);

      setTimeout(() => {
        setShowConfetti(false);

        if (!onBreak) {
          // Just finished a focus session → increment cycle count
          setCycleCount((c) => c + 1);

          // Switch to break
          setOnBreak(true);
          setSecondsLeft(BREAK_DURATION);
          setIsRunning(true); // auto‐start break
        } else {
          // Just finished a break → go back to focus
          setOnBreak(false);
          setSecondsLeft(WORK_DURATION);
          setIsRunning(true); // auto‐start next focus
        }
      }, 3000); // show confetti for 3 seconds
    }
  }, [secondsLeft, onBreak, play, showSummary]);

  // ─── Handle Reset Button ─────────────────────────────────────────────────────
  const handleReset = () => {
    play(); // play a little beep on reset too
    setIsRunning(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setShowSummary(true);
  };

  // ─── Summary Screen ──────────────────────────────────────────────────────────
  if (showSummary) {
    const hoursCompleted = cycleCount; // 1 focus session = 1 “hour” in your terminology
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#FFEED2] p-8 space-y-4 font-mono">
        {/* Keep confetti alive for the summary */}
        <Confetti
          numberOfPieces={100}
          recycle={true}
          gravity={0.2}
          className="w-full h-full"
        />

        <img
          src={progressRabbit}
          alt="Rabbit Celebrating"
          className="w-40 h-45 z-10 rotate-350"
        />
        <h3 className="text-xl font-bold text-center z-10">
          Woww... You focused very
          <br />
          well & completed
        </h3>
        <p className="text-blue-600 text-2xl font-semibold">
          {hoursCompleted < 2
            ? ` ${hoursCompleted} hour today`
            : ` ${hoursCompleted} hours today`}
        </p>
        <button
          onClick={() => {
            // Reset everything and go back to timer screen (paused)
            setCycleCount(0);
            setOnBreak(false);
            setSecondsLeft(WORK_DURATION);
            setShowSummary(false);
            setShowConfetti(false);
            setIsRunning(false);
          }}
          className="px-6 py-3 bg-pink-400 text-white rounded-full hover:bg-pink-500 flex items-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 transform rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 12h16m0 0l-6-6m6 6l-6 6"
            />
          </svg>
          <span>Go Again?</span>
        </button>
      </div>
    );
  }

  // ─── Normal Timer UI ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
      {/* Confetti when a cycle finishes */}
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

      {/* Rabbit image (idle vs. happy) */}
      <img
        src={showConfetti ? rabbitHappy : rabbitIdle}
        alt="Rabbit"
        className="w-36 h-36 animate-bounce"
      />

      {/* Timer Display */}
      <div className="flex items-baseline space-x-2">
        <span className="text-6xl font-bold font-mono">
          {formatTime(Math.max(secondsLeft, 0))}
        </span>
        <span className="text-xl font-light font-mono">mins</span>
      </div>

      {/* Focus/Break Label */}
      <div className="text-gray-600 font-mono">
        {onBreak ? "Break Time 🐰" : "Focus Time 🐇"}
      </div>

      {/* Cycle Count */}
      <div className="text-sm text-gray-500 font-mono">
        Cycles completed:{" "}
        <span className="font-medium font-mono">{cycleCount}</span>
      </div>

      {/* Controls */}
      <div className="flex space-x-4 font-mono">
        <button
          onClick={() => setIsRunning((r) => !r)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
