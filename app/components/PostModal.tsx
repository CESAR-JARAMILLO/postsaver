import React, { useState, useRef, useEffect } from "react";
import styles from "./PostModal.module.scss";

type PostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    image: File | null;
    removeImage?: boolean;
    imagePath?: string;
    category?: string;
    used?: boolean;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    imageUrl?: string;
    imagePath?: string;
    category?: string;
    used?: boolean;
  };
  loading?: boolean;
  error?: string | null;
};

export const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
  error,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(
    initialData?.imageUrl
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [category, setCategory] = useState(initialData?.category || "");
  const [used, setUsed] = useState(initialData?.used || false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialData?.title || "");
    setDescription(initialData?.description || "");
    setPreview(initialData?.imageUrl);
    setRemoveImage(false);
    setCategory(initialData?.category || "");
    setUsed(initialData?.used || false);
  }, [initialData, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setRemoveImage(false);
    } else {
      setPreview(undefined);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(undefined);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      image,
      removeImage,
      imagePath: initialData?.imagePath,
      category,
      used,
    });
    setTitle("");
    setDescription("");
    setImage(null);
    setPreview(undefined);
    setRemoveImage(false);
    setCategory("");
    setUsed(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.heading}>
          {initialData ? "Edit Post" : "Add Post"}
        </h2>
        <label className={styles.label}>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={styles.textarea}
          />
        </label>
        <label className={styles.label}>
          Category (optional)
          <select
            className={styles.categorySelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option value="Email Marketing">Email Marketing</option>
            <option value="SEO & Analytics">SEO & Analytics</option>
            <option value="Web Development">Web Development</option>
            <option value="E-commerce">E-commerce</option>
          </select>
        </label>
        <label
          className={styles.label}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <input
            type="checkbox"
            checked={used}
            onChange={(e) => setUsed(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Mark as Used
        </label>
        <label className={styles.label}>
          Image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.input}
          />
        </label>
        {preview && (
          <div className={styles.imagePreview}>
            <img src={preview} alt="Preview" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className={styles.removeImageBtn}
            >
              Remove Image
            </button>
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};
