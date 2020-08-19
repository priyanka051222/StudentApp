module.exports = {
  getRecords: function (req, res) {
    var pg = require("pg");

    //You can run command "heroku config" to see what is Database URL from Heroku belt

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:yourpassword@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect();

    client.query("select * from student").then(function (result) {
      client.end();
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(JSON.stringify(result.rows, null, "    ") + "\n");
      res.end();
    });
  },

  addRecord: function (req, res) {
    var pg = require("pg");

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:yourpassword@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect();
    client
      .query(
        "insert into student (fname,lname,status,mobile) " +
          "values ('" +
          req.query.fname +
          "','" +
          req.query.lname +
          "','" +
          req.query.status +
          "','" +
          req.query.mbl +
          "')"
      )
      .then(function (result) {
        client.end();
        res.write("Success");
        res.end();
      });
  },

  delRecord: function (req, res) {
    var pg = require("pg");

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:yourpassword@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect();

    var query = client.query("Delete from student Where id =" + req.query.id);

    query.then(function (result) {
      client.end();
      res.write("Success");
      res.end();
    });
  },

  createTable: function (req, res) {
    var pg = require("pg");

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:yourpassword@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect();

    var query = client.query(
      "CREATE TABLE student" +
        "(" +
        "fname character varying(50)," +
        "lname character varying(20)," +
        "status character varying(30)," +
        "mobile character varying(12)," +
        "id serial NOT NULL" +
        ")"
    );

    query.then(function (result) {
      client.end();
      res.write("Table Schema Created");
      res.end();
    });
  },

  dropTable: function (req, res) {
    var pg = require("pg");

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:yourpassword@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect();

    var query = client.query("Drop TABLE student");

    query.then(function (result) {
      client.end();
      res.write("Table Schema Deleted");
      res.end();
    });
  },
};
