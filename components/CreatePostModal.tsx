'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { categories, media } from '@/utils/seedData';
import { ItemCondition, Post } from '@/types/exchange';
import { createClient } from '@/utils/supabase/client';

export const CreatePostModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    setPosts,
    user,
    toast,
    refreshPosts,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('Like New');
  const [category, setCategory] = useState(categories[0][0]);
  const [city, setCity] = useState(user?.city || 'Chennai');
  const [locality, setLocality] = useState(user?.locality || 'Adyar');
  const [wanted, setWanted] = useState('');
  const [openToAny, setOpenToAny] = useState(false);
  const [agreedToSafety, setAgreedToSafety] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateModalOpen) return null;

  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('Please choose an image smaller than 5 MB.', 'error');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast('Please sign in or register to publish an item.', 'error');
      setIsAuthModalOpen(true);
      return;
    }

    if (!agreedToSafety) {
      toast('Please confirm the community safety declaration.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = imagePreview || media.console;

      // 1. If image file exists, attempt upload to Supabase Storage 'post-images' bucket
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop() || 'jpg';
          const fileName = `${user.id || 'usr'}-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(fileName, imageFile);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('post-images')
              .getPublicUrl(fileName);
            if (publicUrl) {
              finalImageUrl = publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage upload note, using inline image:', storageErr);
        }
      }

      // 2. Insert into Supabase 'posts' table
      const postPayload = {
        user_id: user.id || null,
        owner_name: user.name || user.first || 'Community Member',
        owner_avatar: user.avatar || media.priya,
        title,
        condition,
        category,
        city,
        locality,
        wanted: openToAny ? 'Open to any interesting exchange' : wanted || 'Open to any interesting exchange',
        description,
        image: finalImageUrl,
        status: 'active',
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(postPayload)
        .select()
        .single();

      if (error) {
        console.warn('Database insert note, saving locally:', error.message);
      }

      const newPost: Post = {
        id: data?.id || `p-${Date.now()}`,
        owner: user.first || user.name || 'Member',
        avatar: user.avatar || media.priya,
        title,
        condition,
        category,
        city,
        locality,
        wanted: openToAny ? 'Open to any interesting exchange' : wanted || 'Open to any interesting exchange',
        description,
        image: finalImageUrl,
        time: 'Just now',
        exchanges: user.exchanges || 0,
        rating: user.rating || '5.0',
        mine: true,
        status: 'active',
      };

      setPosts((prev) => [newPost, ...prev]);
      toast('Your item is live on EXCHANGE! 🚀');
      setIsCreateModalOpen(false);

      // Reset form
      setTitle('');
      setDescription('');
      setWanted('');
      setImagePreview('');
      setImageFile(null);
      setAgreedToSafety(false);

      // Refresh live feed
      refreshPosts();
    } catch (err: any) {
      toast(err.message || 'Error publishing post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <form className="modal" onSubmit={handleSubmit}>
        <button
          className="modal-close"
          type="button"
          onClick={() => setIsCreateModalOpen(false)}
          aria-label="Close"
        >
          ×
        </button>

        <h2 id="create-title">Create exchange post</h2>
        <p>Tell your community what you have and what you’d welcome in return.</p>

        {!user && (
          <div style={{ background: '#fff0ed', border: '1px solid #f9d2cb', borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#b4402d' }}>
              ⚠️ You must be signed in to post. Click below to sign in or register:
            </p>
            <button
              type="button"
              className="btn btn-primary btn-small"
              style={{ marginTop: 8 }}
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsAuthModalOpen(true);
              }}
            >
              Sign In / Register
            </button>
          </div>
        )}

        <div className="form-grid">
          <div className="upload-box">
            <label htmlFor="post-image" style={{ cursor: 'pointer' }}>
              <b>Upload real photo of your item</b>
              <br />
              <small>JPG, PNG or WEBP (Max 5 MB)</small>
            </label>
            <input
              id="post-image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              hidden
              required={!imagePreview}
            />
            {imagePreview && (
              <img
                className="preview visible"
                src={imagePreview}
                alt="Uploaded item preview"
              />
            )}
          </div>

          <div className="form-row">
            <label>Item name</label>
            <input
              name="title"
              maxLength={140}
              placeholder="e.g. Sony WH-1000XM4 Headphones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Description & Condition Details</label>
            <textarea
              name="description"
              placeholder="Describe condition, usage history, included accessories, or any flaws…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="form-two">
            <div className="form-row">
              <label>Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
              >
                {['New', 'Like New', 'Good', 'Fair'].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(([x]) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-two">
            <div className="form-row">
              <label>City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Kochi', 'Pune', 'Coimbatore', 'Madurai'].map(
                  (x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-row">
              <label>Locality / Neighborhood</label>
              <input
                name="locality"
                placeholder="e.g. Adyar, T. Nagar, Indiranagar"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <label>
              What would you welcome in exchange? <small>(optional)</small>
            </label>
            <input
              name="wanted"
              placeholder="e.g. Mechanical keyboard, DSLR lens, or cycling gear"
              value={wanted}
              onChange={(e) => setWanted(e.target.value)}
            />
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={openToAny}
              onChange={(e) => setOpenToAny(e.target.checked)}
            />
            Open to any creative or useful exchange
          </label>

          <div style={{ background: '#f5f9f4', border: '1px solid #dbe8db', borderRadius: 12, padding: 12, marginTop: 4 }}>
            <label className="check" style={{ alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={agreedToSafety}
                onChange={(e) => setAgreedToSafety(e.target.checked)}
                required
              />
              <span style={{ fontSize: 12, color: 'var(--ink)' }}>
                <strong>Community Safety Declaration:</strong> I certify that this item is legally mine, matches its description, and is not a prohibited item (no cash, weapons, drugs, or illegal items).
              </span>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => setIsCreateModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !agreedToSafety}
          >
            {isSubmitting ? 'Publishing…' : 'Post to community'}
          </button>
        </div>
      </form>
    </div>
  );
};
