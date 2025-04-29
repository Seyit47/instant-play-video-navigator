import React, { createContext, useState, useContext, useEffect } from "react";
import type { Video } from "../types";
import { videoSources } from "~/constants";

interface VideoContextType {
  videos: Video[];
  currentVideoIndex: number;
  loadingProgress: number;
  allVideosLoaded: boolean;
  setCurrentVideoIndex: (index: number) => void;
  loadVideos: () => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const generateVideoUrls = (arr: string[]): Video[] => {
  return Array.from({ length: arr.length }, (_, i) => ({
    id: i,
    url: arr[i],
    loaded: false,
  }));
};

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [allVideosLoaded, setAllVideosLoaded] = useState<boolean>(false);

  useEffect(() => {
    setVideos(generateVideoUrls(videoSources));
  }, []);

  const loadVideos = async () => {
    if (videos.length === 0) return;

    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      const progress = Math.floor((loadedCount / videos.length) * 100);
      setLoadingProgress(progress);

      if (loadedCount === videos.length) {
        setAllVideosLoaded(true);
      }
    };

    const loadPromises = videos.map((video, index) => {
      return new Promise<void>((resolve) => {
        const videoElement = document.createElement("video");
        videoElement.preload = "auto";
        videoElement.muted = true;
        videoElement.src = video.url;
        let loaded = false;

        const handleLoad = () => {
          if (loaded) return;
          loaded = true;
          setVideos((prev) =>
            prev.map((v, i) => (i === index ? { ...v, loaded: true } : v))
          );
          videoElement.removeEventListener("canplaythrough", handleLoad);
          videoElement.removeEventListener("error", handleLoad);
          updateProgress();
          resolve();
        };

        videoElement.addEventListener("canplaythrough", handleLoad, {
          once: true,
        });
        videoElement.addEventListener("error", () => {
          console.error(`Error loading video ${video.id}`);
          updateProgress();
          resolve();
        });

        videoElement.load();
        videoElement.remove();
      });
    });

    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.error("Error preloading videos:", error);
    }
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        currentVideoIndex,
        loadingProgress,
        allVideosLoaded,
        setCurrentVideoIndex,
        loadVideos,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};
