# auction-system
An online real-time multiplayer auction system

Instructions to install and configure prerequisites or dependencies
===================================================================
1. Open a terminal at the root of the project folder
2. Run `npm install sqlite3` to get your platform build for sqlite3 

Instructions to create and initialize the database
==================================================
1. The sqlite database is already bundled with the project

Assumptions I made
==================
1. I assumed users of the application cannot create arbitrary inventories
2. I assumed the inventories have the same name hence spellings like carrot and carrots will not work appropriately when
   balancing inventories after an auction is ended
3. I assumed that the user who placed the winner bid is online to end the auction


Requirements that I did not covered in my submission
====================================================
None


Instructions to configure and prepare the source code to build and run properly
===============================================================================
1. Make sure to get the platform build for sqlite3 by running `npm rebuild`
2. Run `npm start` to run the application and point your browser to http://localhost:3000 to view the application


Instructions to prepare and run the test suites
===============================================
1. Make sure to get the platform build for sqlite3 by running `npm rebuild`
2. The angular tests needs Chrome browser to run.
3. Run `npm run test-express` to run the express tests
4. Run `npm run test-client` to run the angular tests
5. Run `npm run test` to run both tests

Issues you have faced while completing the assignment
=====================================================
1. Testing sockets emits in express


Constructive feedback for improving the assignment
==================================================
1. The assignment doesn't include adding an escrow to temporarily hold all inventories which was set for auction hence enabling
   users to continue setting them up for auction when they no longer have them




