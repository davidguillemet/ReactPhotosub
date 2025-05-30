# Commands from root directory

# set a config variable 
# firebase functions:config:set postgresql.instance="photosub-postgres"

# get environment configuration
# firebase functions:config:get


##########################################
# Secret Key management
##########################################
# Change the value of an existing secret
firebase functions:secrets:set SECRET_NAME

# View the value of a secret
firebase functions:secrets:access SECRET_NAME

# Destroy a secret
firebase functions:secrets:destroy SECRET_NAME

# View all secret versions and their state
firebase functions:secrets:get SECRET_NAME

# Automatically clean up all secrets that aren't referenced by any of your functions
firebase functions:secrets:prune

##########################################


# start functions emulator
# export GOOGLE_APPLICATION_CREDENTIALS=../../gcp/photosub-5c66182af76f.json && firebase emulators:start
firebase emulators:start --only hosting,functions
export GOOGLE_APPLICATION_CREDENTIALS=../../gcp/photosub-5c66182af76f.json && firebase emulators:start --import ./firebase-snapshot --inspect-functions

clear && firebase emulators:start --import ./firebase-snapshot --inspect-functions

firebase emulators:export ./firebase-snapshot
-> npm run-script firebase

# Build React app for Firebase simulators
npm run-script build

# .env files priority from right to left (left priority is higher)
npm start: .env.development.local > .env.local > .env.development > .env
npm run build: .env.production.local > .env.local > .env.production > .env

# Build React app for deployment purpose
npm run-script build4deploy

# Deploy the Firebase application
firebase deploy
firebase deploy --only functions
firebase deploy --only functions:newImage
firebase deploy --only functions:deleteImage
firebase deploy --only functions:newImage,functions:deleteImage

// Firebase Admin storage API
https://googleapis.dev/nodejs/storage/latest/

# test des meta tags open graph (og:title, og:description, og:image)
# see https://codeburst.io/og-tags-882fd6c7a94e
==> https://developers.facebook.com/tools/debug/

// Download bucket content recursively and copy to static-storage
gsutil cp -r "gs://photosub.appspot.com/2020/romblon" ./public/static-storage/2020

// Insert new Destination
insert into destinations (title, date, location, path, cover, macro, wide)
VALUES ('Anilao', '2016-02-14', 3, '2016/anilao', 'DSC_6734.jpg', true, false)

// Insert new location
insert into locations (title, region, latitude, longitude, link)
VALUES ('Phocea Mexico', 1, 24.183915161569107, -110.30225921922795, 'https://myphocea.com/plongee-mexique')

// Create destinations view with region path
DROP VIEW IF EXISTS destinations_with_regionpath;
CREATE VIEW destinations_with_regionpath AS (
    SELECT destinations.*, (
        WITH RECURSIVE regionpath AS (
                SELECT
                reg.id, reg.title, reg.parent
                FROM regions reg
                WHERE reg.id = locations.region
                UNION ALL
                SELECT r.id, r.title, r.parent
                FROM regions r
                JOIN regionpath ON r.id = regionpath.parent
            )
        SELECT ARRAY(select json_build_object('id', id, 'title', title, 'parent', parent) from regionpath)
    ) as regionpath
    from locations, destinations
    where locations.id = destinations.location
);
select * from destinations_with_regionpath;


