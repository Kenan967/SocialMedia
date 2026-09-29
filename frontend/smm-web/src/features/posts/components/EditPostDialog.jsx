import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost } from '../api/postsApi';

export default function EditPostDialog({ open, post, onClose }) {
  const queryClient = useQueryClient();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !post) {
      return;
    }

    setContent(post.content ?? '');
    setImage(null);
    setVideo(null);
    setRemoveImage(false);
    setRemoveVideo(false);
    setError('');
  }, [open, post]);

  const mutation = useMutation({
    mutationFn: () =>
      updatePost({
        postId: post.id,
        content,
        image,
        video,
        removeImage,
        removeVideo,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      onClose();
    },
    onError: (error) => {
      setError(
        error?.response?.data?.message ||
          'Post could not be updated.'
      );
    },
  });

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image.');
      return;
    }

    setError('');
    setImage(file);
    setVideo(null);
    setRemoveImage(false);
    setRemoveVideo(false);

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }

  function handleVideoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video.');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      setError('Video must be smaller than 150 MB.');
      return;
    }

    setError('');
    setVideo(file);
    setImage(null);
    setRemoveImage(false);
    setRemoveVideo(false);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  function handleRemoveImage() {
    setImage(null);
    setRemoveImage(true);
    setRemoveVideo(false);
  }

  function handleRemoveVideo() {
    setVideo(null);
    setRemoveVideo(true);
    setRemoveImage(false);
  }

  function handleSubmit() {
    if (
      !content.trim() &&
      !image &&
      !video &&
      (removeImage || removeVideo || post.imageUrl || post.videoUrl)
    ) {
      // Backend will decide if the post is empty.
    }

    mutation.mutate();
  }

  return (
    <Dialog
      open={open}
      onClose={mutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pr: 6 }}>
        Edit Post
        <IconButton
          onClick={onClose}
          disabled={mutation.isPending}
          sx={{ position: 'absolute', right: 10, top: 10 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          {post?.imageUrl && !removeImage && !image && (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Current image
              </Typography>
              <Button variant="outlined" onClick={handleRemoveImage}>
                Remove image
              </Button>
            </Stack>
          )}

          {post?.videoUrl && !removeVideo && !video && (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Current video
              </Typography>
              <Button variant="outlined" onClick={handleRemoveVideo}>
                Remove video
              </Button>
            </Stack>
          )}

          <Stack direction="row" spacing={1}>
            <input
              ref={imageInputRef}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
            />
            <input
              ref={videoInputRef}
              hidden
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
            />

            <Button
              variant="outlined"
              onClick={() => imageInputRef.current?.click()}
              disabled={Boolean(video)}
            >
              New image
            </Button>

            <Button
              variant="outlined"
              onClick={() => videoInputRef.current?.click()}
              disabled={Boolean(image)}
            >
              New video
            </Button>
          </Stack>

          {image && (
            <Typography variant="body2">Selected image: {image.name}</Typography>
          )}

          {video && (
            <Typography variant="body2">Selected video: {video.name}</Typography>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
