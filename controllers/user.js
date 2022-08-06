const pool = require('../model/pool');

const { isValidEmail, hashPassword, generateToken, comparePassword } = require('../helpers');


exports.getUser = (request, response) => {
    const { id } = req.params;
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if ((results.rows.length || []) === 0) {
            return response.status(400).json({
                error: 'No Users found'
            });
        }
        if (error) throw error;
        response.status(200).json(results.rows);
    });
};

exports.getAllUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if ((results.rows.length || []) === 0) {
            return response.status(400).json({
                error: 'No Users found'
            });
        }
        if (error) throw error;
        response.status(200).json(results.rows);
    });
};

exports.createUser = (request, response) => {
    const { password, email, username } = request.body || {};

    if (!email || !password || !username) {
        return response.status(400).json({
            error: 'Some values are missing'
        });
    }

    if (!isValidEmail(email)) {
        return response.status(400).json({
            error: 'Please enter a valid email address'
        });
    }

    const getDate = new Date();

    const createQuery = `INSERT INTO users(username, email, password, created_date, modified_date) VALUES($1, $2, $3, $4, $5) returning *`;
    const values = [ username, email, hashPassword(password), getDate, getDate];

    pool.query(createQuery, values, (error, results) => {
        if (error?.routine === '_bt_check_unique') {
            return response.status(400).json({
                error: 'User with that EMAIL already exist'
            })
        }
        const token = generateToken(results.rows[0].id);
        return response.status(200).json({ token });
    })
}

exports.loginUser = async (request, response) => {
    const { password, email, username } = request.body || {};

    if (!email || !password || !username) {
        return response.status(400).json({
            error: 'Some values are missing'
        });
    }

    if (!isValidEmail(email)) {
        return response.status(400).json({
            error: 'Please enter a valid email address'
        });
    }
    const checkEmail = 'SELECT * FROM users WHERE email = $1';
    const getCount = 'SELECT login_attempts FROM users WHERE email = $1';
    const getBlockedDate = 'SELECT blocked_date FROM users WHERE email = $1';
    const updateCount = 'UPDATE users SET login_attempts = $1 WHERE email = $2';
    const updateBlockDate = 'UPDATE users SET blocked_date = $1 WHERE email = $2';

    const blocked_counts = await pool.query(getCount, [email]).then(results => {
        return results?.rows[0]?.login_attempts || 0;
    });

    pool.query(checkEmail, [email], async (error, results) => {
        const { rows } = results || {};

        if (!rows[0]) {
            return response.status(400).json({
                error: 'Email you provided is incorrect'
            });
        }

        const then = new Date(getBlockedDate);
        const now = new Date();

        const msBetweenDates = Math.abs(then.getTime() - now.getTime());
        const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);

        if(!comparePassword(rows[0].password, password)) {
            if (blocked_counts > 0 && blocked_counts < 5) {
                pool.query(updateCount, [blocked_counts + 1, email], (error, results) => {
                    const {rows} = results || {};
                    return response.status(400).json({
                        message: `Failed to attempt login - ${rows[0].login_attempts}`
                    });
                });
            } else if (hoursBetweenDates < 24 && blocked_counts === 5) {
                return response.status(400).json({
                    message: 'You have been blocked for 24 hours'
                });
            } else if (blocked_counts === 5) {
                pool.query(updateBlockDate, [new Date(), email], (error, results) => {
                    if (error) throw error;
                    return response.status(400).json({
                        message: 'You have exceeded the maximum number of login attempts. Please try again after 24 hr.'
                    });
                });
            }

            return response.status(400).json({
                error: 'The credentials you provided is incorrect'
            });
        }

        if (hoursBetweenDates > 24 && blocked_counts === 5) {
            await pool.query(updateCount, [0, email], (error, results) => {
                return results;
            });
        }

        const token = generateToken(rows[0].id);
        return response.status(200).json({ token });
    })
}

exports.deleteUser = (request, response) => {
    const deleteQuery = 'DELETE FROM users WHERE id=$1 returning *';

    pool.query(deleteQuery, [request.user.id], (error, results) => {
        const { rows } = results || {};

        if (!rows[0]) {
            return response.status(400).json({
                error: 'User not found'
            });
        }

        return res.status(200).json({ message: 'User deleted' });

    })
}
