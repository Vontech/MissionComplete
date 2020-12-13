const AWS = require('aws-sdk');

import config from './config';

// AWS configuration (S3 bucket for profile pictures)
AWS.config.update({
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey
});

let s3 = new AWS.S3();

export async function getProfileImage(objectKey){
    return s3.getObject(
        {
            Bucket: config.awsProfilePictureBucket,
            Key: objectKey
        }
      
    ).promise();
}

export default s3;