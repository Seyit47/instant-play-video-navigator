import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const [lastLoadedIndex, setLastLoadedIndex] = useState<number>(0);
  const [canStart, setCanStart] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const videoElementsRef = useRef<{ index: number; el: HTMLVideoElement }[]>(
    []
  );

  const allVideosLoaded = useMemo(() => {
    return videos.every((video) => video.loaded);
  }, [videos]);

  useEffect(() => {
    setVideos(generateVideoUrls(videoSources));
  }, []);

  useEffect(() => {
    if (allVideosLoaded) {
      return;
    }
    videoElementsRef.current.forEach((videoEl) => {
      if (videoEl.index !== currentVideoIndex) {
        videoEl.el.pause();
        videoEl.el.src = "";
        videoEl.el.load();
      }
    });
    videoElementsRef.current = [];
    console.log(lastLoadedIndex);
    if (lastLoadedIndex - currentVideoIndex < 2) {
      loadVideos(lastLoadedIndex, lastLoadedIndex + 3);
    }
  }, [currentVideoIndex]);

  const loadVideos = async (start = 0, end = 3) => {
    if (videos.length === 0) return;

    setIsLoading(true);
    videoElementsRef.current = [];
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      const progress = Math.floor((loadedCount / (end - start)) * 100);
      setLoadingProgress(progress);
      if (progress === 100) {
        setCanStart(true);
        setIsLoading(false);
      }
    };

    for (let i = start; i < start + end; i++) {
      const video = videos[i];

      if (video.loaded) {
        continue;
      }

      await new Promise<void>((resolve) => {
        const videoElement = document.createElement("video");
        videoElement.preload = "auto";
        videoElement.muted = true;
        videoElement.src = video.url;

        videoElementsRef.current.push({ index: i, el: videoElement });

        let loaded = false;

        const handleLoad = () => {
          if (loaded) return;
          loaded = true;
          setVideos((prevVideos) =>
            prevVideos.map((v) =>
              v.id === video.id ? { ...v, loaded: true } : v
            )
          );
          videoElement.removeEventListener("canplaythrough", handleLoad);
          videoElement.removeEventListener("error", handleLoad);
          updateProgress();
          resolve();
        };

        const handleError = () => {
          console.error(`Error loading video ${video.id}`);
          updateProgress();
          resolve();
        };

        videoElement.addEventListener("canplaythrough", handleLoad, {
          once: true,
        });
        videoElement.addEventListener("error", handleError);

        videoElement.load();
      });
    }

    setLastLoadedIndex(end);
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
