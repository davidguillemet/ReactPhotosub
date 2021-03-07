# Commands from root directory

# set a config variable 
# firebase functions:config:set postgresql.instance="photosub-postgres"

# start functions emulator
# export GOOGLE_APPLICATION_CREDENTIALS=../../gcp/photosub-5c66182af76f.json && firebase emulators:start

# Build React app for Firebase simulators
npm run-script build

# Deploy the Firebase application
firebase deploy