import React from "react";
import Image from "next/image";
import styles from "./PostCard.module.scss";

type PostCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  used?: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const PostCard: React.FC<PostCardProps> = ({
  title,
  description,
  imageUrl,
  category,
  used,
  onCopy,
  onDownload,
  onEdit,
  onDelete,
}) => (
  <div className={styles.card}>
    <div className={styles.cardImage}>
      {imageUrl ? (
        <Image src={imageUrl} alt={title} width={300} height={200} />
      ) : (
        <div className={styles.noImage}>No Image</div>
      )}
    </div>
    <div className={styles.cardContent}>
      {category && <span className={styles.category}>{category}</span>}
      {used && <span className={styles.usedTag}>Used</span>}
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </div>
    <div className={styles.cardActions}>
      <button onClick={onCopy}>Copy Text</button>
      <button onClick={onDownload}>Download Image</button>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  </div>
);
