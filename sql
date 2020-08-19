//INITIAL SETUP

CREATE TABLE student 
( 
fname character varying(50), 
lname character varying(20) ,
status character varying(30), 
mobile character varying(12),
id serial NOT NULL
);

CREATE TABLE columnNames (columnNames VARCHAR)
INSERT INTO columnNames (columnNames) values ('fname, lname, mobile, status');
