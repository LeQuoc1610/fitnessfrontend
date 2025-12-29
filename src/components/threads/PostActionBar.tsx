import React from 'react';
import {
  HeartFilled,
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import './PostActionBar.css';

export function PostActionBar({
  liked,
  likeCount,
  commentCount,
  shareCount,
  onLike,
  onComment,
  onShare,
}: {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  onLike: () => void;
  onComment?: () => void;
  onShare?: () => void;
}) {
  return (
    <div className="gb-post-actions">
      <button
        type="button"
        className={liked ? 'gb-action-btn is-liked' : 'gb-action-btn'}
        onClick={onLike}
        aria-pressed={liked}
      >
        <span className="gb-action-icon">{liked ? <HeartFilled /> : <HeartOutlined />}</span>
        <span className="gb-action-label">{likeCount}</span>
      </button>

      <button type="button" className="gb-action-btn" onClick={onComment} aria-label="Comment">
        <span className="gb-action-icon">
          <MessageOutlined />
        </span>
        <span className="gb-action-label">{commentCount}</span>
      </button>

      <button type="button" className="gb-action-btn" onClick={onShare} aria-label="Share">
        <span className="gb-action-icon">
          <ShareAltOutlined />
        </span>
        <span className="gb-action-label">{shareCount}</span>
      </button>
    </div>
  );
}
