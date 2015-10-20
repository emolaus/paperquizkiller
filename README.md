# README #

### What is this repository for? ###

A node, express, angular and mongo powered site where math teachers can generete tests from a database of math problems and students can take the tests. The problems are randomized so that two tests are similar but not quite the same. 

Version 0: a bare-bones application setup using express-generator. </br>
Version 1: a pitch site and a demo flow of the application. </br>
Version 2: "distribute" page, and quiz pages generated for each student.  </br>
Version 3: a rudimentary dashboard with summaries of quiz results.  </br>

The actual database is not included in the repo.

### How do I get set up? ###

Install node, I'm using v. 0.10.25

Install npm, I'm using v. 1.3.10

Install mongodb, I'm using v. 3.0.6

Download mathjax under public/libs/mathjax/, I'm using v. 2.5

Start mongod with `mongod --dbpath <app-path>/data`

First time running, run `npm install`

Start app with `npm start`

Visit localhost:3000/ To see the gorgeous bootstrap pitch site. 
Visit localhost:3000/tryit.html to build a test.