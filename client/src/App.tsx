import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [lastBlockHeight, setLastBlockHeight] = useState<number | null>(null);
  const [secondsSinceLastBlock, setSecondsSinceLastBlock] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/last-block");
        const data = await response.json();
        setLastBlockHeight(data.lastBlockHeight);
        setSecondsSinceLastBlock(
          parseTimeStringToSeconds(data.timeFromLastBlock)
        );
      } catch (error) {
        console.error("Error fetching last block info:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSinceLastBlock((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const parseTimeStringToSeconds = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(/h|m|s/).map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatSeconds = (totalSeconds: number): [number, number, number] => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds];
  };

  const [hours, minutes, seconds] = formatSeconds(secondsSinceLastBlock);

  return (
    <div className="block-info">
      <p className="label">Last block</p>
      <p className="height">{lastBlockHeight || "Loading..."}</p>
      <section>
        <p className="label">Time since last block</p>
        <div className="time">
          {[hours, minutes, seconds].map((unit, index) => (
            <>
              <div key={index} className="segment">
                <p className="value">{unit.toString().padStart(2, "0")}</p>
                <p className="label">
                  {["hours", "minutes", "seconds"][index]}
                </p>
              </div>
              {index < 2 && (
                <div key={`separator-${index}`} className="separator"></div>
              )}
            </>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
