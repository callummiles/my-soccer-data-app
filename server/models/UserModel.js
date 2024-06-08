import { astraClient } from '../config/astraClient.js';

const basePath = `/api/rest/v2/namespaces/testks/collections/users`;

export const createUser = async (userData) => {
  try {
    const client = await astraClient;
    const response = await client.post(basePath, userData);
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const deleteUser = async (userId) => {
  try {
    const client = await astraClient;
    const response = await client.delete(`${basePath}/${userId}`);
    return response;
  } catch (e) {
    console.error(e);
  }
};
