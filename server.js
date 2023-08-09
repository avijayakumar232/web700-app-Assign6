/*********************************************************************************
* WEB700 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Akshaya Vijayakumar Student ID: 126007228 Date: 12 July 2023
*
* Online (Cyclic) Link: 
********************************************************************************/

const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const collegeData = require("./modules/collegeData");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

collegeData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error(err);
  });

// Middleware function to set active route for navigation
app.use(function(req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

// Custom Handlebars helper for navigation links
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',  
  helpers: {
    navLink: function(url, options) {
      return `<li${(url == app.locals.activeRoute) ? ' class="nav-item active"' : ' class="nav-item"'}><a class="nav-link" href="${url}">${options.fn(this)}</a></li>`;
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
});

// Configure Handlebars engine with custom helpers
app.engine('.hbs', hbs.engine);

// Set the view engine
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/students", (req, res) => {
  collegeData
    .getAllStudents()
    .then((students) => {
      if (req.query.course) {
        collegeData
          .getStudentsByCourse(parseInt(req.query.course))
          .then((filteredStudents) => {
            if (filteredStudents.length > 0) {
              res.render("students", { students: filteredStudents });
            } else {
              res.render("students", { message: "No results" });
            }
          })
          .catch(() => {
            res.render("students", { message: "No results" });
          });
      } else {
        if (students.length > 0) {
          res.render("students", { students });
        } else {
          res.render("students", { message: "No results" });
        }
      }
    })
    .catch(() => {
      res.render("students", { message: "No results" });
    });
});


app.get('/courses', (req, res) => {
  collegeData.getCourses()
    .then((courses) => {
      if (courses.length > 0) {
        res.render('courses', { courses });
      } else {
        res.render('courses', { message: 'No results' });
      }
    })
    .catch(() => {
      res.render('courses', { message: 'An error occurred' });
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
    .getCourseById(courseId)
    .then((course) => {
      res.render("course", { course: course });
    })
    .catch((err) => {
      res.status(404).send("Course not found.");
    });
});


app.get("/student/:studentNum", (req, res) => {
  let viewData = {};
  collegeData.getStudentByNum(req.params.studentNum)
    .then((student) => {
      viewData.student = student || null;
    })
    .catch(() => {
      viewData.student = null;
    })
    .then(collegeData.getCourses)
    .then((courses) => {
      viewData.courses = courses;
      for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.courses = [];
    })
    .then(() => {
      if (viewData.student == null) {
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData });
      }
    });
});



app.get("/", (req, res) => {
  res.render('home');
});

app.get("/about", (req, res) => {
  res.render('about'); // Render the "about.hbs" file using the default layout
});

app.get("/htmlDemo", (req, res) => {
  res.render('htmlDemo'); // Render the "htmlDemo.hbs" file using the default layout
});

app.get("/students/add", (req, res) => {
  collegeData.getCourses()
    .then((courses) => {
      res.render("addStudent", { courses: courses });
    })
    .catch(() => {
      res.render("addStudent", { courses: [] });
    });
});


app.post('/students/add', (req, res) => {
  const studentData = req.body;
  collegeData.addStudent(studentData)
    .then(() => {
      res.redirect('/students');
    })
    .catch((err) => {
      res.status(500).send('An error occurred while adding the student.');
    });
});



app.post("/student/update", (req, res) => {
  const studentData = req.body;
  collegeData
    .updateStudent(studentData)
    .then(() => {
      console.log("Student updated:", studentData);
      res.redirect("/students");
    })
    .catch((err) => {
      console.error("Error updating student:", err);
      res.status(500).send("An error occurred while updating the student.");
    });
});


app.get("/courses/add", function(req, res) {
  res.render("addCourse");
});

// POST route to handle adding a new course
app.post("/courses/add", function(req, res) {
  collegeData.addCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch(() => {
      res.status(500).send("Unable to Add Course");
    });
});

// POST route to handle updating a course
app.post("/course/update", function(req, res) {
  collegeData.updateCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch(() => {
      res.status(500).send("Unable to Update Course");
    });
});

// GET route to display a specific course for updating
app.get("/course/:id", function(req, res) {
  collegeData.getCourseById(req.params.id)
    .then((data) => {
      if (!data) {
        res.status(404).send("Course Not Found");
      } else {
        res.render("course", { course: data });
      }
    })
    .catch(() => {
      res.status(500).send("Unable to Retrieve Course");
    });
});

// GET route to handle deleting a course
app.get("/course/delete/:id", function(req, res) {
  collegeData.deleteCourseById(req.params.id)
    .then(() => {
      res.redirect("/courses");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Course / Course not found");
    });
});


app.get("/student/delete/:studentNum", (req, res) => {
  const studentNum = parseInt(req.params.studentNum);
  collegeData.deleteStudentByNum(studentNum)
    .then(() => {
      res.redirect('/students');
    })
    .catch((err) => {
      res.status(500).send('Unable to Remove Student / Student not found');
    });
});


app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});


