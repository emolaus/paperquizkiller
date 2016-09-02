# README #

### What is this repository for? ###

Paper quiz killer is a web tool where math teachers can 
* Create and share quiz problems
* Generate and reuse quizzes and have them sent out
* Have the quizzes corrected by the server
* Get an overview over classes and individuals in a dashboard

Oh, and you can parametrize the problems so that A + B =
Is randomly initated to e.g. 2 + 3 = or 1 + 2 =. 
In other words, the problems are randomized so that two tests are similar but not quite the same. 

Paper quiz killer is powered by node, express, angular and mongodb.

Current status: demo flow where the teacher can 
* Generate a quiz for a example class
* Visit each the quiz, submit them and get the results
* Inspect the results on a dashboard

Version 0: a bare-bones application setup using express-generator.  
Version 1: a pitch site and a demo flow of the application.  
Version 2: "distribute" page, and quiz pages generated for each student.  
Version 3: a rudimentary dashboard with summaries of quiz results.  
Version 4: create classes, distribute to entire class. 


The actual database is not included in the repo, but some initial data is added to play around with.

### How do I get set up? ###

Install node, I'm using v. 0.10.25

Install npm, I'm using v. 1.3.10

Install mongodb, I'm using v. 3.0.6

Download mathjax under public/libs/mathjax/, I'm using v. 2.5

Start mongod with `mongod --dbpath <app-path>/data` or on Debian (systemd) see http://andyfelong.com/2016/01/mongodb-3-0-9-binaries-for-raspberry-pi-2-jessie/

First time running, run `npm install`

Start app with `npm start`
Or debug with `node-debug bin/www`

There is a dummy user with name 'test' and password 'abc'.

Visit localhost:<PORT>/ To see the gorgeous bootstrap pitch site. 
Visit localhost:<PORT>/createQuiz to build a quiz.
