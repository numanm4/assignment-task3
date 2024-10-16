import axios, { AxiosResponse } from 'axios';

const imageApi = axios.create({
  baseURL: 'https://freeimage.host/api/1/upload',
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const uploadImage = async (imageUri: string): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append('source', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);

  formData.append('action', 'upload');
  formData.append('type', 'file');
  formData.append('key', '6d207e02198a847aa98d0a2a901485a5'); 

  try {
    return await imageApi.post('/', formData);
  } catch (error) {
    console.error('Image upload error:', (error as any).response?.data || (error as any).message);
    throw error;
  }
};
