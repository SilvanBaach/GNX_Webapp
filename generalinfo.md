# General Information

## CSS

* Create super CSS for headings texts buttons tables etc. Those get implemented in dashboard.ejs and are automatically available in all subpages
* Every ejs file gets one css file for page specific css

## Express Server

* Create different Routers for the routes and don't put everything into server.js

## Javascript

* Try to write as much client side js in external files as possible
* If you write js utility classes implement them in dashboard.ejs so they are available to all supages

## Top Nav Bar

* Write the top header bar from login and all register pages in a sperate html file and load it runtime

## Database

* The teamgenetix Database is the master db and you are not allowed to use this db for developement
* If you need to create new fields, create them in the master db fill in some test data and fork this database again
* You individual database should be namend teamgenetix_[YOUR-NAME]
