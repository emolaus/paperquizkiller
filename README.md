# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

A node, express and mongo powered site where math teachers can generete tests from a database of math problems and students can take the tests. The problems are randomized so that two tests are similar but not quite the same. 

Version 0: a bare-bones application setup using express-generator.

The actual database is not included in the repo.

### How do I get set up? ###

Install node, I'm using 0.10.25

Install npm, I'm using 1.3.10

Install mongodb, I'm using 3.0.6

Start mongod with `mongod --dbpath <app-path>/data`

First time running, run `npm install`

Start app with `npm start`