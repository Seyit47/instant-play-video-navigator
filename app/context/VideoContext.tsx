import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import type { Video } from "../types";
import { videoSources } from "~/constants";

interface VideoContextType {
  videos: Video[];
  currentVideoIndex: number;
  loadingProgress: number;
  allVideosLoaded: boolean;
  canStart: boolean;
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [canStart, setCanStart] = useState<boolean>(false);
  const totalCount = videos.length;
  const offset = 5;
  const totalPages = Math.ceil(totalCount / offset);

  const allVideosLoaded = useMemo(() => {
    return videos.every((video) => video.loaded);
  }, [videos]);

  useEffect(() => {
    setVideos(generateVideoUrls(videoSources));
  }, []);

  useEffect(() => {
    if (currentPage < totalPages && !allVideosLoaded) {
      loadVideos();
    }
  }, [currentPage]);

  useEffect(() => {
    if (allVideosLoaded) {
      return;
    }
    if (currentPage * offset - (currentVideoIndex + 1) === 3) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentVideoIndex]);

  const loadVideos = async () => {
    if (videos.length === 0) return;

    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      const progress = Math.floor((loadedCount / (currentPage * offset)) * 100);
      setLoadingProgress(progress);
      if (progress === 100) {
        setCanStart(true);
      }
    };

    for (
      let i = (currentPage - 1) * offset;
      i < (currentPage - 1) * offset + offset;
      i++
    ) {
      const video = videos[i];

      await new Promise<void>((resolve) => {
        const videoElement = document.createElement("video");
        videoElement.preload = "none";
        videoElement.muted = true;
        videoElement.src = video.url;
        setVideos((prevVideos) =>
          prevVideos.map((v) =>
            v.id === video.id ? { ...v, loaded: true } : v
          )
        );
        let loaded = false;

        const handleLoad = () => {
          if (loaded) return;
          loaded = true;
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
    }

    try {
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
        canStart,
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
