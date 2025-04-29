import React, { useEffect } from "react";
import { useVideo } from "../context/VideoContext";
import { useNavigate } from "react-router";

const Landing: React.FC = () => {
  const { loadVideos, loadingProgress, allVideosLoaded, canStart } = useVideo();
  const navigate = useNavigate();

  const handleStart = async () => {
    loadVideos();
  };

  useEffect(() => {
    if (canStart) {
      navigate("/player");
    }
  }, [canStart, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Video Player</h1>

      {loadingProgress > 0 ? (
        <div className="w-full max-w-md">
          <div className="mb-2 text-center">{loadingProgress}% loaded</div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={handleStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-300"
        >
          Start
        </button>
      )}
    </div>
  );
};

export default Landing;
