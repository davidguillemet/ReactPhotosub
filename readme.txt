# Commands from root directory

# set a config variable 
# firebase functions:config:set postgresql.instance="photosub-postgres"

# get environment configuration
# firebase functions:config:get

# start functions emulator
# export GOOGLE_APPLICATION_CREDENTIALS=../../gcp/photosub-5c66182af76f.json && firebase emulators:start
firebase emulators:start --only hosting,functions

# Build React app for Firebase simulators
npm run-script build

# Build React app for deployment purpose
npm run-script build4deploy

# Deploy the Firebase application
firebase deploy
firebase deploy --only functions:newImage
firebase deploy --only functions:deleteImage
firebase deploy --only functions:newImage,functions:deleteImage

// Firebase Admin storage API
https://googleapis.dev/nodejs/storage/latest/

# test des meta tags open graph (og:title, og:description, og:image)
# see https://codeburst.io/og-tags-882fd6c7a94e
==> https://developers.facebook.com/tools/debug/