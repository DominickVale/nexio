
import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import StationSelector from './station-selector'
import { $, $all } from '../utils'
import { CONFIG } from '../config'


class Preloader {
  private progressBar: HTMLElement;
  private progressText: HTMLElement;
  private borderElement: HTMLElement;
  private videos: HTMLVideoElement[];
  private loadedVideos: number = 0;
  private totalProgress: number = 0;

  constructor(
    progressBar: HTMLElement,
    progressText: HTMLElement,
    borderElement: HTMLElement,
    videos: NodeListOf<HTMLVideoElement>
  ) {
    this.progressBar = progressBar;
    this.progressText = progressText;
    this.borderElement = borderElement;
    this.videos = Array.from(videos);
    
    this.setup();
  }

  private setup(): void {
    this.videos.forEach((video, index) => {
      this.preloadVideo(video, index);
    });
  }

  private preloadVideo(video: HTMLVideoElement, index: number): void {
    const sources = video.querySelectorAll('source');
    const validSources = Array.from(sources).filter(source => {
      const mediaQuery = source.getAttribute('media');
      if (!mediaQuery) return true;
      return window.matchMedia(mediaQuery).matches;
    });

    if (validSources.length === 0) {
      console.error('No valid source found for video:', video);
      this.updateProgress(index, 100);
      return;
    }

    const matchingSource = validSources[0];
    const videoUrl = matchingSource.src;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', videoUrl, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        this.updateProgress(index, percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        this.updateProgress(index, 100);
      }
    };

    xhr.onerror = () => {
      console.error('Error loading video:', videoUrl);
      this.updateProgress(index, 100);
    };

    xhr.send();
  }

  private updateProgress(videoIndex: number, progress: number): void {
    const previousProgress = this.totalProgress;
    const progressPerVideo = 100 / this.videos.length;
    
    // Update progress for this video
    const videoProgress = (progress / 100) * progressPerVideo;
    this.totalProgress = Math.min(100, 
      this.totalProgress - (progressPerVideo * (videoIndex / this.videos.length)) + videoProgress);

    // Update UI
    const progressPercent = Math.round(this.totalProgress);
    gsap.to(this.progressBar, {
      width: `${progressPercent}%`,
      duration: 0.3,
      ease: "power1.out"
    });
    this.progressText.textContent = `${progressPercent}%`;

    // Check if this video is newly completed
    if (progress === 100 && progress > previousProgress) {
      this.loadedVideos++;
      if (this.loadedVideos === this.videos.length) {
        this.complete();
      }
    }
  }

  private complete(): void {
    // Animate border to viewport size
    gsap.to(this.borderElement, {
      width: window.innerWidth - 32, // 16px padding on each side
      height: window.innerHeight - 32,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        // Hide preloader
        gsap.to(this.borderElement.parentElement!, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            if (this.borderElement.parentElement) {
              this.borderElement.parentElement.style.display = 'none';
            }
          }
        });
      }
    });
  }
}

export function setupPreloader(
  isDesktop: boolean,
  isMobile: boolean,
  reduceMotion: boolean,
) {

  const progressBar = $('.progress-bar') as HTMLElement;
  const progressText = $('.progress-text') as HTMLElement;
  const borderElement = $('.border-element') as HTMLElement;
  const videos = $all('video') as NodeListOf<HTMLVideoElement>;

  if (progressBar && progressText && borderElement && videos.length > 0) {
    new Preloader(progressBar, progressText, borderElement, videos);
  }
}
