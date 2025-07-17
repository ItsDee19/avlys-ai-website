import React from 'react';

const VideoPlayer = ({ video, poster, style = {} }) => {
  if (!video || !video.url) {
    return (
      <div style={{
        background: '#fef3c7',
        borderRadius: 12,
        padding: '2rem',
        textAlign: 'center',
        color: '#92400e',
        border: '2px dashed #f59e0b',
        ...style
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🎥</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>No video available</div>
        <div style={{ fontSize: '0.9rem' }}>Video generation failed or not available</div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fef3c7',
      borderRadius: 12,
      padding: '1rem',
      border: '1px solid #f59e0b',
      ...style
    }}>
      <video
        controls
        style={{
          width: '100%',
          borderRadius: 8,
          maxHeight: 200,
          objectFit: 'cover',
        }}
        src={video.url}
        poster={poster}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      <div style={{ marginTop: 8, fontSize: '0.9rem', color: '#92400e' }}>
        <strong>Generated:</strong> {new Date(video.generatedAt).toLocaleDateString()}
        {video.duration && (
          <span style={{ marginLeft: 12 }}>
            <strong>Duration:</strong> {video.duration}s
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer; 