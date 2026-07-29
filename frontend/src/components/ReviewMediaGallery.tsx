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
  if (media.length === 0) return null;

  return (
    <div className={compact ? 'review-media-gallery compact' : 'review-media-gallery'}>
      {media.map((item, index) => (
        <div className="review-media-item" key={`${item.url}-${index}`}>
          {item.type === 'video' ? (
            <video src={getUploadedImage(item.url)} controls preload="metadata" />
          ) : (
            <img src={getUploadedImage(item.url)} alt={`Вложение к отзыву ${index + 1}`} />
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
    </div>
  );
}
