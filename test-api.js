const axios = require('axios');
const { User, Plan } = require('./backend/models');
const jwt = require('jsonwebtoken');

(async () => {
    try {
        const user = await User.findOne({ where: { role: 'super_admin' } });
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );
        const res = await axios.get('http://localhost:5000/api/leads', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Response:", res.data);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
        process.exit(1);
    }
})();
