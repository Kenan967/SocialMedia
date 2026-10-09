import api from '../../../api/axios';

export async function getPosts({
  page = 1,
  pageSize = 10,
  search = '',
}) {
  const response = await api.get('/posts', {
    params: {
      page,
      pageSize,
      search,
    },
  });

  return response.data;
}

export async function createPost({
  content,
  image,
  video,
}) {
  const formData = new FormData();

  if (content?.trim()) {
    formData.append(
      'content',
      content.trim()
    );
  }

  if (image) {
    formData.append('image', image);
  }

  if (video) {
    formData.append('video', video);
  }

  const response = await api.post(
    '/posts',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function likePost(postId) {
  const response = await api.post(
    `/posts/${postId}/like`
  );

  return response.data;
}

export async function unlikePost(postId) {
  const response = await api.delete(
    `/posts/${postId}/like`
  );

  return response.data;
}

export async function updatePost({
  postId,
  content,
  image,
  video,
  removeImage = false,
  removeVideo = false,
}) {
  const formData = new FormData();

  formData.append('content', content?.trim() ?? '');
  formData.append('removeImage', String(removeImage));
  formData.append('removeVideo', String(removeVideo));

  if (image) {
    formData.append('image', image);
  }

  if (video) {
    formData.append('video', video);
  }

  const response = await api.put(
    `/posts/${postId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function deletePost(postId) {
  await api.delete(`/posts/${postId}`);
}
