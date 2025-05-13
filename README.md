This is a web application that students used to enter the "participation" grades of their classmates that were in the same group as them, as a way of ranking how much of the projects were done by which people.
This was my first attempt at something like this, and since the basic usability of it actually ended up working after some trial and error, I decided to put it live for the students.
This was accomplished using pretty simple framework. I used Node.js and SQLite3 for the backend/storage, with javascript to help with some of the functionality and presentation of the html pages;
1 page was for the students, obviously, to enter the grades. The second page was an admin page for the professor of the class to use and see the results, where the total scores of students were summed together,
and would later be used to factor in to calculating their final grades. The admin page was/is protected by a password.
I hosted the web application using Heroku.

TLDR:
General Overview of Project
* Simple, basic frontend framework
* JavaScript for html pages to improve functionality and display based on user inputs
* Used Node.js for backend purposes
* Used SQLite3 for database storage
* Had password protected admin page to view results
