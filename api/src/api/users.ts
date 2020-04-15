import users from '../models/users';

export function setUsers(req, res) {
    console.log('\n/setUsers : ', req.body);
    try {
        if (req.body === undefined ||
            req.body === null ||
            req.body.userAccounts === undefined) {
            res.json({
                status: 'FAILED',
                message: "Invalid req"
            })
            return;
        }
        users.insertMany(req.body.userAccounts, (error, doc) => {
            if (error) {
                res.json({
                    status: 'FAILED',
                    message: error
                })
                return;
            }
            res.json({
                status: 'SUCCESS',
                message: "Users added Succesfully."
            })
        });
    } catch (error) {
        res.json({
            status: 'FAILED',
            message: error
        })
    }
}

export function updateUsers(req, res) {
    console.log('/setUsers : ', req.body);
    try {
        if (req.body === undefined ||
            req.body === null ||
            req.body.userAccounts === undefined) {
            res.json({
                status: 'FAILED',
                message: "Invalid req"
            })
            return;
        }
        users.insertMany(req.body.userAccounts, (error, doc) => {
            if (error) {
                res.json({
                    status: 'FAILED',
                    message: error
                })
                return;
            }
            res.json({
                status: 'SUCCESS',
                message: "Users updated Succesfully."
            })
        });
    } catch (error) {
        res.json({
            status: 'FAILED',
            message: error
        })
    }
}

export function getUsers(req, res) {
    console.log('/getUsers');
    try {
        users.find({}, (error, users) => {
            if (error) {
                res.json({
                    status: 'FAILED',
                    message: error
                })
                return;
            }
            res.json({
                status: 'SUCCESS',
                message: "Request Succesfully.",
                data: users
            })
        });
    } catch (error) {
        res.json({
            status: 'FAILED',
            message: error
        })
    }
}