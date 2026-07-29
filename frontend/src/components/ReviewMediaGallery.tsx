import { useEffect, useState } from 'react';
import type { ReviewMedia } from '../api/reviewsApi';
import { getUploadedImage } from '../utils/images';

type Props = {
  media?: ReviewMedia[];
  onRemove?: (index: number) => void;
  compact?: boolean;
  coverUrl?: string;
  onMakeCover?: (url: string) => void;
};

export function ReviewMediaGallery({ media = [], onRemove, compact, coverUrl, onMakeCover }: Props) {
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openedIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenedIndex(null);
      if (event.key === 'ArrowLeft') {
        setOpenedIndex((current) => current === null ? null : (current - 1 + media.length) % media.length);
      }
      if (event.key === 'ArrowRight') {
        setOpenedIndex((current) => current === null ? null : (current + 1) % media.length);
      }
    }

    document.body.classList.add('media-lightbox-open');
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('media-lightbox-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openedIndex, media.length]);

  if (media.length === 0) return null;

  const openedMedia = openedIndex === null ? null : media[openedIndex];
  const activeIndex = openedIndex ?? 0;

  return (
    <div className={compact ? 'review-media-gallery compact' : 'review-media-gallery'}>
      {media.map((item, index) => (
        <div className="review-media-item" key={`${item.url}-${index}`}>
          {item.type === 'video' ? (
            <video
              src={getUploadedImage(item.url)}
              controls
              preload="metadata"
              onClick={() => setOpenedIndex(index)}
            />
          ) : (
            <img
              src={getUploadedImage(item.url)}
              alt={`Вложение к отзыву ${index + 1}`}
              onClick={() => setOpenedIndex(index)}
            />
          )}
          {onRemove ? (
            <button className="review-media-remove" type="button" onClick={() => onRemove(index)} aria-label={`Удалить вложение ${index + 1}`}>
              ×
            </button>
          ) : null}
          {onMakeCover && item.type === 'image' ? (
            <button
              className={coverUrl === item.url ? 'review-cover-button active' : 'review-cover-button'}
              type="button"
              onClick={() => onMakeCover(item.url)}
            >
              {coverUrl === item.url ? '✓ Обложка' : 'На главную'}
            </button>
          ) : null}
        </div>
      ))}
      {openedMedia ? (
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр вложения" onClick={() => setOpenedIndex(null)}>
          <button className="media-lightbox-close" type="button" aria-label="Закрыть" onClick={() => setOpenedIndex(null)}>×</button>
          {media.length > 1 ? (
            <button
              className="media-lightbox-arrow previous"
              type="button"
              aria-label="Предыдущее вложение"
              onClick={(event) => {
                event.stopPropagation();
                setOpenedIndex((activeIndex - 1 + media.length) % media.length);
              }}
            >
              ‹
            </button>
          ) : null}
          <div className="media-lightbox-content" onClick={(event) => event.stopPropagation()}>
            {openedMedia.type === 'video' ? (
              <video src={getUploadedImage(openedMedia.url)} controls autoPlay />
            ) : (
              <img src={getUploadedImage(openedMedia.url)} alt="Увеличенное вложение к отзыву" />
            )}
          </div>
          {media.length > 1 ? (
            <button
              className="media-lightbox-arrow next"
              type="button"
              aria-label="Следующее вложение"
              onClick={(event) => {
                event.stopPropagation();
                setOpenedIndex((activeIndex + 1) % media.length);
              }}
            >
              ›
            </button>
          ) : null}
          <span className="media-lightbox-counter">{activeIndex + 1} / {media.length}</span>
        </div>
      ) : null}
    </div>
  );
}
