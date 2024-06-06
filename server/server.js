/* eslint-disable no-undef */
import express from 'express';
import ViteExpress from 'vite-express';

import dotenv from 'dotenv';

const app = express();

dotenv.config();

import { createClient } from '@astrajs/rest';

async function main() {
  // create an Astra DB client
  const astraClient = await createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    applicationToken: process.env.ASTRA_DB_APP_TOKEN,
  });
  console.log('Connection to Astra OK, baseUrl is: ' + astraClient.baseUrl);
  console.log('Using token: ', process.env.ASTRA_DB_APP_TOKEN);

  const basePath = `/api/rest/v2/namespaces/testks/collections/users`;
  console.log('basePath is: ' + basePath + '');

  // create a new user without a document id
  const putNewUserRes = await astraClient.post(basePath, {
    name: 'cliff',
  });
  console.log(
    'New user without a document ID: ',
    putNewUserRes.data,
    putNewUserRes.status
  );

  // create a new user with a document id
  const putNewUserWithIdRes = await astraClient.put(
    `${basePath}/cliff@wicklow.com`,
    {
      name: 'cliff',
    }
  );
  console.log(
    'New user with a document ID: ',
    putNewUserWithIdRes.data,
    putNewUserWithIdRes.status
  );

  // create a user subdocument
  const putUserSubdocumentRes = await astraClient.put(
    `${basePath}/cliff@wicklow.com/blog`,
    {
      title: 'new blog',
    }
  );
  console.log(
    'Create a user subdocument: ',
    putUserSubdocumentRes.data,
    putUserSubdocumentRes.status
  );

  // get a single user by document id
  const getUserRes = await astraClient.get(`${basePath}/cliff@wicklow.com`);
  console.log('Get user by document ID: ', getUserRes.data, getUserRes.status);

  // get a subdocument by path
  const getSubdocumentRes = await astraClient.get(
    `${basePath}/cliff@wicklow.com/blog`
  );
  console.log(
    'Get a subdocument: ',
    getSubdocumentRes.data,
    getSubdocumentRes.status
  );

  // search a collection of documents
  const getDocumentCollectionRes = await astraClient.get(basePath, {
    params: {
      where: {
        name: { $eq: 'cliff' },
      },
    },
  });
  console.log(
    'Search a collection of documents',
    getDocumentCollectionRes.data,
    getDocumentCollectionRes.status
  );

  // partially update user
  const patchUserRes = await astraClient.patch(
    `${basePath}/cliff@wicklow.com`,
    {
      name: 'Cliff',
    }
  );
  console.log('Partially update user', patchUserRes.data, patchUserRes.status);

  // delete a user
  const deleteUserRes = await astraClient.delete(
    `${basePath}/cliff@wicklow.com`
  );
  console.log("Delete user 'cliff@wicklow.com'", deleteUserRes.status);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

app.get('/message', (_, res) => res.send('Hello from express!'));

ViteExpress.listen(app, 3000, () => console.log('Server is listening...'));
