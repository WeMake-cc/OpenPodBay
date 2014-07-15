// TODO: consistent names with tables, santodio
// TODO: logging strategy!

var dblite = require('dblite'),
    db = dblite(__dirname+'/db/database.db'),
    u = require(__dirname+'/../utils.js');

var UserSchema = {
    user_id: Number,
    username: String,
    group: String,
    active: Number
};

var TagSchema = {
    tag_id: Number,
    user_id: Number,
    type: String,
    value: String,
    active: Number
};

var NodeSchema = {};
var ReservationSchema = {};

module.exports = {
    getUsers: function(callback) {
        var query = 'SELECT * FROM User';
        u.getLogger().db(query);

        db.query(query, UserSchema, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > getUsers: '+err);
                callback([]);
            }
            callback(rows);
        })
    },
    getUser: function(user_id, callback) {
        var query = 'SELECT * FROM User WHERE user_id='+user_id+';';
        u.getLogger().db(query);

        db.query(query, UserSchema, function(err, rows) {
            if(err) {
              u.getLogger().error('DB error: model.js > getUser: '+err);
              callback([]);
            }
            callback(rows);
        })
    },
    addUser: function(username, group, callback) {

        var params = [username, group, 1]
                        .map(function(s){return '"'+s+'"';});

        var query = 'INSERT INTO "User" VALUES( (SELECT max(user_id)+1 FROM "User"), '+params.join(', ')+');';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > addUser: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    deleteUserByUsername: function(username, callback) {
        var query = 'DELETE FROM "User" WHERE "username"="'+username+'";';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > deleteUserByUsername: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    deleteUserById: function(id, callback) {
        var query = 'DELETE FROM "User" WHERE "user_id"="'+id+'";';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > deleteUserById: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    modifyUser: function(id, username, group, active, callback) {
        var query = 'UPDATE User SET username="'+username+
                                  '", groups="'+group+
                                  '", active="'+active+'" WHERE user_id='+id+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > modifyUser: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    setUserName: function(id, username, callback) {
        var query = 'UPDATE User SET username="'+username+
                    '" WHERE user_id='+id+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > setUserName: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    addTag: function(user_id, type, value, callback) {
        var params = [user_id, type, value, 1]
                        .map(function(s){return '"'+s+'"';});

        var query = 'INSERT INTO "Tag" VALUES( (SELECT max(tag_id)+1 FROM "Tag"), '+params.join(', ')+');';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > addTag: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    setTagActive: function(tag_value, active, callback) {
        var query = 'UPDATE Tag SET active='+active+
                    ' WHERE value="'+tag_value+'";';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > setTagActive: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    deleteTagByValue: function(tag_value, callback) {
        var query = 'DELETE FROM "Tag" WHERE "value"="'+tag_value+'";';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > deleteTagByValue: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    addMachine: function(machine_id, current_ip, callback) {
        current_ip = '"'+current_ip+'"';
        var params = [machine_id, current_ip, u.getNow(), 0, 1];

        var query = 'INSERT INTO "Node" VALUES( '+params.join(', ')+');';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > addMachine: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    deleteMachine: function(machine_id) {
        var query = 'DELETE FROM "Node" WHERE "node_id"='+machine_id+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > deleteMachine: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    // TODO: check on ip already exists
    // TODO: check on id already exists
    modifyMachine: function(machine_id, current_ip, last_seen, status, active, callback) {
        var query = 'UPDATE Node SET current_ip="'+current_ip+'"'+
                                  ', date_last_seen='+last_seen+
                                  ', status='+status+
                                  ', active='+active+
                                ' WHERE node_id='+parseInt(machine_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > modifyMachine: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    setMachineSeenTime: function(machine_id, last_seen, callback) {
        var query = 'UPDATE Node SET date_last_seen='+last_seen+
                                ' WHERE node_id='+parseInt(machine_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > setMachineSeenTime: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    setMachineStatus: function(machine_id, status, callback) {
        var query = 'UPDATE Node SET status='+status+
                                ' WHERE node_id='+parseInt(machine_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > setMachineStatus: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    // TODO: check user exists
    // TODO: check node exists
    // TODO: check start is valid start time (in the future)
    // TODO: check expected duretion is valid duration time (in hours)
    addReservation: function(user_id, node_id, expected_start, expected_duration, callback) {
        var params = [
            parseInt(user_id), 
            parseInt(node_id), 
            parseInt(expected_start), 
            -1, 
            parseInt(expected_duration), 
            -1, 
            0];
        var query = 'INSERT INTO "Reservation" VALUES( '+
                    '(SELECT max(reservation_id)+1 FROM "Reservation"), '+
                    params.join(', ')+');';
        u.getLogger().db(query);
        
        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > addReservation: '+err);

                callback(false);
            } else {
                query = 'SELECT max(reservation_id) FROM "Reservation"';
                db.query(query, function(err, rows) {
                    if(err) {
                        console.log('model.js > addReservation > inner > ... db error ...'+err);
                        callback(false);
                    } else {
                        callback(rows[0]);
                    }
                });
            }
        });
    },
    deleteReservation: function(reservation_id, callback) {
        var query = 'DELETE FROM "Reservation" WHERE "reservation_id"='+reservation_id+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > deleteReservation: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    },
    modifyReservation: function(reservation_id, user_id, node_id, expected_start, actual_start, expected_duration, actual_duration, active, callback) {

        var query = 'UPDATE Reservation SET user_id="'+user_id+'"'+
                                         ', node_id='+node_id+
                                         ', expected_start='+expected_start+
                                         ', actual_start='+actual_start+
                                         ', expected_duration='+expected_duration+
                                         ', actual_duration='+actual_duration+
                                         ' WHERE reservation_id='+parseInt(reservation_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > modifyReservation: '+err);
                callback(false);
            } else {
                callback(false);
            }
        });
    },
    setReservationActualDuration: function(reservation_id, actual_duration, callback) {
        var query = 'UPDATE Reservation SET actual_duration='+actual_duration+
                                         ' WHERE reservation_id='+parseInt(reservation_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > setReservationActualDuration: '+err);

                callback(false);
            } else {
                callback(false);
            }
        });
    },
    setReservationActive: function(reservation_id, active, callback) {
        var query = 'UPDATE Reservation SET active='+active+
                    ' WHERE reservation_id='+parseInt(reservation_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > setReservationActive: '+err);
                callback(false);
            } else {
                callback(false);
            }
        });
    },
    setReservationActualStartTime: function(reservation_id, actual_start, callback) {
        var query = 'UPDATE Reservation SET actual_start='+actual_start+
                    ' WHERE reservation_id='+parseInt(reservation_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > setReservationActualStartTime: '+err);
                callback(false);
            } else {
                callback(false);
            }
        });
    },
    findUserByUsername: function (username, callback) {
        var rowType = {
            id: Number,
            username: String,
            group: String
        };
        var query = 'SELECT * FROM User WHERE username = "'+username+'";';
        u.getLogger().db(query);

        db.query(query, rowType, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > findUserByUsername: '+err);
                callback(false);
            } else {
                console.log('model > findUserByUsername: '+rows[0]);
                callback(rows[0]);
            }
        });
    },
    findUserById: function (user_id, callback) {
        var rowType = {
            id: Number,
            salt: String,
            group: String
        };
        var query = 'SELECT * FROM User WHERE user_id = "'+user_id+'";';
        u.getLogger().db(query);

        db.query(query, rowType, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > findUserById: '+err);
                callback(false);
            } else {
                callback(rows[0]);
            }
        });
    },
    findTagByUsername: function(username, callback) {
        var query = 'SELECT * FROM Tag WHERE user_id = '+
                    '(SELECT user_id FROM User WHERE username="'+username+'");';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > findTagByUsername: '+err);
                callback(false);
            } else {
                callback(rows);
            }
        });
    },
    findTagById: function(id, callback) {
        var query = 'SELECT * FROM Tag WHERE user_id = '+id+';';
        u.getLogger().db(query);

        db.query(query, TagSchema, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > findTagById: '+err);
                callback(false);
            } else {
                callback(rows);
            }
        });
    },
    findUserByTagValue: function(tag_value, callback) {
        var query = 'SELECT * FROM User WHERE user_id ='+
                    '(SELECT user_id From Tag WHERE value = "'+tag_value+'")';
        u.getLogger().db(query);

        db.query(query, UserSchema, function(err, rows) {
            if(err) {
                u.getLogger().error('DB error: model.js > findUserByTagValue: '+err);
                callback(false);
            } else {
                callback(rows);
            }
        });  
    },
    findLastTagInMachine: function(machine_id, callback) {

    },
    findMachineUsedMore: function(machine_id, callback) {

    },
    findAllReservationByUsername: function(username, callback) {

    }


}