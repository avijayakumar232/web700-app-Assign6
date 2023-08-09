
const Sequelize = require('sequelize');

const sequelize = new Sequelize('jsvfpymm', 'jsvfpymm', 'rVr_PFqN4WFHAz_cZvMC-K0IqpHk47L8', {
  host: 'batyr.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// Define Student model
const Student = sequelize.define('Student', {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING
});

// Define Course model
const Course = sequelize.define('Course', {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseCode: Sequelize.STRING,
  courseDescription: Sequelize.STRING
});

// Define relationship: Course has many Students
Course.hasMany(Student, { foreignKey: 'course' });

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

// Initialize Sequelize
function initialize() {
  return sequelize.sync()
    .then(() => {
      return Promise.resolve();
    })
    .catch((err) => {
      return Promise.reject("Unable to sync the database");
    });
}

// Fetch all students
function getAllStudents() {
  return Student.findAll()
    .then((students) => {
      return Promise.resolve(students);
    })
    .catch(() => {
      return Promise.reject("No results returned");
    });
}

// Fetch students by course
function getStudentsByCourse(course) {
  return Student.findAll({
    where: {
      course: course
    }
  })
  .then((students) => {
    return Promise.resolve(students);
  })
  .catch(() => {
    return Promise.reject("No results returned");
  });
}

// Fetch student by student number
function getStudentByNum(num) {
  return Student.findOne({
    where: {
      studentNum: num
    }
  })
  .then((student) => {
    return Promise.resolve(student);
  })
  .catch(() => {
    return Promise.reject("No results returned");
  });
}

// Fetch all courses
function getCourses() {
  return Course.findAll()
    .then((courses) => {
      return Promise.resolve(courses);
    })
    .catch(() => {
      return Promise.reject("No results returned");
    });
}

// Fetch course by course ID
function getCourseById(id) {
  return Course.findOne({
    where: {
      courseId: id
    }
  })
  .then((course) => {
    return Promise.resolve(course);
  })
  .catch(() => {
    return Promise.reject("Query returned 0 results");
  });
}

// Add a new student
function addStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (const key in studentData) {
    if (studentData[key] === "") {
      studentData[key] = null;
    }
  }

  return Student.create(studentData)
    .then(() => {
      return Promise.resolve();
    })
    .catch(() => {
      return Promise.reject("Unable to create student");
    });
}

// Update an existing student
function updateStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (const key in studentData) {
    if (studentData[key] === "") {
      studentData[key] = null;
    }
  }

  return Student.update(studentData, {
    where: {
      studentNum: studentData.studentNum
    }
  })
  .then(() => {
    return Promise.resolve();
  })
  .catch(() => {
    return Promise.reject("Unable to update student");
  });
}

// Fetch all TAs
function getTAs() {
  return Student.findAll({
    where: {
      TA: true
    }
  })
  .then((TAs) => {
    return Promise.resolve(TAs);
  })
  .catch(() => {
    return Promise.reject("No TAs found");
  });
}

function addCourse(courseData) {
  for (let property in courseData) {
    if (courseData[property] === "") {
      courseData[property] = null;
    }
  }
  
  return Course.create(courseData)
    .then(() => {
      return Promise.resolve();
    })
    .catch(() => {
      return Promise.reject("Unable to create course");
    });
}

function updateCourse(courseData) {
  for (let property in courseData) {
    if (courseData[property] === "") {
      courseData[property] = null;
    }
  }
  
  return Course.update(courseData, {
    where: {
      courseId: courseData.courseId
    }
  })
    .then(() => {
      return Promise.resolve();
    })
    .catch(() => {
      return Promise.reject("Unable to update course");
    });
}

function deleteCourseById(id) {
  return Course.destroy({
    where: {
      courseId: id
    }
  })
    .then(() => {
      return Promise.resolve();
    })
    .catch(() => {
      return Promise.reject("Unable to delete course");
    });
}

function deleteStudentByNum(studentNum) {
  return new Promise((resolve, reject) => {
    Student.destroy({
      where: {
        studentNum: studentNum
      }
    })
    .then((rowsDeleted) => {
      if (rowsDeleted === 1) {
        resolve();
      } else {
        reject(new Error('Student not found'));
      }
    })
    .catch((err) => {
      reject(err);
    });
  });
}



module.exports = {
  initialize,
  getAllStudents,
  getTAs,
  getCourses,
  getStudentsByCourse,
  getStudentByNum,
  getCourseById,
  updateStudent,
  addStudent,
  addCourse,
  updateCourse,
  deleteCourseById,
  deleteStudentByNum
};
