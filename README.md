SANTOKRITI
-------TRAVEL GUIDE

WARNING: visit postgres branch for bug fixes etc

Lefteris and Panos welcome you to the mythical island of Santokriti!

If you want to run the app locally on your computer (which isn't advised btw :( ),
you need to install PostgreSQL and create a database.
After you download the code as ZIP from this GitHub repo, unzip it and run npm install
The only things you need to change, so that you can run the app, are:
1. in the .env file: change DATABASE_URL to postgresql://username:password@localhost:port/databasename
2. in the tg-model-postgres.mjs file: uncomment the second line in the Pool constructor
3. in the tg-model-postgres.mjs file again: in the getAllPlaces function ensure that the initializeDatabase() runs
4. after that, run in your terminal npm start and register two users. WARNING: THE SECOND USER MUST BE A SHOPKEEPER
5. after creating the two users, in the tg-model-postgres.mjs file comment the initializeDatabase() command and
    uncomment the populatePlace... command
NOW YOU ARE READY TO USE THE APP LOCALLY
Sorry for the inconvenience, we are just students :)

            ____________________________
MADE BY     |     LEFTERIS + PANOS     |
            ----------------------------
