#PWK-DBBuild

PWK-DBBuild is a portion of a larger demonstration for a MEAN-stack
application - White Kodiak - viewable at https://github.com/hdub2/Project-White-Kodiak.

dbBuild.js is used to populate a db of dummy users in order to properly test the
functions of White Kodiak for searching users.  Users are retrieved from an included
JSON file.  dbBuild.js then uses Promises to dispatch an array of asynchronous
functions that concurrently retrieve geocoding information for all the users from
google's geocoding web service.  The users are then written back to the users
collection of the db.
