import { useEffect, useRef, useState, type ElementType } from 'react';
import { getStoredAuth } from '../utils/auth';
import { getUploadedImage } from '../utils/images';

type TextEditorProps = {
  as: ElementType;
  value: string;
  label: string;
  className?: string;
  multiline?: boolean;
  onSave: (value: string) => Promise<void>;
};

export function InlineTextEditor({
  as: Tag,
  value,
  label,
  className,
  multiline,
  onSave,
}: TextEditorProps) {
  const isAdmin = getStoredAuth()?.role === 'ADMIN';
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setDraft(value), [value]);

  if (!isAdmin) return <Tag className={className}>{value}</Tag>;

  async function save() {
    if (!draft.trim()) {
      setError('Поле не должно быть пустым');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onSave(draft.trim());
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось сохранить');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Tag className={`${className || ''} inline-editable-field`}>
      <span>{value}</span>
      <button
        className="inline-edit-button"
        type="button"
        title={`Редактировать: ${label}`}
        aria-label={`Редактировать: ${label}`}
        onClick={() => {
          setDraft(value);
          setError('');
          setIsEditing(true);
        }}
      >
        ✎
      </button>
      {isEditing ? (
        <span className="inline-edit-panel">
          <strong>{label}</strong>
          {multiline ? (
            <textarea rows={5} value={draft} onChange={(event) => setDraft(event.target.value)} />
          ) : (
            <input value={draft} onChange={(event) => setDraft(event.target.value)} />
          )}
          {error ? <small>{error}</small> : null}
          <span className="inline-edit-actions">
            <button type="button" disabled={isSaving} onClick={() => void save()}>
              {isSaving ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <button type="button" disabled={isSaving} onClick={() => setIsEditing(false)}>
              Отмена
            </button>
          </span>
        </span>
      ) : null}
    </Tag>
  );
}

type ImageEditorProps = {
  value: string;
  label: string;
  className?: string;
  background?: boolean;
  onUpload: (file: File) => Promise<void>;
};

export function InlineImageEditor({
  value,
  label,
  className,
  background,
  onUpload,
}: ImageEditorProps) {
  const isAdmin = getStoredAuth()?.role === 'ADMIN';
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const imageUrl = getUploadedImage(value);

  async function selectFile(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      await onUpload(file);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const editor = isAdmin ? (
    <>
      <button
        className="inline-image-edit-button"
        type="button"
        disabled={isUploading}
        title={`Заменить: ${label}`}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? 'Загрузка...' : '✎ Изменить'}
      </button>
      <input
        ref={inputRef}
        className="inline-file-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => void selectFile(event.target.files?.[0])}
      />
      {error ? <span className="inline-image-error">{error}</span> : null}
    </>
  ) : null;

  if (background) {
    return (
      <div
        className={`${className || ''} inline-editable-image`}
        style={{ backgroundImage: `url("${imageUrl}")` }}
        aria-label={isAdmin ? label : undefined}
      >
        {editor}
      </div>
    );
  }

  return (
    <>
      <img src={imageUrl} alt={label} />
      {editor}
    </>
  );
}
