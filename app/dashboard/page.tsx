"use client";

import React, { useEffect, useState, useCallback } from "react";
import "../styles/dashboard.scss";
import { PostCard } from "../components/PostCard";
import { PostModal } from "../components/PostModal";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FilterBar } from "../components/FilterBar";
import { useNotification } from "../components/NotificationContext";

interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string;
  image_path: string;
  created_at: string;
  category: string | null;
  used: boolean;
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [usedFilter, setUsedFilter] = useState<"all" | "used" | "unused">(
    "all"
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const fetchPosts = useCallback(
    async (
      orderOverride?: "desc" | "asc",
      categoryOverride?: string,
      usedOverride?: "all" | "used" | "unused"
    ) => {
      if (!user) return;
      setLoading(true);
      const order = orderOverride || sortOrder;
      let query = supabase
        .from("posts")
        .select("id, title, description, image_url, created_at, category, used")
        .eq("user_id", user.id)
        .order("created_at", { ascending: order === "asc" });
      const category =
        categoryOverride !== undefined ? categoryOverride : categoryFilter;
      if (category) {
        query = query.eq("category", category);
      }
      const used = usedOverride !== undefined ? usedOverride : usedFilter;
      if (used === "used") {
        query = query.eq("used", true);
      } else if (used === "unused") {
        query = query.eq("used", false);
      }
      const { data, error } = await query;
      if (!error && data) {
        // For each post with an image_url, get a signed URL and keep the file path
        const postsWithSignedUrls = await Promise.all(
          data.map(async (post) => {
            if (post.image_url) {
              const fileName = post.image_url;
              const { data: signedUrlData } = await supabase.storage
                .from("post-images")
                .createSignedUrl(fileName, 60 * 60);
              return {
                ...post,
                image_url: signedUrlData?.signedUrl || "",
                image_path: fileName, // keep the original file path
              };
            }
            return { ...post, image_path: "" };
          })
        );
        setPosts(postsWithSignedUrls);
      }
      setLoading(false);
    },
    [user, sortOrder, categoryFilter, usedFilter]
  );

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  const handleModalSubmit = async (formData: {
    title: string;
    description: string;
    image: File | null;
    removeImage?: boolean;
    imagePath?: string;
    category?: string;
    used?: boolean;
  }) => {
    setModalLoading(true);
    setModalError(null);
    let imagePath = editPost ? editPost.image_path : "";
    try {
      // If removing the image
      if (editPost && formData.removeImage) {
        if (editPost.image_path) {
          await supabase.storage
            .from("post-images")
            .remove([editPost.image_path]);
        }
        imagePath = "";
      } else if (formData.image) {
        // If a new image is uploaded, replace the old one
        if (editPost && editPost.image_path) {
          await supabase.storage
            .from("post-images")
            .remove([editPost.image_path]);
        }
        const fileExt = formData.image.name.split(".").pop();
        const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
        const { error: storageError } = await supabase.storage
          .from("post-images")
          .upload(fileName, formData.image, { upsert: false });
        if (storageError) throw storageError;
        imagePath = fileName;
      } else if (editPost) {
        // If editing and neither removing nor uploading, keep the original imagePath
        imagePath = editPost.image_path;
      }
      if (editPost) {
        // Update existing post
        const { error: updateError } = await supabase
          .from("posts")
          .update({
            title: formData.title,
            description: formData.description,
            image_url: imagePath,
            category: formData.category ?? null,
            used: formData.used ?? false,
          })
          .eq("id", editPost.id);
        if (updateError) throw updateError;
      } else {
        // Create new post
        const { error: insertError } = await supabase.from("posts").insert({
          user_id: user!.id,
          title: formData.title,
          description: formData.description,
          image_url: imagePath,
          category: formData.category ?? null,
          used: formData.used ?? false,
        });
        if (insertError) throw insertError;
      }
      setShowModal(false);
      setEditPost(null);
      await fetchPosts();
      showNotification(
        editPost ? "Post updated successfully!" : "Post created successfully!",
        "success"
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save post";
      setModalError(errorMessage);
      showNotification("Failed to save post", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditPost(post);
    setShowModal(true);
  };

  const handleDeletePost = async (post: Post) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    showNotification("Deleting post...", "info", 2000);

    try {
      // Delete the post from the database
      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);
      if (deleteError) throw deleteError;

      // If the post has an image, delete it from storage
      if (post.image_path) {
        await supabase.storage.from("post-images").remove([post.image_path]);
      }

      await fetchPosts();
      showNotification("Post deleted successfully!", "success");
    } catch (error: unknown) {
      console.error("Delete error:", error);
      showNotification("Failed to delete post", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (post: Post) => {
    const text = post.description || "";
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showNotification("Text copied to clipboard!", "success");
        })
        .catch(() => {
          showNotification("Failed to copy text", "error");
        });
    } else {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (success) {
        showNotification("Text copied to clipboard!", "success");
      } else {
        showNotification("Failed to copy text", "error");
      }
    }
  };

  const handleDownloadImage = (post: Post) => {
    if (!post.image_url) {
      showNotification("No image to download", "error");
      return;
    }

    // Try to get the original file name from image_path, fallback to 'image.jpg'
    let fileName = "image.jpg";
    if (post.image_path) {
      const parts = post.image_path.split("/");
      fileName = parts[parts.length - 1];
    }

    showNotification("Downloading image...", "info", 2000);

    fetch(post.image_url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch image");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showNotification("Image downloaded successfully!", "success");
      })
      .catch((error) => {
        console.error("Download error:", error);
        showNotification("Failed to download image", "error");
      });
  };

  if (authLoading || !user) return null;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__header-title">Dashboard</h1>
        <div className="dashboard__header-actions">
          <button
            className="dashboard__add-button"
            onClick={() => {
              setShowModal(true);
              showNotification("Opening post editor...", "info", 1500);
            }}
          >
            Add Post
          </button>
          <button
            className="dashboard__logout-button"
            onClick={() => {
              showNotification("Logging out...", "info", 2000);
              logout();
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <FilterBar
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        postCount={posts.length}
        usedFilter={usedFilter}
        onUsedFilterChange={setUsedFilter}
      />
      <div className="dashboard__grid">
        {loading ? (
          <div>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div>
            No posts yet. Click &quot;Add Post&quot; to create your first draft!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              description={post.description}
              imageUrl={post.image_url}
              category={post.category || undefined}
              used={post.used}
              onCopy={() => handleCopyText(post)}
              onDownload={() => handleDownloadImage(post)}
              onEdit={() => handleEditPost(post)}
              onDelete={() => handleDeletePost(post)}
            />
          ))
        )}
      </div>
      <PostModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditPost(null);
        }}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
        error={modalError}
        initialData={
          editPost
            ? {
                title: editPost.title,
                description: editPost.description,
                imageUrl: editPost.image_url,
                imagePath: editPost.image_path,
                category: editPost.category || undefined,
                used: editPost.used,
              }
            : undefined
        }
      />
    </div>
  );
}
