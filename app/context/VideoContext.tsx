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
  isLoading: boolean;
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
  const cancelControllerRef = useRef<AbortController | null>(null);

  const allVideosLoaded = useMemo(() => {
    return videos.every((video) => video.loaded);
  }, [videos]);

  useEffect(() => {
    setVideos(generateVideoUrls(videoSources));
  }, []);

  useEffect(() => {
    cleanLoadingVideos();
    if (allVideosLoaded) {
      return;
    }
    if (currentVideoIndex >= lastLoadedIndex) {
      setLastLoadedIndex(currentVideoIndex);
    }
    if (lastLoadedIndex - currentVideoIndex < 2) {
      loadVideos(lastLoadedIndex, lastLoadedIndex + 3);
    }
  }, [currentVideoIndex]);

  function cleanLoadingVideos() {
    console.log(videoElementsRef.current, currentVideoIndex);
    videoElementsRef.current.forEach((videoEl) => {
      if (videoEl.index !== currentVideoIndex) {
        videoEl.el.pause();
        videoEl.el.src = "";
        videoEl.el.load();
        videoEl.el.remove();
      }
    });
    videoElementsRef.current = [];
  }

  const loadVideos = async (start = 0, end = 3) => {
    if (videos.length === 0) return;

    if (cancelControllerRef.current) {
      cleanLoadingVideos();
      cancelControllerRef.current.abort();
      cancelControllerRef.current = null;
    }

    cancelControllerRef.current = new AbortController();
    const signal = cancelControllerRef.current.signal;

    setIsLoading(true);
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

      await new Promise<void>((resolve, reject) => {
        if (signal.aborted) {
          cleanLoadingVideos();
          reject(new Error("Loading was cancelled"));
          return;
        }

        const videoElement = document.createElement("video");
        videoElement.preload = "auto";
        videoElement.muted = true;
        videoElement.src = video.url;

        videoElementsRef.current.push({ index: i, el: videoElement });

        let loaded = false;

        const handleLoad = () => {
          if (loaded || signal.aborted) {
            cleanLoadingVideos();
            return;
          }
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

        signal.addEventListener("abort", () => {
          cleanLoadingVideos();
          videoElement.removeEventListener("canplaythrough", handleLoad);
          videoElement.removeEventListener("error", handleError);
          reject(new Error("Loading was cancelled"));
        });

        videoElement.load();
      });
    }

    setLastLoadedIndex(end);
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        isLoading,
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
