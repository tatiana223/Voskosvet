import type { ReviewMedia } from '../api/reviewsApi';
import { getUploadedImage } from '../utils/images';

type Props = {
  media?: ReviewMedia[];
  onRemove?: (index: number) => void;
  compact?: boolean;
};

export function ReviewMediaGallery({ media = [], onRemove, compact }: Props) {
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
            <button type="button" onClick={() => onRemove(index)} aria-label={`Удалить вложение ${index + 1}`}>
              ×
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
