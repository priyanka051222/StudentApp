module.exports = {
  getColumns: function (req, res) {
    var pg = require("pg");

    //You can run command "heroku config" to see what is Database URL from Heroku belt

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:Gspann123@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect();

    client.query("select * from columnNames").then(function (result) {
      client.end();
      res.writeHead(200, { "Content-Type": "text/plain" });
      console.log(JSON.stringify(result.rows, null, "    "));
      res.write(JSON.stringify(result.rows, null, "    ") + "\n");
      res.end();
    });
  },
  getRecords: function (req, res) {
    var pg = require("pg");

    //You can run command "heroku config" to see what is Database URL from Heroku belt

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:Gspann123@localhost:5432/test";
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
      "postgres://postgres:Gspann123@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect().then(function (result) {
      console.log("connect success");
    });
    var fields = req.query;
    console.log(fields);
    var columns = [];
    var values = [];
    for (i in fields) {
      columns.push(i);
      values.push(fields[i]);
    }
    columns = columns.join(",");
    var VALUES = "";
    console.log(values.length);
    for (var i = 0; i < values.length; i++) {
      if (i < values.length - 1) {
        VALUES = VALUES + "'" + values[i] + "',";
      } else {
        VALUES = VALUES + "'" + values[i] + "'";
      }
    }
    var QUERYEXP =
      "insert into student (" + columns + ") " + "values (" + VALUES + ")";

    console.log(QUERYEXP);
    client.query(QUERYEXP).then(function (result) {
      client.end();
      res.write("Success");
      res.end();
    });
  },
  updateRecord: function (req, res) {
    var pg = require("pg");

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:Gspann123@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect().then(function (result) {
      console.log("connect success");
    });
    var fields = req.query;
    console.log(fields);
    var columns = [];
    var values = [];
    for (i in fields) {
      columns.push(i);
      values.push(fields[i]);
    }
    columns = columns.join(",");
    var VALUES = "";
    console.log(values.length);
    for (var i = 0; i < values.length; i++) {
      if (i < values.length - 1) {
        VALUES = VALUES + "'" + values[i] + "',";
      } else {
        VALUES = VALUES + "'" + values[i] + "'";
      }
    }
    var QUERYEXP =
      "update student set (" + columns + ") = " + "(" + VALUES + ") where id="+req.query.id;
    console.log(QUERYEXP);
      client.query(QUERYEXP).then(function (result) {
        client.end();
        res.write("Success");
        res.end();
      });
  },
  delRecord: function (req, res) {
    var pg = require("pg");

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:Gspann123@localhost:5432/test";
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
      "postgres://postgres:Gspann123@localhost:5432/test";
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

  alterTable: function (req, res) {
    var pg = require("pg");

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:Gspann123@localhost:5432/test";
    var client = new pg.Client(conString);

    client.connect();

    var query = client.query(
      "ALTER TABLE student ADD COLUMN " + req.query.column + " VARCHAR"
    );

    query.then(function (result) {
      client.query("DELETE FROM columnNames").then(function (result) {
        query = client.query(
          "INSERT into columnNames (columnNames) values" +
            "('" +
            req.query.columns +
            ", " +
            req.query.column +
            "')"
        );

        query.then(function (result) {
          client.end();
          res.write("Column added");
          res.end();
        });
      });
    });
  },

  dropTable: function (req, res) {
    var pg = require("pg");

    var conString =
      process.env.DATABASE_URL ||
      "postgres://postgres:Gspann123@localhost:5432/test";
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
