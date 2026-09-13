import { useEffect, useRef, useState } from "react";

const clips = ["1-recipeDetail.mp4", "2-cookAlong.mp4", "3-ingredients.mp4", "4-share.mp4"];

export function YumChickenWorkVideos() {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const video = videos.current[active];
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.currentTime = 0;
    // These decorative, audio-free clips must not claim a Media Session.
    // Autoplay can still be denied by the user's browser preferences.
    void video.play().catch(() => {});
    return () => video.pause();
  }, [active]);

  return clips.map((clip, index) => <video
    key={clip}
    ref={(video) => { videos.current[index] = video; }}
    className="page-work-video"
    style={{ opacity: visible === index ? 1 : 0 }}
    src={`${import.meta.env.BASE_URL}assets/yumchicken/work/${clip}`}
    poster={`${import.meta.env.BASE_URL}assets/yumchicken/work/${clip.replace(/\.mp4$/, ".jpg")}`}
    preload="auto"
    autoPlay={index === active}
    muted
    playsInline
    disablePictureInPicture
    disableRemotePlayback
    controls={false}
    controlsList="nodownload nofullscreen noremoteplayback"
    x-webkit-airplay="deny"
    aria-hidden="true"
    tabIndex={-1}
    onPlaying={() => {
      // Keep the previous clip's last frame until the next clip is playing.
      if (index === active) setVisible(index);
    }}
    onEnded={() => {
      if (index === active) setActive((index + 1) % clips.length);
    }}
  />);
}
