export const awsConfig = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

if (!awsConfig.region || !awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
  console.error('AWS configuration is incomplete. Please check your environment variables.');
}
