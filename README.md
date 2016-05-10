# README #

### What is this repository for? ###

A node, express, angular and mongo powered site where math teachers can generete tests from a database of math problems and students can take the tests. The problems are randomized so that two tests are similar but not quite the same. 

Version 0: a bare-bones application setup using express-generator.  
Version 1: a pitch site and a demo flow of the application.  
Version 2: "distribute" page, and quiz pages generated for each student.  
Version 3: a rudimentary dashboard with summaries of quiz results.  
Version 4: create classes, distribute to entire class. 

The actual database is not included in the repo.

### How do I get set up? ###

Install node, I'm using v. 0.10.25

Install npm, I'm using v. 1.3.10

Install mongodb, I'm using v. 3.0.6

Download mathjax under public/libs/mathjax/, I'm using v. 2.5

Start mongod with `mongod --dbpath <app-path>/data` or on Debian (systemd) see http://andyfelong.com/2016/01/mongodb-3-0-9-binaries-for-raspberry-pi-2-jessie/

First time running, run `npm install`

Start app with `npm start`
Or debug with `node-debug bin/www`

Visit localhost:3000/ To see the gorgeous bootstrap pitch site. 
Visit localhost:3000/createQuiz to build a quiz.
