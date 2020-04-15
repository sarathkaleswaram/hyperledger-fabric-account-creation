import logins from '../models/logins';

export default async function login(req, res) {
    console.log('\n/login : ', req.body);
    try {
        if (req.body === undefined ||
            req.body === null ||
            req.body.username === undefined ||
            req.body.password === undefined) {
            res.json({
                status: 'FAILED',
                message: "Invalid Request"
            })
            return;
        }
        let login = await logins.findOne({ username: req.body.username, password: req.body.password }).exec();
        if (login == null) {
            res.json({
                status: 'FAILED',
                message: "Invalid Credentials."
            })
            return;
        }
        res.json({
            status: 'SUCCESS',
            message: "Login Successful."
        })
    } catch (error) {
        res.json({
            status: 'FAILED',
            message: error
        })
    }
}