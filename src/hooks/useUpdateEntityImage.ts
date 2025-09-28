import axiosClient from "@/lib/axiosClient";
import { useState } from "react";
import { toast } from "sonner";

export function useUpdateEntityImage() {
  const [loading, setLoading] = useState(false);

  const updateImage = async (
    entityId: string,
    accountType: string,
    fileOrUrl: File | string
  ) => {
    const formData = new FormData();

    if (fileOrUrl instanceof File) {
      formData.append("new_image", fileOrUrl);
    } else {
      formData.append("new_image", fileOrUrl);
    }

    const promise = axiosClient.put<{ message: string }>(
      `/entity/update/image/${entityId}/${accountType}`,
      formData
    );

    toast.promise(promise, {
      loading: "Updating image...",
      success: (res) => res.data.message || "Image updated successfully!",
      error: (err) => err.response?.data?.message || "Failed to update image",
    });

    try {
      setLoading(true);
      const response = await promise;
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  return { updateImage, loading };
}
