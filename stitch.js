const client = stitch.Stitch.initializeDefaultAppClient('odraw-ouzze');

const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('odraw');

client.auth.loginWithCredential(new stitch.AnonymousCredential()).catch(err => {
  console.error(err)
});
