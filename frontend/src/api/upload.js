import { apiClient } from "./client.js";

/**
 * Upload une vidéo vers le backend.
 * Retourne l'URL publique de la vidéo.
 */
export async function uploadVideoRequest(file, onProgress) {
  const formData = new FormData();

  formData.append("video", file);

  const { data } = await apiClient.post(
    "/api/uploads/video",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },

      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          const percent = Math.round(
            (evt.loaded * 100) / evt.total
          );

          onProgress(percent);
        }
      },
    }
  );

  return data.url;
}