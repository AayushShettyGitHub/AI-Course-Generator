const express = require('express');
const router = express.Router();

module.exports = (io) => {
  const publish = require("../Controller/publish")(io);

  router.get("/courses/others", publish.getCoursesByOtherUsers);
  router.get("/courses/mine", publish.getCoursesByCurrentUser);
  router.post("/courses/add", publish.publishCourse);
  router.delete("/courses/delete/:courseId", publish.deleteCourse);

  return router;
};
