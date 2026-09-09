const bcrypt = require('bcrypt');
const db = require('./src/config/database');

const CONFIG = {
    username: 'superadmin',
    fullName: 'Super Admin',
    email: 'superadmin@equiply.app',
    password: 'supersuper', 
};

async function seedSuperAdmin() {
    try {
        const hashedPassword = await bcrypt.hash(CONFIG.password, 10);

        const query = `
            INSERT INTO users
                (companyId, unitId, username, fullName, email, password, role, status)
            VALUES
                (NULL, NULL, ?, ?, ?, ?, 'superadmin', 'active')
        `;

        const [result] = await db.execute(query, [
            CONFIG.username,
            CONFIG.fullName,
            CONFIG.email,
            hashedPassword,
        ]);

        console.log('Super admin created with id:', result.insertId);
        process.exit(0);
    } catch (err) {
        console.error('Failed to seed super admin:', err.message);
        process.exit(1);
    }
}

seedSuperAdmin();