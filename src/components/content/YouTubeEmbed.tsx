'use client';

import { cn } from '@/lib/utils';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  startTime?: number;
  showControls?: boolean;
  className?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

/**
 * YouTube video embed component with lazy loading and accessibility
 * 
 * @example
 * ```tsx
 * <YouTubeEmbed 
 *   videoId="dQw4w9WgXcQ" 
 *   title="How to Cook Mushrooms"
 *   startTime={30}
 * />
 * ```
 */
export function YouTubeEmbed({
  videoId,
  title,
  startTime = 0,
  showControls = true,
  className = '',
  aspectRatio = '16:9',
}: YouTubeEmbedProps) {
  // Validate video ID format (11 characters)
  const isValidVideoId = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  
  if (!isValidVideoId) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted rounded-lg p-8',
        className
      )}>
        <p className="text-muted-foreground text-sm">Invalid video ID</p>
      </div>
    );
  }

  // Build embed URL with parameters
  const params = new URLSearchParams({
    start: startTime.toString(),
    controls: showControls ? '1' : '0',
    rel: '0', // Don't show related videos from other channels
    modestbranding: '1', // Minimal YouTube branding
  });
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;

  // Aspect ratio classes
  const aspectClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  };

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-lg font-semibold mb-3 text-foreground">{title}</h3>
      )}
      <div className={cn(
        'relative w-full overflow-hidden rounded-xl shadow-lg',
        aspectClasses[aspectRatio]
      )}>
        <iframe
          src={embedUrl}
          title={title || 'YouTube video player'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}

/**
 * YouTube thumbnail component for video cards
 */
interface YouTubeThumbnailProps {
  videoId: string;
  alt?: string;
  quality?: 'default' | 'mq' | 'hq' | 'sd' | 'maxres';
  className?: string;
  onClick?: () => void;
}

export function YouTubeThumbnail({
  videoId,
  alt = 'Video thumbnail',
  quality = 'hq',
  className = '',
  onClick,
}: YouTubeThumbnailProps) {
  const qualityMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;

  return (
    <div 
      className={cn(
        'relative aspect-video overflow-hidden rounded-lg cursor-pointer group',
        className
      )}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 group-hover:bg-black/40">
        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
          <svg 
            className="w-8 h-8 text-white ml-1" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default YouTubeEmbed;
