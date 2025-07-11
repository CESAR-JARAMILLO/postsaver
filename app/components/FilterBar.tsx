import React from "react";
import styles from "./FilterBar.module.scss";

type FilterBarProps = {
  sortOrder: "desc" | "asc";
  onSortOrderChange: (order: "desc" | "asc") => void;
  category: string;
  onCategoryChange: (category: string) => void;
  postCount: number;
  usedFilter: "all" | "used" | "unused";
  onUsedFilterChange: (filter: "all" | "used" | "unused") => void;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  sortOrder,
  onSortOrderChange,
  category,
  onCategoryChange,
  postCount,
  usedFilter,
  onUsedFilterChange,
}) => (
  <div className={styles.filterBar}>
    <label className={styles.label} htmlFor="sortOrder">
      Date Created:
    </label>
    <select
      id="sortOrder"
      className={styles.select}
      value={sortOrder}
      onChange={(e) => onSortOrderChange(e.target.value as "desc" | "asc")}
    >
      <option value="desc">Newest First</option>
      <option value="asc">Oldest First</option>
    </select>
    <label className={styles.label} htmlFor="categoryFilter">
      Category:
    </label>
    <select
      id="categoryFilter"
      className={styles.categorySelect}
      value={category}
      onChange={(e) => onCategoryChange(e.target.value)}
    >
      <option value="">All</option>
      <option value="Email Marketing">Email Marketing</option>
      <option value="SEO & Analytics">SEO & Analytics</option>
      <option value="Web Development">Web Development</option>
      <option value="E-commerce">E-commerce</option>
    </select>
    <label className={styles.label} htmlFor="usedFilter">
      Used:
    </label>
    <select
      id="usedFilter"
      className={styles.select}
      value={usedFilter}
      onChange={(e) =>
        onUsedFilterChange(e.target.value as "all" | "used" | "unused")
      }
    >
      <option value="all">All</option>
      <option value="used">Used</option>
      <option value="unused">Unused</option>
    </select>
    <span className={styles.count} title="Visible posts">
      {postCount} post{postCount === 1 ? "" : "s"}
    </span>
  </div>
);
