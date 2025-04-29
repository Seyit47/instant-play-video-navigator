import React, { useEffect, useMemo, useRef } from "react";
import { useVideo } from "../context/VideoContext";
import { useNavigate } from "react-router";

const Player: React.FC = () => {
  const { videos, currentVideoIndex, setCurrentVideoIndex, canStart } =
    useVideo();
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!canStart) {
      navigate("/");
    }
  }, [canStart, navigate]);

  const goToNextVideo = () => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
  };

  const goToPreviousVideo = () => {
    const prevIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    setCurrentVideoIndex(prevIndex);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video playback failed:", error);
      });
    }
  }, [currentVideoIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNextVideo();
      } else if (e.key === "ArrowLeft") {
        goToPreviousVideo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentVideoIndex]);

  if (!canStart || videos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const currentVideo = useMemo(() => {
    return videos[currentVideoIndex];
  }, [currentVideoIndex, videos]);

  return (
    <div className="flex flex-col px-4 items-center justify-center min-h-screen bg-black">
      <div className="relative w-full max-w-lg">
        <div className="relative pt-[156.35%]">
          <video
            ref={videoRef}
            src={currentVideo.url}
            className="absolute top-0 left-0 w-full h-full"
            autoPlay
            loop
            playsInline
          />
        </div>

        <div className="flex justify-between space-x-4 mt-4 w-full">
          <button
            onClick={goToPreviousVideo}
            className="bg-white bg-opacity-20 cursor-pointer hover:bg-opacity-30 text-black px-4 py-2 rounded-full"
          >
            Previous
          </button>
          <button
            onClick={goToNextVideo}
            className="bg-white bg-opacity-20 cursor-pointer hover:bg-opacity-30 text-black px-4 py-2 rounded-full"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-4 text-white text-sm">
        Video {currentVideoIndex + 1} of {videos.length}
      </div>
    </div>
  );
};

export default Player;
